import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PLAN_LABELS } from "@/app/config/pricing";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { caseId, plan, duration, price, company } = body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: price * 100,
      currency: "usd",
      payment_method_types: ["card", "wechat_pay"],
      payment_method_options: {
        wechat_pay: { client: "web" },
      },
      metadata: { caseId, plan, duration },
      description: `${PLAN_LABELS[plan as keyof typeof PLAN_LABELS]} · ${company}`,
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error("Stripe error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
