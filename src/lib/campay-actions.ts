import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { initiateCampayCollection, checkCampayTransactionStatus } from "@/lib/campay";

type InitiatePaymentInput = {
  orderId: string;
  amount: number;
  phone: string;
};

export const initiateCampayPayment = createServerFn({ method: "POST" })
  .inputValidator((data: InitiatePaymentInput) => data)
  .handler(async ({ data }) => {
    const ref = data.orderId.slice(0, 8).toUpperCase();
    const result = await initiateCampayCollection({
      amount: data.amount,
      phone: data.phone,
      description: `Clauvera order #${ref}`,
      externalReference: data.orderId,
    });

    const { error } = await supabaseAdmin
      .from("orders")
      .update({ campay_reference: result.reference, payment_method: "campay" })
      .eq("id", data.orderId);
    if (error) throw new Error(`Failed to store CamPay reference: ${error.message}`);

    return result;
  });

type CheckStatusInput = { reference: string };

export const checkCampayPaymentStatus = createServerFn({ method: "POST" })
  .inputValidator((data: CheckStatusInput) => data)
  .handler(async ({ data }) => {
    const status = await checkCampayTransactionStatus(data.reference);

    if (status.status === "SUCCESSFUL") {
      const { error } = await supabaseAdmin
        .from("orders")
        .update({ status: "paid" })
        .eq("campay_reference", data.reference);
      if (error) console.error("Failed to mark order as paid after CamPay success:", error);
    }

    return status;
  });
