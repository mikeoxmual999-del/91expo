"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CoordinationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = searchParams.get("id");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) { router.replace("/login"); return; }
    setUser(storedUser);
    setChecked(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) { alert("请填写联系方式"); return; }
    setSubmitting(true);
    const now = new Date().toLocaleString("zh-CN");

    // save to DB
    try {
      await fetch("/api/coordination", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, amount, desc, contact, submittedBy: user }),
      });
    } catch {}

    // update case timeline in DB
    try {
      const caseRes = await fetch(`/api/cases?id=${caseId}`);
      if (caseRes.ok) {
        const caseData = await caseRes.json();
        const timelineArr = typeof caseData.timeline === "string"
          ? JSON.parse(caseData.timeline) : (caseData.timeline || []);
        const timeline = [...timelineArr, `🤝 ${user} 提交协调请求 · 期望金额：${amount || "未填写"} · ${now}`];
        await fetch("/api/cases", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: caseId, status: "协商中", timeline }),
        });
      }
    } catch {}

    // localStorage backup
    const stored = localStorage.getItem("cases");
    let cases = stored ? JSON.parse(stored) : {};
    if (caseId && cases[caseId]) {
      cases[caseId].status = "协商中";
      if (!cases[caseId].timeline) cases[caseId].timeline = [];
      cases[caseId].timeline.push(`🤝 ${user} 提交协调请求 · 期望金额：${amount || "未填写"} · ${now}`);
      localStorage.setItem("cases", JSON.stringify(cases));
    }
    const requests = JSON.parse(localStorage.getItem("coordination_requests") || "[]");
    requests.push({ caseId, amount, desc, contact, submittedBy: user, date: new Date().toISOString() });
    localStorage.setItem("coordination_requests", JSON.stringify(requests));

    router.push(`/case/${caseId}`);
  };

  if (!checked) return null;

  const inputClass = "w-full bg-[#F5F7FA] border border-[#E5E7EB] px-4 py-3 rounded-xl text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2B6CB0] transition text-sm";

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1F2937]">
      <div className="max-w-[700px] mx-auto px-8 py-16">

        <Link href={caseId ? `/case/${caseId}` : "/"} className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] text-sm mb-10 transition">
          ← 返回案件详情
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0F2A44] mb-2">发起协调</h1>
          <p className="text-[#6B7280] text-sm">提交协调请求后，平台将介入协助推动问题解决。请如实填写诉求信息。</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-[#6B7280] text-xs">以 <span className="text-[#1F2937] font-medium">{user}</span> 身份提交</span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="block text-xs text-[#6B7280] uppercase tracking-widest mb-2 font-medium">期望解决金额</label>
              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="例：¥120,000" className={inputClass} />
            </div>

            <div>
              <label className="block text-xs text-[#6B7280] uppercase tracking-widest mb-2 font-medium">补充说明</label>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="请描述您的诉求、期望解决方式或补充相关信息..." rows={5} className={`${inputClass} resize-none`} />
              <div className="text-right text-xs text-[#9CA3AF] mt-1">{desc.length} 字</div>
            </div>

            <div>
              <label className="block text-xs text-[#6B7280] uppercase tracking-widest mb-2 font-medium">联系方式 <span className="text-red-500">*</span></label>
              <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="手机号 / 邮箱" className={inputClass} />
            </div>

            <div className="border-t border-[#E5E7EB]" />

            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-600 leading-relaxed">
              提交后平台将在 1-3 个工作日内与您联系，协助推进协调流程。案件状态将更新为「协商中」。
            </div>

            <button type="submit" disabled={submitting} className="w-full bg-[#2B6CB0] hover:bg-[#2563a0] disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl text-sm font-medium transition text-white">
              {submitting ? "提交中..." : "提交协调请求"}
            </button>

          </form>
        </div>

        <p className="text-center text-[#9CA3AF] text-xs mt-6">提交即表示您同意平台介入协助处理此纠纷</p>

      </div>
    </main>
  );
}

export default function CoordinationPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#F5F7FA]" />}><CoordinationForm /></Suspense>;
}