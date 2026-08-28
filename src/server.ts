import "./lib/error-capture";

import * as Sentry from "@sentry/cloudflare";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { captureServerException } from "./lib/sentry-server";
import { verifyCampayWebhookSignature } from "./lib/campay";
import { supabaseAdmin } from "./integrations/supabase/client.server";
import { applySecurityHeaders } from "./lib/security-headers";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  const recoveredError = consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`);
  console.error(recoveredError);
  captureServerException(recoveredError);
  return brandedErrorResponse();
}

async function handleCampayWebhook(request: Request): Promise<Response> {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const signature = typeof payload.signature === "string" ? payload.signature : "";
  try {
    await verifyCampayWebhookSignature(signature);
  } catch (error) {
    console.error("CamPay webhook signature verification failed:", error);
    captureServerException(error);
    return new Response("Invalid signature", { status: 401 });
  }

  const status = payload.status;
  const externalReference = typeof payload.external_reference === "string" ? payload.external_reference : "";
  const reference = typeof payload.reference === "string" ? payload.reference : "";

  if (status === "SUCCESSFUL" && externalReference) {
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: "paid" })
      .eq("id", externalReference)
      .eq("campay_reference", reference);
    if (error) {
      console.error("CamPay webhook: failed to mark order paid:", error);
      captureServerException(error);
    }
  }

  // CamPay expects a 200 regardless of outcome once the signature is valid —
  // returning an error here would just make it retry the same webhook.
  return new Response("OK", { status: 200 });
}

const handler = {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/webhooks/campay" && request.method === "POST") {
        return applySecurityHeaders(await handleCampayWebhook(request), request);
      }

      const serverEntry = await getServerEntry();
      const response = await serverEntry.fetch(request, env, ctx);
      return applySecurityHeaders(await normalizeCatastrophicSsrResponse(response), request);
    } catch (error) {
      console.error(error);
      captureServerException(error);
      return applySecurityHeaders(brandedErrorResponse(), request);
    }
  },
};

export default Sentry.withSentry(
  (env: Record<string, string | undefined>) => {
    const dsn = env?.SENTRY_DSN;
    return dsn ? { dsn, tracesSampleRate: 0.1 } : undefined;
  },
  handler,
);
