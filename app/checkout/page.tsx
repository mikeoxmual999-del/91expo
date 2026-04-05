"use client";
 
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PLAN_LABELS, DURATION_LABELS } from "../config/pricing";
 
type PendingPayment = {
  caseId: string;
  plan: "basic" | "premium";
  duration: "7" | "30" | "permanent";
  price: number;
};
 
function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId");
 
  const [pending, setPending] = useState<PendingPayment | null>(null);
  const [caseData, setCaseData] = useState<any>(null);
  const [paying, setPaying] = useState(false);
 
  useEffect(() => {
    if (!caseId) {
      router.replace("/create");
      return;
    }
 
    const stored = localStorage.getItem("pending_payment");
    if (!stored) {
      router.replace("/create");
      return;
    }
 
    const data = JSON.parse(stored);
    setPending(data);
 
    const cases = localStorage.getItem("cases");
    if (cases) {
      const parsed = JSON.parse(cases);
      setCaseData(parsed[caseId]);
    }
  }, [caseId]);
 
  const handlePay = () => {
    // Stripe will be connected here later
    // For now simulate payment success
    setPaying(true);
 
    setTimeout(() => {
      const stored = localStorage.getItem("cases");
      if (!stored || !pending) return;
 
      const cases = JSON.parse(stored);
      if (cases[caseId!]) {
        cases[caseId!].status = "未回应";
        cases[caseId!].paid = true;
        cases[caseId!].plan = pending.plan;
        cases[caseId!].duration = pending.duration;
        cases[caseId!].expiresAt =
          pending.duration === "permanent"
            ? null
            : new Date(
                Date.now() + parseInt(pending.duration) * 24 * 60 * 60 * 1000
              ).toISOString();
 
        const now = new Date().toLocaleString("zh-CN");
        cases[caseId!].timeline.push(
          `✅ 付款成功 · 方案：${PLAN_LABELS[pending.plan]} · 时长：${DURATION_LABELS[pending.duration]} · ${now}`
        );
 
        localStorage.setItem("cases", JSON.stringify(cases));
        localStorage.removeItem("pending_payment");
      }
 
      router.push(`/case/${caseId}`);
    }, 1500);
  };
 
  if (!pending || !caseData) return null;
 
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <div className="max-w-[600px] mx-auto px-8 py-16">
 
        {/* BACK */}
        <Link
          href={`/pricing?caseId=${caseId}`}
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-10 transition"
        >
          ← 返回选择方案
        </Link>
 
        {/* TITLE */}
        <div className="mb-8">
          <div className="text-blue-400 text-sm uppercase tracking-widest mb-3">最后一步</div>
          <h1 className="text-2xl font-semibold mb-2">确认并付款</h1>
          <p className="text-white/40 text-sm">确认订单信息后完成付款，记录将立即公开。</p>
        </div>
 
        {/* STEPS */}
        <div className="flex items-center gap-3 mb-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-medium">✓</div>
            <span className="text-white/40 text-sm">填写信息</span>
          </div>
          <div className="flex-1 h-px bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-medium">✓</div>
            <span className="text-white/40 text-sm">选择方案</span>
          </div>
          <div className="flex-1 h-px bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">3</div>
            <span className="text-white text-sm">完成付款</span>
          </div>
        </div>
 
        {/* CASE SUMMARY */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 mb-6">
          <div className="text-xs text-white/40 uppercase tracking-widest mb-3">纠纷信息</div>
          <div className="text-white font-semibold mb-1">{caseData.company}</div>
          <div className="text-blue-400 font-bold mb-2">{caseData.amount}</div>
          <div className="text-white/50 text-sm">{caseData.desc}</div>
        </div>
 
        {/* ORDER SUMMARY */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 mb-6">
          <div className="text-xs text-white/40 uppercase tracking-widest mb-4">订单详情</div>
 
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">发布方案</span>
              <span className={`font-medium ${pending.plan === "premium" ? "text-yellow-400" : "text-blue-400"}`}>
                {PLAN_LABELS[pending.plan]}
                {pending.plan === "premium" && " 🏆"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">展示时长</span>
              <span className="text-white">{DURATION_LABELS[pending.duration]}</span>
            </div>
            {pending.duration !== "permanent" && (
              <div className="flex justify-between text-sm">
                <span className="text-white/60">到期时间</span>
                <span className="text-white">
                  {new Date(
                    Date.now() + parseInt(pending.duration) * 24 * 60 * 60 * 1000
                  ).toLocaleDateString("zh-CN")}
                </span>
              </div>
            )}
          </div>
 
          <div className="border-t border-white/10 pt-4 flex justify-between items-center">
            <span className="text-white font-semibold">应付金额</span>
            <span className="text-3xl font-bold text-white">
              ${pending.price}
              <span className="text-white/40 text-sm font-normal ml-1">USD</span>
            </span>
          </div>
        </div>
 
        {/* PAYMENT METHODS */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 mb-8">
          <div className="text-xs text-white/40 uppercase tracking-widest mb-4">支持的付款方式</div>
          <div className="flex flex-wrap gap-3">
            {["💳 信用卡 / 借记卡", "WeChat Pay", "Alipay", "₿ 加密货币"].map((method) => (
              <div
                key={method}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white/60"
              >
                {method}
              </div>
            ))}
          </div>
          <p className="text-white/20 text-xs mt-4">
            付款由 Stripe 安全处理，平台不储存您的支付信息。
          </p>
        </div>
 
        {/* PAY BUTTON */}
        <button
          onClick={handlePay}
          disabled={paying}
          className={`w-full py-4 rounded-xl text-base font-semibold transition ${
            pending.plan === "premium"
              ? "bg-yellow-500 hover:bg-yellow-400 text-black"
              : "bg-blue-600 hover:bg-blue-500 text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {paying ? "处理中..." : `立即付款 $${pending.price} USD`}
        </button>
 
        <p className="text-center text-white/20 text-xs mt-4">
          付款成功后记录将立即公开展示
        </p>
 
      </div>
    </main>
  );
}
 
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0F14]" />}>
      <CheckoutContent />
    </Suspense>
  );
}