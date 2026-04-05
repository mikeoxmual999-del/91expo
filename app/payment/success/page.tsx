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
 
    const stored = localStorage.getItem("cases");
    if (!stored) return;
 
    const cases = JSON.parse(stored);
    if (cases[caseId]) {
      cases[caseId].status = "未回应";
      cases[caseId].paid = true;
      cases[caseId].plan = plan;
      cases[caseId].duration = duration;
      cases[caseId].expiresAt =
        duration === "permanent"
          ? null
          : new Date(
              Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000
            ).toISOString();
 
      const now = new Date().toLocaleString("zh-CN");
      if (!cases[caseId].timeline) cases[caseId].timeline = [];
      cases[caseId].timeline.push(
        `✅ 付款成功 · 方案：${PLAN_LABELS[plan]} · 时长：${DURATION_LABELS[duration]} · ${now}`
      );
 
      localStorage.setItem("cases", JSON.stringify(cases));
      localStorage.removeItem("pending_payment");
    }
 
    setDone(true);
  }, [caseId, plan, duration]);
 
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white flex items-center justify-center">
      <div className="max-w-[500px] mx-auto px-8 text-center">
 
        {/* SUCCESS ICON */}
        <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
 
        <h1 className="text-3xl font-semibold mb-3">付款成功！</h1>
        <p className="text-white/50 mb-2">您的纠纷记录已成功发布。</p>
 
        {plan && duration && (
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 mb-8 mt-6 text-left">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-white/50">发布方案</span>
              <span className={`font-medium ${plan === "premium" ? "text-yellow-400" : "text-blue-400"}`}>
                {PLAN_LABELS[plan]}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">展示时长</span>
              <span className="text-white">{DURATION_LABELS[duration]}</span>
            </div>
          </div>
        )}
 
        <div className="flex flex-col gap-3">
          {caseId && (
            <Link
              href={`/case/${caseId}`}
              className="w-full bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl text-sm font-medium transition"
            >
              查看我的记录
            </Link>
          )}
          <Link
            href="/"
            className="w-full border border-white/20 hover:border-white/40 px-6 py-3 rounded-xl text-sm transition text-white/60 hover:text-white"
          >
            返回首页
          </Link>
        </div>
 
      </div>
    </main>
  );
}
 
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0F14]" />}>
      <SuccessContent />
    </Suspense>
  );
}