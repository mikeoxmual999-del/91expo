import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import pool from "@/app/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId } = await req.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, error: "Missing paymentIntentId" },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      const { caseId, plan, duration } = paymentIntent.metadata;
      const expiresAt =
        duration === "permanent"
          ? null
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      try {
        await pool.execute(
          "UPDATE cases SET status = ?, paid = ?, plan = ?, duration = ?, expires_at = ? WHERE id = ?",
          ["未回应", true, plan, duration, expiresAt, caseId]
        );
      } catch (dbError: any) {
        console.error("Stripe verify DB error:", dbError);
        return NextResponse.json(
          { success: false, error: `Database update failed: ${dbError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        caseId,
        plan,
        duration,
      });
    }

    return NextResponse.json({ success: false, status: paymentIntent.status });
  } catch (error: any) {
    console.error("Stripe verify error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
