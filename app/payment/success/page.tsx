"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PLAN_LABELS, DURATION_LABELS } from "@/app/config/pricing";

function SuccessContent() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId");
  const plan = searchParams.get("plan") as "basic" | "premium" | null;
  const duration = searchParams.get("duration") as "7" | "30" | "permanent" | null;
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!caseId || !plan || !duration) return;
    const expiresAt = duration === "permanent" ? null : new Date(Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toLocaleString("zh-CN");
    const timelineEntry = `✅ 付款成功 · 方案：${PLAN_LABELS[plan]} · 时长：${DURATION_LABELS[duration]} · ${now}`;
    const stored = localStorage.getItem("cases");
    if (stored) {
      const cases = JSON.parse(stored);
      if (cases[caseId]) {
        cases[caseId].status = "未回应"; cases[caseId].paid = true; cases[caseId].plan = plan;
        cases[caseId].duration = duration; cases[caseId].expiresAt = expiresAt;
        if (!cases[caseId].timeline) cases[caseId].timeline = [];
        cases[caseId].timeline.push(timelineEntry);
        localStorage.setItem("cases", JSON.stringify(cases));
        localStorage.removeItem("pending_payment");
      }
    }
    fetch("/api/cases", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: caseId, status: "未回应", paid: true, plan, duration, expires_at: expiresAt }) }).catch(console.error);
    setDone(true);
  }, [caseId, plan, duration]);

  return (
    <main className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
      <div className="max-w-[500px] mx-auto px-8 text-center">

        <div className="w-20 h-20 rounded-full bg-green-100 border border-green-200 flex items-center justify-center mx-auto mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-[#0F2A44] mb-3">付款成功！</h1>
        <p className="text-[#6B7280] mb-2">您的纠纷记录已成功发布。</p>

        {plan && duration && (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-8 mt-6 text-left shadow-sm">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-[#6B7280]">发布方案</span>
              <span className={`font-medium ${plan === "premium" ? "text-yellow-600" : "text-[#2B6CB0]"}`}>{PLAN_LABELS[plan]}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">展示时长</span>
              <span className="text-[#1F2937]">{DURATION_LABELS[duration]}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {caseId && (
            <Link href={`/case/${caseId}`} className="w-full bg-[#2B6CB0] hover:bg-[#2563a0] px-6 py-3 rounded-xl text-sm font-medium transition text-white">
              查看我的记录
            </Link>
          )}
          <Link href="/" className="w-full border border-[#E5E7EB] hover:border-[#CBD5E0] px-6 py-3 rounded-xl text-sm transition text-[#6B7280] hover:text-[#1F2937]">
            返回首页
          </Link>
        </div>

      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#F5F7FA]" />}><SuccessContent /></Suspense>;
}