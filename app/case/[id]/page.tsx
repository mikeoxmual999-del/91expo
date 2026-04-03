"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type CaseItem = {
  company: string;
  amount: string;
  status: string;
  type: string;
  desc: string;
  date?: string;
  timeline?: string[];
  creator?: string;
};

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const [caseData, setCaseData] = useState<CaseItem | null>(null);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("cases");
    const currentUser = localStorage.getItem("user");
    setUser(currentUser);
    if (!stored) return;
    const cases = JSON.parse(stored);
    const data = cases[id];
    if (data && !data.timeline) data.timeline = ["记录已创建"];
    setCaseData(data || null);
  }, [id]);

  const statusColor = (status: string) => {
    if (status === "未回应") return "text-red-400 bg-red-500/10 border border-red-500/20";
    if (status === "协商中") return "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20";
    if (status === "申请结案中") return "text-orange-400 bg-orange-500/10 border border-orange-500/20";
    return "text-green-400 bg-green-500/10 border border-green-500/20";
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "日期未知";
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const updateCase = (updatedFields: Partial<CaseItem>) => {
    const stored = localStorage.getItem("cases");
    if (!stored) return;
    const cases = JSON.parse(stored);
    if (!cases[id]) return;
    cases[id] = { ...cases[id], ...updatedFields };
    localStorage.setItem("cases", JSON.stringify(cases));
    setCaseData({ ...cases[id] });
  };

  const handleRequestClose = () => {
    const confirmed = confirm("申请结案？\n\n提交后将由管理员审核，审核通过后才会标记为已解决。");
    if (!confirmed) return;
    const now = new Date().toLocaleString("zh-CN");
    const stored = localStorage.getItem("cases");
    if (!stored) return;
    const cases = JSON.parse(stored);
    const timeline = cases[id].timeline || [];
    timeline.push(`📋 用户申请结案，等待管理员审核 · ${now}`);
    updateCase({ status: "申请结案中", timeline });
  };

  const handleCancelClose = () => {
    const confirmed = confirm("确认撤回结案申请？");
    if (!confirmed) return;
    const now = new Date().toLocaleString("zh-CN");
    const stored = localStorage.getItem("cases");
    if (!stored) return;
    const cases = JSON.parse(stored);
    const timeline = cases[id].timeline || [];
    timeline.push(`↩️ 用户撤回结案申请 · ${now}`);
    updateCase({ status: "协商中", timeline });
  };

  const handleOpenDM = () => {
    if (!user) {
      router.push("/login");
      return;
    }

    // thread key uses the responder (current user) ID
    const threadKey = `dm_${id}_${encodeURIComponent(user)}`;
    const existing = localStorage.getItem(threadKey);

    if (!existing && caseData) {
      // posterId is the case creator, or "system" for default cases
      const posterId = caseData.creator || "system";
      const newThread = {
        caseId: id,
        posterId,
        responderId: user,
        messages: [],
        lastReadBy: {},
      };
      localStorage.setItem(threadKey, JSON.stringify(newThread));

      // add timeline entry
      const stored = localStorage.getItem("cases");
      if (stored) {
        const cases = JSON.parse(stored);
        if (cases[id]) {
          if (!cases[id].timeline) cases[id].timeline = [];
          const now = new Date().toLocaleString("zh-CN");
          cases[id].timeline.push(`💬 ${user} 发起了私信联系 · ${now}`);
          if (cases[id].status === "未回应") cases[id].status = "协商中";
          localStorage.setItem("cases", JSON.stringify(cases));
          setCaseData({ ...cases[id] });
        }
      }
    }

    router.push(`/messages/${id}/${encodeURIComponent(user)}`);
  };

  if (!caseData) {
    return (
      <main className="min-h-screen bg-[#0B0F14] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-white/40 text-5xl mb-4">🔍</div>
          <div className="text-white/60">未找到该记录</div>
          <Link href="/" className="mt-6 inline-block text-blue-400 hover:text-blue-300 text-sm">
            ← 返回首页
          </Link>
        </div>
      </main>
    );
  }

  const isSystemCase = caseData.creator === "system" || !caseData.creator;
  const isCreator = !isSystemCase && caseData.creator === user;
  const isOtherUser = user && (isSystemCase || user !== caseData.creator);

  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <div className="max-w-[1000px] mx-auto px-8 py-16">

        {/* BACK */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-10 transition"
        >
          ← 返回记录列表
        </Link>

        {/* HEADER */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-2xl font-semibold mb-1">{caseData.company}</div>
              <div className="text-blue-400 text-3xl font-bold mt-2">{caseData.amount}</div>
            </div>
            <div className={`text-sm px-4 py-2 rounded-full ${statusColor(caseData.status)}`}>
              {caseData.status}
            </div>
          </div>
          <div className="flex gap-6 text-sm text-white/40">
            <span>类型：<span className="text-white/60">{caseData.type}</span></span>
            <span>发布时间：<span className="text-white/60">{formatDate(caseData.date)}</span></span>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 mb-6">
          <h2 className="text-xs font-medium text-white/50 mb-4 uppercase tracking-widest">
            纠纷描述
          </h2>
          <p className="text-white/80 leading-relaxed text-base">{caseData.desc}</p>
        </div>

        {/* TIMELINE */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 mb-6">
          <h2 className="text-xs font-medium text-white/50 mb-6 uppercase tracking-widest">
            时间线
          </h2>
          {(caseData.timeline || []).length === 0 ? (
            <div className="text-white/30 text-sm">暂无进展记录</div>
          ) : (
            <div className="space-y-4">
              {(caseData.timeline || []).map((item, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <div className="text-white/70 text-sm leading-relaxed border-l border-white/10 pl-4">
                    {item}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="border-t border-white/10 pt-8 flex flex-wrap gap-4">

          {/* PRIVATE DM - only non-creators */}
          {isOtherUser && caseData.status !== "已解决" && (
            <button
              onClick={handleOpenDM}
              className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg text-sm transition flex items-center gap-2"
            >
              我要回应
            </button>
          )}

          {/* POSTER: view inbox */}
          {isCreator && (
            <Link
              href="/messages"
              className="border border-blue-500/30 hover:border-blue-500/60 text-blue-400 px-6 py-3 rounded-lg text-sm transition flex items-center gap-2"
            >
              我要回应
            </Link>
          )}

          {/* COORDINATION - anyone */}
          {caseData.status !== "已解决" && (
            <Link
              href={`/coordination?id=${id}`}
              className="border border-white/20 hover:border-white/40 text-white/70 px-6 py-3 rounded-lg text-sm transition"
            >
              申请协调
            </Link>
          )}

          {/* CREATOR: request to close */}
          {isCreator && caseData.status !== "已解决" && caseData.status !== "申请结案中" && (
            <button
              onClick={handleRequestClose}
              className="bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400 px-6 py-3 rounded-lg text-sm transition"
            >
              申请结案
            </button>
          )}

          {/* CREATOR: cancel close request */}
          {isCreator && caseData.status === "申请结案中" && (
            <button
              onClick={handleCancelClose}
              className="border border-white/20 hover:border-white/40 text-white/60 px-6 py-3 rounded-lg text-sm transition"
            >
              撤回申请
            </button>
          )}

          {/* PENDING NOTICE */}
          {caseData.status === "申请结案中" && (
            <div className="flex items-center gap-2 text-orange-400/70 text-sm px-4 py-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
              ⏳ 结案申请审核中，请等待管理员处理
            </div>
          )}

        </div>

      </div>
    </main>
  );
}