"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PRICING, PLAN_LABELS, DURATION_LABELS, PLAN_FEATURES, type PlanType, type DurationType } from "../config/pricing";

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId");
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("basic");
  const [selectedDuration, setSelectedDuration] = useState<DurationType>("30");
  const price = PRICING[selectedPlan][selectedDuration];

  useEffect(() => { if (!caseId) router.replace("/create"); }, [caseId]);

  const handleContinue = () => {
    localStorage.setItem("pending_payment", JSON.stringify({ caseId, plan: selectedPlan, duration: selectedDuration, price }));
    router.push(`/checkout?caseId=${caseId}`);
  };

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1F2937]">
      <div className="max-w-[900px] mx-auto px-8 py-16">

        <div className="mb-12 text-center">
          <div className="text-[#2B6CB0] text-sm uppercase tracking-widest mb-3 font-medium">发布纠纷</div>
          <h1 className="text-3xl font-bold text-[#0F2A44] mb-3">选择发布方案</h1>
          <p className="text-[#6B7280] text-sm">选择适合您的发布类型与时长</p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-10">

          {/* BASIC */}
          <button onClick={() => setSelectedPlan("basic")} className={`text-left bg-white border rounded-2xl p-8 transition shadow-sm ${selectedPlan === "basic" ? "border-[#2B6CB0] ring-1 ring-[#2B6CB0]" : "border-[#E5E7EB] hover:border-[#CBD5E0]"}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-[#1F2937] font-semibold text-lg mb-1">{PLAN_LABELS.basic}</div>
                <div className="text-[#6B7280] text-xs">标准展示位置</div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPlan === "basic" ? "border-[#2B6CB0] bg-[#2B6CB0]" : "border-[#D1D5DB]"}`}>
                {selectedPlan === "basic" && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>
            <ul className="space-y-2 mb-6">
              {PLAN_FEATURES.basic.map((f) => (
                <li key={f} className="flex items-center gap-2 text-[#4B5563] text-sm">
                  <span className="text-[#2B6CB0] text-xs">✓</span>{f}
                </li>
              ))}
            </ul>
            <div className="text-2xl font-bold text-[#0F2A44]">从 ${PRICING.basic["7"]}<span className="text-[#6B7280] text-sm font-normal ml-1">USD 起</span></div>
          </button>

          {/* PREMIUM */}
          <button onClick={() => setSelectedPlan("premium")} className={`text-left bg-white border rounded-2xl p-8 transition shadow-sm relative ${selectedPlan === "premium" ? "border-yellow-500 ring-1 ring-yellow-500" : "border-[#E5E7EB] hover:border-[#CBD5E0]"}`}>
            <div className="absolute -top-3 left-6 bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full">置顶推广</div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-[#1F2937] font-semibold text-lg mb-1">{PLAN_LABELS.premium}</div>
                <div className="text-yellow-600 text-xs">首页 + 列表顶部展示</div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPlan === "premium" ? "border-yellow-500 bg-yellow-500" : "border-[#D1D5DB]"}`}>
                {selectedPlan === "premium" && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>
            <ul className="space-y-2 mb-6">
              {PLAN_FEATURES.premium.map((f) => (
                <li key={f} className="flex items-center gap-2 text-[#4B5563] text-sm">
                  <span className="text-yellow-500 text-xs">✓</span>{f}
                </li>
              ))}
            </ul>
            <div className="text-2xl font-bold text-[#0F2A44]">从 ${PRICING.premium["7"]}<span className="text-[#6B7280] text-sm font-normal ml-1">USD 起</span></div>
          </button>

        </div>

        {/* DURATION */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 mb-8 shadow-sm">
          <h2 className="text-sm font-semibold text-[#6B7280] uppercase tracking-widest mb-6">选择时长</h2>
          <div className="grid grid-cols-3 gap-4">
            {(["7", "30", "permanent"] as DurationType[]).map((d) => (
              <button key={d} onClick={() => setSelectedDuration(d)} className={`py-4 px-6 rounded-xl border text-center transition ${
                selectedDuration === d
                  ? selectedPlan === "premium" ? "border-yellow-500 bg-yellow-50 text-yellow-600" : "border-[#2B6CB0] bg-blue-50 text-[#2B6CB0]"
                  : "border-[#E5E7EB] text-[#6B7280] hover:border-[#CBD5E0]"
              }`}>
                <div className="text-lg font-semibold mb-1">{DURATION_LABELS[d]}</div>
                <div className="text-2xl font-bold">${PRICING[selectedPlan][d]}</div>
                <div className="text-xs opacity-50 mt-1">USD</div>
              </button>
            ))}
          </div>
        </div>

        {/* SUMMARY */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 mb-8 shadow-sm">
          <h2 className="text-sm font-semibold text-[#6B7280] uppercase tracking-widest mb-4">订单摘要</h2>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[#6B7280] text-sm">{PLAN_LABELS[selectedPlan]}</span>
            <span className="text-[#1F2937] text-sm">${PRICING[selectedPlan][selectedDuration]} USD</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[#6B7280] text-sm">展示时长</span>
            <span className="text-[#1F2937] text-sm">{DURATION_LABELS[selectedDuration]}</span>
          </div>
          <div className="border-t border-[#E5E7EB] mt-4 pt-4 flex justify-between items-center">
            <span className="text-[#1F2937] font-semibold">总计</span>
            <span className="text-2xl font-bold text-[#0F2A44]">${price} <span className="text-[#6B7280] text-sm font-normal">USD</span></span>
          </div>
        </div>

        <button onClick={handleContinue} className={`w-full py-4 rounded-xl text-base font-semibold transition text-white ${selectedPlan === "premium" ? "bg-yellow-500 hover:bg-yellow-400" : "bg-[#2B6CB0] hover:bg-[#2563a0]"}`}>
          继续付款 → ${price} USD
        </button>
        <p className="text-center text-[#9CA3AF] text-xs mt-4">支持 WeChat Pay · Alipay · 信用卡 · 加密货币</p>

      </div>
    </main>
  );
}

export default function PricingPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#F5F7FA]" />}><PricingContent /></Suspense>;
}