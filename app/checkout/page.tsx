"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { PLAN_LABELS } from "../config/pricing";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type PendingPayment = {
  caseId: string;
  plan: "basic" | "premium";
  duration: string;
  price: number;
};

function WeChatModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 max-w-[400px] w-full shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl">💬</div>
          <h3 className="text-lg font-bold text-[#0F2A44]">微信支付说明</h3>
        </div>
        <div className="space-y-3 text-sm text-[#4B5563] mb-6">
          <p>使用微信支付前，请注意以下事项：</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">⚠️</span>
              <span>手机端暂不支持直接跳转微信App，将显示二维码</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">💡</span>
              <span>建议使用电脑扫码支付，体验最佳</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">📱</span>
              <span>手机用户可截图二维码，在微信扫一扫中选择从相册识别</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✅</span>
              <span>在微信内打开本页面可直接完成支付，无需扫码</span>
            </li>
          </ul>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-[#E5E7EB] text-sm text-[#6B7280] hover:border-[#CBD5E0] transition">
            返回选择
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-medium transition">
            我已了解，继续支付
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentForm({ pending, caseId, isPremium }: { pending: PendingPayment; caseId: string; isPremium: boolean }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showWeChatModal, setShowWeChatModal] = useState(false);
  const [weChatConfirmed, setWeChatConfirmed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    if (selectedMethod === "wechat_pay" && !weChatConfirmed) {
      setShowWeChatModal(true);
      return;
    }

    setPaying(true);
    setError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success?caseId=${caseId}&plan=${pending.plan}&duration=${pending.duration}`,
      },
    });

    if (error) {
      setError(error.message || "付款失败，请重试");
      setPaying(false);
    }
  };

  const handleWeChatConfirm = async () => {
    setShowWeChatModal(false);
    setWeChatConfirmed(true);
    if (!stripe || !elements) return;
    setPaying(true);
    setError(null);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success?caseId=${caseId}&plan=${pending.plan}&duration=${pending.duration}`,
      },
    });
    if (error) {
      setError(error.message || "付款失败，请重试");
      setPaying(false);
    }
  };

  return (
    <>
      {showWeChatModal && (
        <WeChatModal
          onConfirm={handleWeChatConfirm}
          onCancel={() => setShowWeChatModal(false)}
        />
      )}
      <form onSubmit={handleSubmit}>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 md:p-6 mb-6 shadow-sm">
          <div className="text-xs text-[#6B7280] uppercase tracking-widest mb-4 font-medium">选择付款方式</div>
          <PaymentElement onChange={(e) => {
            if (e.value?.type) setSelectedMethod(e.value.type);
          }} />
        </div>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <button type="submit" disabled={paying || !stripe}
          className={`w-full py-4 rounded-xl text-base font-semibold transition text-white disabled:opacity-50 disabled:cursor-not-allowed ${isPremium ? "bg-yellow-500 hover:bg-yellow-400" : "bg-[#2B6CB0] hover:bg-[#2563a0]"}`}>
          {paying ? "处理中..." : `立即付款 $${pending.price} USD`}
        </button>
        <p className="text-center text-[#9CA3AF] text-xs mt-4">付款由 Stripe 安全处理 · 支持信用卡 · WeChat Pay</p>
      </form>
    </>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId");
  const [pending, setPending] = useState<PendingPayment | null>(null);
  const [caseData, setCaseData] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId) { router.replace("/create"); return; }
    const stored = localStorage.getItem("pending_payment");
    if (!stored) { router.replace("/create"); return; }
    const p = JSON.parse(stored);
    setPending(p);

    const loadCase = async () => {
      let loadedCase = null;
      try {
        const res = await fetch(`/api/cases?id=${caseId}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.id) loadedCase = data;
        }
      } catch {}

      if (!loadedCase) {
        const cases = localStorage.getItem("cases");
        if (cases) loadedCase = JSON.parse(cases)[caseId];
      }

      if (!loadedCase) return;
      setCaseData(loadedCase);

      const user = localStorage.getItem("user");
      fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: caseId,
          company: loadedCase.company,
          amount: loadedCase.amount,
          status: "待付款",
          type: loadedCase.type || "未分类",
          description: loadedCase.description || loadedCase.desc || "",
          creator: loadedCase.creator || user || null,
          paid: false,
          plan: p.plan,
          duration: p.duration,
          expires_at: null,
          timeline: loadedCase.timeline || [],
        }),
      }).catch(() => {});

      const res = await fetch("/api/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          plan: p.plan,
          duration: p.duration,
          price: p.price,
          company: loadedCase.company,
        }),
      });
      const data = await res.json();
      if (data.clientSecret) setClientSecret(data.clientSecret);
    };

    loadCase();
  }, [caseId]);

  if (!pending || !caseData || !clientSecret) return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
      <div className="text-[#6B7280] text-sm">加载中...</div>
    </div>
  );

  const isPremium = pending.plan === "premium";

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1F2937]">
      <div className="max-w-[600px] mx-auto px-4 md:px-8 py-10 md:py-16">

        <Link href={`/pricing?caseId=${caseId}`} className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] text-sm mb-8 transition">
          ← 返回选择方案
        </Link>

        <div className="mb-8">
          <div className="text-[#2B6CB0] text-sm uppercase tracking-widest mb-3 font-medium">最后一步</div>
          <h1 className="text-2xl font-bold text-[#0F2A44] mb-2">确认并付款</h1>
          <p className="text-[#6B7280] text-sm">确认订单信息后完成付款，记录将立即公开。</p>
        </div>

        <div className="flex items-center gap-3 mb-8 md:mb-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">✓</div>
            <span className="hidden sm:inline text-[#6B7280] text-sm">填写信息</span>
          </div>
          <div className="flex-1 h-px bg-[#E5E7EB]" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">✓</div>
            <span className="hidden sm:inline text-[#6B7280] text-sm">选择方案</span>
          </div>
          <div className="flex-1 h-px bg-[#E5E7EB]" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#2B6CB0] text-white text-xs flex items-center justify-center font-medium">3</div>
            <span className="hidden sm:inline text-[#1F2937] text-sm font-medium">完成付款</span>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 md:p-6 mb-5 shadow-sm">
          <div className="text-xs text-[#6B7280] uppercase tracking-widest mb-3 font-medium">纠纷信息</div>
          <div className="text-[#1F2937] font-semibold mb-1">{caseData.company}</div>
          <div className="text-[#2B6CB0] font-bold mb-2">{caseData.amount}</div>
          <div className="text-[#4B5563] text-sm line-clamp-2">{caseData.description || caseData.desc}</div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 md:p-6 mb-6 shadow-sm">
          <div className="text-xs text-[#6B7280] uppercase tracking-widest mb-4 font-medium">订单详情</div>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">发布方案</span>
              <span className={`font-medium ${isPremium ? "text-yellow-600" : "text-[#2B6CB0]"}`}>
                {PLAN_LABELS[pending.plan]}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">展示时长</span>
              <span className="text-[#1F2937]">永久</span>
            </div>
            {isPremium && (
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">置顶推广</span>
                <span className="text-yellow-600">7 天</span>
              </div>
            )}
          </div>
          <div className="border-t border-[#E5E7EB] pt-4">
            {isPremium && (
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-xs text-[#9CA3AF]">
                  <span>永久发布</span><span>$39.99 USD</span>
                </div>
                <div className="flex justify-between text-xs text-[#9CA3AF]">
                  <span>置顶推广 7 天</span><span>+$20 USD</span>
                </div>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-[#1F2937] font-semibold">应付金额</span>
              <span className="text-3xl font-bold text-[#0F2A44]">${pending.price}<span className="text-[#6B7280] text-sm font-normal ml-1">USD</span></span>
            </div>
          </div>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
          <PaymentForm pending={pending} caseId={caseId!} isPremium={isPremium} />
        </Elements>

      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#F5F7FA]" />}><CheckoutContent /></Suspense>;
}
