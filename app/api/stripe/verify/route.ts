import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

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
      return NextResponse.json({
        success: true,
        caseId: paymentIntent.metadata.caseId,
        plan: paymentIntent.metadata.plan,
        duration: paymentIntent.metadata.duration,
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
