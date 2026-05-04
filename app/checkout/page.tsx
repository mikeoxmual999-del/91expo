"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PLAN_LABELS } from "../config/pricing";

type PendingPayment = {
  caseId: string;
  plan: "basic" | "premium";
  duration: string;
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
    const p = JSON.parse(stored);
    setPending(p);

    // load case from DB first
    const loadCase = async () => {
      try {
        const res = await fetch(`/api/cases?id=${caseId}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.id) { setCaseData(data); return; }
        }
      } catch {}
      // fallback localStorage
      const cases = localStorage.getItem("cases");
      if (cases) setCaseData(JSON.parse(cases)[caseId]);
    };
    loadCase();
  }, [caseId]);

  const handlePay = async () => {
    if (!pending || !caseData) return;
    setPaying(true);
    try {
      // Save case to DB as unpaid first (ignore error if already exists)
      await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: caseId,
          company: caseData.company,
          amount: caseData.amount,
          status: "待付款",
          type: caseData.type || "未分类",
          description: caseData.description || caseData.desc || "",
          creator: caseData.creator || null,
          paid: false,
          plan: pending.plan,
          duration: pending.duration,
          expires_at: null,
          timeline: [],
        }),
      }).catch(() => {}); // silently ignore if already exists

      const res = await fetch("/api/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          plan: pending.plan,
          duration: pending.duration,
          price: pending.price,
          company: caseData.company,
        }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { alert("付款初始化失败，请重试"); setPaying(false); }
    } catch { alert("发生错误，请重试"); setPaying(false); }
  };

  if (!pending || !caseData) return null;

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

        {/* STEPS */}
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

        {/* CASE SUMMARY */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 md:p-6 mb-5 shadow-sm">
          <div className="text-xs text-[#6B7280] uppercase tracking-widest mb-3 font-medium">纠纷信息</div>
          <div className="text-[#1F2937] font-semibold mb-1">{caseData.company}</div>
          <div className="text-[#2B6CB0] font-bold mb-2">{caseData.amount}</div>
          <div className="text-[#4B5563] text-sm line-clamp-2">{caseData.description || caseData.desc}</div>
        </div>

        {/* ORDER SUMMARY */}
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
                  <span>永久发布</span><span>$15 USD</span>
                </div>
                <div className="flex justify-between text-xs text-[#9CA3AF]">
                  <span>置顶推广 7 天</span><span>+$10 USD</span>
                </div>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-[#1F2937] font-semibold">应付金额</span>
              <span className="text-3xl font-bold text-[#0F2A44]">${pending.price}<span className="text-[#6B7280] text-sm font-normal ml-1">USD</span></span>
            </div>
          </div>
        </div>

        <button onClick={handlePay} disabled={paying}
          className={`w-full py-4 rounded-xl text-base font-semibold transition text-white disabled:opacity-50 disabled:cursor-not-allowed ${isPremium ? "bg-yellow-500 hover:bg-yellow-400" : "bg-[#2B6CB0] hover:bg-[#2563a0]"}`}>
          {paying ? "处理中..." : `立即付款 $${pending.price} USD`}
        </button>
        <p className="text-center text-[#9CA3AF] text-xs mt-4">付款由 Stripe 安全处理 · 支持信用卡 · WeChat Pay · 更多</p>

      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#F5F7FA]" />}><CheckoutContent /></Suspense>;
}