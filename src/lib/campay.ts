// Server-only. Never import this from client-side code — it reads a
// permanent access token that must never reach the browser bundle.
import { jwtVerify } from "jose";

const CAMPAY_BASE_URL = "https://demo.campay.net/api";

function getCampayToken(): string {
  const token = process.env.CAMPAY_PERMANENT_TOKEN;
  if (!token) throw new Error("CAMPAY_PERMANENT_TOKEN is not configured.");
  return token;
}

function getCampayWebhookKey(): string {
  const key = process.env.CAMPAY_WEBHOOK_KEY;
  if (!key) throw new Error("CAMPAY_WEBHOOK_KEY is not configured.");
  return key;
}

export type CampayCollectionResult = {
  reference: string;
  ussd_code: string;
  operator: string;
};

export async function initiateCampayCollection(params: {
  amount: number;
  phone: string;
  description: string;
  externalReference: string;
}): Promise<CampayCollectionResult> {
  const res = await fetch(`${CAMPAY_BASE_URL}/collect/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${getCampayToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: String(Math.round(params.amount)),
      currency: "XAF",
      from: params.phone,
      description: params.description,
      external_reference: params.externalReference,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`CamPay collection request failed (${res.status}): ${body}`);
  }

  return res.json();
}

export type CampayTransactionStatus = {
  status: "PENDING" | "SUCCESSFUL" | "FAILED";
  reference: string;
  amount?: string;
  currency?: string;
  operator?: string;
  external_reference?: string;
  reason?: string;
};

export async function checkCampayTransactionStatus(reference: string): Promise<CampayTransactionStatus> {
  const res = await fetch(`${CAMPAY_BASE_URL}/transaction/${reference}/`, {
    headers: { Authorization: `Token ${getCampayToken()}` },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`CamPay status check failed (${res.status}): ${body}`);
  }

  return res.json();
}

/**
 * Verifies a CamPay webhook's `signature` field (a JWT signed with the
 * app's webhook key using HS256). Throws if invalid or expired — callers
 * must treat a thrown error as "reject this webhook", never as a soft
 * failure to fall back on.
 */
export async function verifyCampayWebhookSignature(signature: string): Promise<void> {
  const secret = new TextEncoder().encode(getCampayWebhookKey());
  await jwtVerify(signature, secret, { algorithms: ["HS256"] });
}
