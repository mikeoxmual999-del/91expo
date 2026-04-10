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
    if (!caseId) { router.replace("/create"); return; }
    const stored = localStorage.getItem("pending_payment");
    if (!stored) { router.replace("/create"); return; }
    setPending(JSON.parse(stored));
    const cases = localStorage.getItem("cases");
    if (cases) setCaseData(JSON.parse(cases)[caseId]);
  }, [caseId]);

  const handlePay = async () => {
    if (!pending || !caseData) return;
    setPaying(true);
    try {
      const res = await fetch("/api/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, plan: pending.plan, duration: pending.duration, price: pending.price, company: caseData.company }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { alert("付款初始化失败，请重试"); setPaying(false); }
    } catch (err) { alert("发生错误，请重试"); setPaying(false); }
  };

  if (!pending || !caseData) return null;

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1F2937]">
      <div className="max-w-[600px] mx-auto px-8 py-16">

        <Link href={`/pricing?caseId=${caseId}`} className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] text-sm mb-10 transition">
          ← 返回选择方案
        </Link>

        <div className="mb-8">
          <div className="text-[#2B6CB0] text-sm uppercase tracking-widest mb-3 font-medium">最后一步</div>
          <h1 className="text-2xl font-bold text-[#0F2A44] mb-2">确认并付款</h1>
          <p className="text-[#6B7280] text-sm">确认订单信息后完成付款，记录将立即公开。</p>
        </div>

        {/* STEPS */}
        <div className="flex items-center gap-3 mb-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-medium">✓</div>
            <span className="text-[#6B7280] text-sm">填写信息</span>
          </div>
          <div className="flex-1 h-px bg-[#E5E7EB]" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-medium">✓</div>
            <span className="text-[#6B7280] text-sm">选择方案</span>
          </div>
          <div className="flex-1 h-px bg-[#E5E7EB]" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#2B6CB0] text-white text-xs flex items-center justify-center font-medium">3</div>
            <span className="text-[#1F2937] text-sm font-medium">完成付款</span>
          </div>
        </div>

        {/* CASE SUMMARY */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-6 shadow-sm">
          <div className="text-xs text-[#6B7280] uppercase tracking-widest mb-3 font-medium">纠纷信息</div>
          <div className="text-[#1F2937] font-semibold mb-1">{caseData.company}</div>
          <div className="text-[#2B6CB0] font-bold mb-2">{caseData.amount}</div>
          <div className="text-[#4B5563] text-sm">{caseData.desc || caseData.description}</div>
        </div>

        {/* ORDER SUMMARY */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-6 shadow-sm">
          <div className="text-xs text-[#6B7280] uppercase tracking-widest mb-4 font-medium">订单详情</div>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">发布方案</span>
              <span className={`font-medium ${pending.plan === "premium" ? "text-yellow-600" : "text-[#2B6CB0]"}`}>
                {PLAN_LABELS[pending.plan]}{pending.plan === "premium" && " 🏆"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">展示时长</span>
              <span className="text-[#1F2937]">{DURATION_LABELS[pending.duration]}</span>
            </div>
            {pending.duration !== "permanent" && (
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">到期时间</span>
                <span className="text-[#1F2937]">{new Date(Date.now() + parseInt(pending.duration) * 24 * 60 * 60 * 1000).toLocaleDateString("zh-CN")}</span>
              </div>
            )}
          </div>
          <div className="border-t border-[#E5E7EB] pt-4 flex justify-between items-center">
            <span className="text-[#1F2937] font-semibold">应付金额</span>
            <span className="text-3xl font-bold text-[#0F2A44]">${pending.price}<span className="text-[#6B7280] text-sm font-normal ml-1">USD</span></span>
          </div>
        </div>

        <button onClick={handlePay} disabled={paying} className={`w-full py-4 rounded-xl text-base font-semibold transition text-white ${pending.plan === "premium" ? "bg-yellow-500 hover:bg-yellow-400" : "bg-[#2B6CB0] hover:bg-[#2563a0]"} disabled:opacity-50 disabled:cursor-not-allowed`}>
          {paying ? "处理中..." : `立即付款 $${pending.price} USD`}
        </button>
        <p className="text-center text-[#9CA3AF] text-xs mt-4">付款由 Stripe 安全处理 · 支持 WeChat Pay · Alipay · 信用卡 · 加密货币</p>

      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#F5F7FA]" />}><CheckoutContent /></Suspense>;
}