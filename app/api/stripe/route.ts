import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PLAN_LABELS, DURATION_LABELS } from "@/app/config/pricing";
 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});
 
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { caseId, plan, duration, price, company } = body;
 
    const session = await stripe.checkout.sessions.create({
      payment_method_types: [
        "card",
        "wechat_pay",
        "amazon_pay",
        "cashapp",
        "link",
      ],
      payment_method_options: {
        wechat_pay: {
          client: "web",
        },
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${PLAN_LABELS[plan as keyof typeof PLAN_LABELS]} · ${company}`,
              description: `展示时长：${DURATION_LABELS[duration as keyof typeof DURATION_LABELS]}`,
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?caseId=${caseId}&plan=${plan}&duration=${duration}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?caseId=${caseId}`,
      metadata: {
        caseId,
        plan,
        duration,
      },
    });
 
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}