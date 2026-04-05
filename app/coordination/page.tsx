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
    if (!storedUser) {
      router.replace("/login");
      return;
    }
    setUser(storedUser);
    setChecked(true);
  }, []);

  const inputClass =
    "w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition text-sm";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!contact.trim()) {
      alert("请填写联系方式");
      return;
    }

    setSubmitting(true);

    const stored = localStorage.getItem("cases");
    let cases = stored ? JSON.parse(stored) : {};

    if (caseId && cases[caseId]) {
      cases[caseId].status = "协商中";
      if (!cases[caseId].timeline) cases[caseId].timeline = [];
      const now = new Date().toLocaleString("zh-CN");
      cases[caseId].timeline.push(
        `🤝 ${user} 提交协调请求 · 期望金额：${amount || "未填写"} · ${now}`
      );
      localStorage.setItem("cases", JSON.stringify(cases));
    }

    const requests = JSON.parse(localStorage.getItem("coordination_requests") || "[]");
    requests.push({
      caseId,
      amount,
      desc,
      contact,
      submittedBy: user,
      date: new Date().toISOString(),
    });
    localStorage.setItem("coordination_requests", JSON.stringify(requests));

    router.push(`/case/${caseId}`);
  };

  if (!checked) return null;

  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <div className="max-w-[700px] mx-auto px-8 py-16">

        <Link
          href={caseId ? `/case/${caseId}` : "/"}
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-10 transition"
        >
          ← 返回案件详情
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">发起协调</h1>
          <p className="text-white/40 text-sm">
            提交协调请求后，平台将介入协助推动问题解决。请如实填写诉求信息。
          </p>
        </div>

        {/* LOGGED IN AS */}
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-white/50 text-xs">以 <span className="text-white">{user}</span> 身份提交</span>
        </div>

        <div className="bg-[#111827] border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">
                期望解决金额
              </label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="例：¥120,000"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">
                补充说明 <span className="text-red-400">*</span>
              </label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="请描述您的诉求、期望解决方式或补充相关信息..."
                rows={5}
                className={`${inputClass} resize-none`}
              />
              <div className="text-right text-xs text-white/20 mt-1">{desc.length} 字</div>
            </div>

            <div>
              <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">
                联系方式 <span className="text-red-400">*</span>
              </label>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="手机号 / 邮箱"
                className={inputClass}
              />
            </div>

            <div className="border-t border-white/10" />

            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-3 text-xs text-blue-400/70 leading-relaxed">
              提交后平台将在 1-3 个工作日内与您联系，协助推进协调流程。案件状态将更新为「协商中」。
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl text-sm font-medium transition"
            >
              {submitting ? "提交中..." : "提交协调请求"}
            </button>

          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          提交即表示您同意平台介入协助处理此纠纷
        </p>

      </div>
    </main>
  );
}

export default function CoordinationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0F14]" />}>
      <CoordinationForm />
    </Suspense>
  );
}