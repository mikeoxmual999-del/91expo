"use client";
 
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PRICING,
  PLAN_LABELS,
  DURATION_LABELS,
  PLAN_FEATURES,
  type PlanType,
  type DurationType,
} from "../config/pricing";
 
function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId");
 
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("basic");
  const [selectedDuration, setSelectedDuration] = useState<DurationType>("30");
 
  const price = PRICING[selectedPlan][selectedDuration];
 
  useEffect(() => {
    if (!caseId) {
      router.replace("/create");
    }
  }, [caseId]);
 
  const handleContinue = () => {
    // store selection in localStorage temporarily
    localStorage.setItem(
      "pending_payment",
      JSON.stringify({
        caseId,
        plan: selectedPlan,
        duration: selectedDuration,
        price,
      })
    );
    // for now go to confirmation page (Stripe will be added here later)
    router.push(`/checkout?caseId=${caseId}`);
  };
 
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <div className="max-w-[900px] mx-auto px-8 py-16">
 
        {/* HEADER */}
        <div className="mb-12 text-center">
          <div className="text-blue-400 text-sm uppercase tracking-widest mb-3">发布纠纷</div>
          <h1 className="text-3xl font-semibold mb-3">选择发布方案</h1>
          <p className="text-white/40 text-sm">选择适合您的发布类型与时长</p>
        </div>
 
        {/* PLAN SELECTOR */}
        <div className="grid grid-cols-2 gap-6 mb-10">
 
          {/* BASIC */}
          <button
            onClick={() => setSelectedPlan("basic")}
            className={`text-left bg-[#111827] border rounded-2xl p-8 transition ${
              selectedPlan === "basic"
                ? "border-blue-500 ring-1 ring-blue-500"
                : "border-white/10 hover:border-white/20"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-white font-semibold text-lg mb-1">
                  {PLAN_LABELS.basic}
                </div>
                <div className="text-white/40 text-xs">标准展示位置</div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === "basic" ? "border-blue-500 bg-blue-500" : "border-white/30"
              }`}>
                {selectedPlan === "basic" && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>
 
            <ul className="space-y-2 mb-6">
              {PLAN_FEATURES.basic.map((f) => (
                <li key={f} className="flex items-center gap-2 text-white/60 text-sm">
                  <span className="text-blue-400 text-xs">✓</span>
                  {f}
                </li>
              ))}
            </ul>
 
            <div className="text-2xl font-bold text-white">
              从 ${PRICING.basic["7"]}
              <span className="text-white/40 text-sm font-normal ml-1">USD 起</span>
            </div>
          </button>
 
          {/* PREMIUM */}
          <button
            onClick={() => setSelectedPlan("premium")}
            className={`text-left bg-[#111827] border rounded-2xl p-8 transition relative ${
              selectedPlan === "premium"
                ? "border-yellow-500 ring-1 ring-yellow-500"
                : "border-white/10 hover:border-white/20"
            }`}
          >
            {/* BADGE */}
            <div className="absolute -top-3 left-6 bg-yellow-500 text-black text-xs font-semibold px-3 py-1 rounded-full">
              置顶推广
            </div>
 
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-white font-semibold text-lg mb-1">
                  {PLAN_LABELS.premium}
                </div>
                <div className="text-yellow-400/70 text-xs">首页 + 列表顶部展示</div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === "premium" ? "border-yellow-500 bg-yellow-500" : "border-white/30"
              }`}>
                {selectedPlan === "premium" && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>
 
            <ul className="space-y-2 mb-6">
              {PLAN_FEATURES.premium.map((f) => (
                <li key={f} className="flex items-center gap-2 text-white/60 text-sm">
                  <span className="text-yellow-400 text-xs">✓</span>
                  {f}
                </li>
              ))}
            </ul>
 
            <div className="text-2xl font-bold text-white">
              从 ${PRICING.premium["7"]}
              <span className="text-white/40 text-sm font-normal ml-1">USD 起</span>
            </div>
          </button>
 
        </div>
 
        {/* DURATION SELECTOR */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-6">
            选择时长
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {(["7", "30", "permanent"] as DurationType[]).map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDuration(d)}
                className={`py-4 px-6 rounded-xl border text-center transition ${
                  selectedDuration === d
                    ? selectedPlan === "premium"
                      ? "border-yellow-500 bg-yellow-500/10 text-yellow-400"
                      : "border-blue-500 bg-blue-500/10 text-blue-400"
                    : "border-white/10 text-white/50 hover:border-white/20 hover:text-white"
                }`}
              >
                <div className="text-lg font-semibold mb-1">
                  {DURATION_LABELS[d]}
                </div>
                <div className="text-2xl font-bold">
                  ${PRICING[selectedPlan][d]}
                </div>
                <div className="text-xs opacity-50 mt-1">USD</div>
              </button>
            ))}
          </div>
        </div>
 
        {/* ORDER SUMMARY */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-4">
            订单摘要
          </h2>
          <div className="flex justify-between items-center mb-3">
            <span className="text-white/60 text-sm">{PLAN_LABELS[selectedPlan]}</span>
            <span className="text-white text-sm">${PRICING[selectedPlan][selectedDuration]} USD</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-white/60 text-sm">展示时长</span>
            <span className="text-white text-sm">{DURATION_LABELS[selectedDuration]}</span>
          </div>
          <div className="border-t border-white/10 mt-4 pt-4 flex justify-between items-center">
            <span className="text-white font-semibold">总计</span>
            <span className="text-2xl font-bold text-white">${price} <span className="text-white/40 text-sm font-normal">USD</span></span>
          </div>
        </div>
 
        {/* CTA */}
        <button
          onClick={handleContinue}
          className={`w-full py-4 rounded-xl text-base font-medium transition ${
            selectedPlan === "premium"
              ? "bg-yellow-500 hover:bg-yellow-400 text-black"
              : "bg-blue-600 hover:bg-blue-500 text-white"
          }`}
        >
          继续付款 → ${price} USD
        </button>
 
        <p className="text-center text-white/20 text-xs mt-4">
          支持 WeChat Pay · Alipay · 信用卡 · 加密货币
        </p>
 
      </div>
    </main>
  );
}
 
export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0F14]" />}>
      <PricingContent />
    </Suspense>
  );
}