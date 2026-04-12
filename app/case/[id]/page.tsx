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
  description?: string;
  date?: string;
  timeline?: string[];
  creator?: string;
  paid?: boolean;
};

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const [caseData, setCaseData] = useState<CaseItem | null>(null);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = localStorage.getItem("user");
    setUser(currentUser);
    loadCase();
  }, [id]);

  const loadCase = async () => {
    try {
      const res = await fetch(`/api/cases?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          setCaseData({
            ...data,
            desc: data.description || data.desc || "",
            timeline: typeof data.timeline === "string" ? JSON.parse(data.timeline) : data.timeline || ["记录已创建"],
          });
          return;
        }
      }
    } catch {}
    const stored = localStorage.getItem("cases");
    if (!stored) return;
    const cases = JSON.parse(stored);
    const data = cases[id];
    if (data && !data.timeline) data.timeline = ["记录已创建"];
    setCaseData(data || null);
  };

  const updateCase = async (updatedFields: Partial<CaseItem>) => {
    try {
      await fetch("/api/cases", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...updatedFields }) });
    } catch {}
    const stored = localStorage.getItem("cases");
    if (stored) {
      const cases = JSON.parse(stored);
      if (cases[id]) { cases[id] = { ...cases[id], ...updatedFields }; localStorage.setItem("cases", JSON.stringify(cases)); }
    }
    setCaseData((prev) => prev ? { ...prev, ...updatedFields } : prev);
  };

  const handleRequestClose = () => {
    if (!confirm("申请结案？\n\n提交后将由管理员审核，审核通过后才会标记为已解决。")) return;
    const now = new Date().toLocaleString("zh-CN");
    updateCase({ status: "申请结案中", timeline: [...(caseData?.timeline || []), `📋 用户申请结案，等待管理员审核 · ${now}`] });
  };

  const handleCancelClose = () => {
    if (!confirm("确认撤回结案申请？")) return;
    const now = new Date().toLocaleString("zh-CN");
    updateCase({ status: "协商中", timeline: [...(caseData?.timeline || []), `↩️ 用户撤回结案申请 · ${now}`] });
  };

  const handleOpenDM = () => {
    if (!user) { router.push("/login"); return; }
    const threadKey = `dm_${id}_${user}`;
    const existing = localStorage.getItem(threadKey);
    if (!existing && caseData) {
      localStorage.setItem(threadKey, JSON.stringify({ caseId: id, posterId: caseData.creator || "system", responderId: user, messages: [], lastReadBy: {} }));
    }
    router.push(`/messages/${id}/${encodeURIComponent(user)}`);
  };

  const statusColor = (status: string) => {
    if (status === "未回应") return "bg-orange-50 text-orange-600 border border-orange-200";
    if (status === "协商中") return "bg-blue-50 text-blue-600 border border-blue-200";
    if (status === "申请结案中") return "bg-yellow-50 text-yellow-600 border border-yellow-200";
    return "bg-green-50 text-green-600 border border-green-200";
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "日期未知";
    return new Date(dateStr).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (!caseData) {
    return (
      <main className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <div className="text-[#6B7280]">未找到该记录</div>
          <Link href="/" className="mt-6 inline-block text-[#2B6CB0] hover:underline text-sm">← 返回首页</Link>
        </div>
      </main>
    );
  }

  const isSystemCase = caseData.creator === "system" || !caseData.creator;
  const isCreator = !isSystemCase && caseData.creator === user;
  const isOtherUser = user && (isSystemCase || user !== caseData.creator);
  const isPaid = !!caseData.paid || isSystemCase;

  if (!isPaid && !isCreator) {
    return (
      <main className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <div className="text-[#6B7280] mb-4">该记录尚未公开</div>
          <Link href="/" className="text-[#2B6CB0] hover:underline text-sm">← 返回首页</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1F2937]">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-8 md:py-16">

        <Link href="/" className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] text-sm mb-6 md:mb-10 transition">
          ← 返回记录列表
        </Link>

        {/* UNPAID BANNER */}
        {!isPaid && isCreator && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 md:px-6 py-4 md:py-5 mb-6 flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
            <div>
              <div className="text-yellow-700 font-medium mb-1">⚠️ 此记录尚未付款</div>
              <div className="text-yellow-600/70 text-sm">完成付款后记录将正式公开，目前仅您可见。</div>
            </div>
            <Link href={`/pricing?caseId=${id}`} className="bg-yellow-500 hover:bg-yellow-400 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shrink-0 text-center">
              去付款
            </Link>
          </div>
        )}

        {/* HEADER */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 md:p-8 mb-4 md:mb-6 shadow-sm">
          <div className="flex justify-between items-start mb-4 md:mb-6">
            <div className="flex-1 min-w-0 pr-3">
              <div className="text-lg md:text-2xl font-bold text-[#0F2A44] mb-1 truncate">{caseData.company}</div>
              <div className="text-[#2B6CB0] text-xl md:text-3xl font-bold mt-1 md:mt-2">{caseData.amount}</div>
            </div>
            <div className={`text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full shrink-0 ${statusColor(caseData.status)}`}>
              {caseData.status}
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-sm text-[#6B7280]">
            <span>类型：<span className="text-[#1F2937]">{caseData.type}</span></span>
            <span>发布时间：<span className="text-[#1F2937]">{formatDate(caseData.date)}</span></span>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 md:p-8 mb-4 md:mb-6 shadow-sm">
          <h2 className="text-xs font-semibold text-[#6B7280] mb-3 md:mb-4 uppercase tracking-widest">纠纷描述</h2>
          <p className="text-[#1F2937] leading-relaxed text-sm md:text-base">{caseData.desc}</p>
        </div>

        {/* TIMELINE */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 md:p-8 mb-4 md:mb-6 shadow-sm">
          <h2 className="text-xs font-semibold text-[#6B7280] mb-4 md:mb-6 uppercase tracking-widest">时间线</h2>
          {(caseData.timeline || []).length === 0 ? (
            <div className="text-[#9CA3AF] text-sm">暂无进展记录</div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {(caseData.timeline || []).map((item, index) => (
                <div key={index} className="flex gap-3 md:gap-4 items-start">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-[#2B6CB0] shrink-0" />
                  <div className="text-[#4B5563] text-xs md:text-sm leading-relaxed border-l border-[#E5E7EB] pl-3 md:pl-4">{item}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        {isPaid && (
          <div className="border-t border-[#E5E7EB] pt-6 md:pt-8 flex flex-wrap gap-3 md:gap-4">
            {isOtherUser && caseData.status !== "已解决" && (
              <button onClick={handleOpenDM} className="bg-[#2B6CB0] hover:bg-[#2563a0] text-white px-5 md:px-6 py-2.5 md:py-3 rounded-lg text-sm transition">
                我要回应
              </button>
            )}
            {isCreator && (
              <Link href={`/messages/${id}/inbox`} className="border border-[#2B6CB0] text-[#2B6CB0] hover:bg-blue-50 px-5 md:px-6 py-2.5 md:py-3 rounded-lg text-sm transition">
                查看回应
              </Link>
            )}
            {caseData.status !== "已解决" && (
              <Link href={`/coordination?id=${id}`} className="border border-[#E5E7EB] hover:border-[#CBD5E0] text-[#6B7280] px-5 md:px-6 py-2.5 md:py-3 rounded-lg text-sm transition">
                申请协调
              </Link>
            )}
            {isCreator && caseData.status !== "已解决" && caseData.status !== "申请结案中" && (
              <button onClick={handleRequestClose} className="bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-600 px-5 md:px-6 py-2.5 md:py-3 rounded-lg text-sm transition">
                申请结案
              </button>
            )}
            {isCreator && caseData.status === "申请结案中" && (
              <button onClick={handleCancelClose} className="border border-[#E5E7EB] text-[#6B7280] px-5 md:px-6 py-2.5 md:py-3 rounded-lg text-sm transition">
                撤回申请
              </button>
            )}
            {caseData.status === "申请结案中" && (
              <div className="flex items-center gap-2 text-orange-600 text-xs md:text-sm px-4 py-2.5 md:py-3 bg-orange-50 border border-orange-200 rounded-lg w-full md:w-auto">
                ⏳ 结案申请审核中，请等待管理员处理
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}