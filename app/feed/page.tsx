"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CaseItem = {
  id: string;
  company: string;
  amount: string;
  type: string;
  status: string;
  desc: string;
  description?: string;
  date?: string;
  paid?: boolean;
  plan?: string;
};

const CASES_PER_PAGE = 20;

export default function FeedPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("全部");
  const [typeFilter, setTypeFilter] = useState("全部");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const statusFilters = ["全部", "未回应", "协商中", "申请结案中", "已解决"];
  const typeFilters = ["全部", "货款纠纷", "合同纠纷", "工程款", "劳动争议", "知识产权", "服务纠纷", "其他"];

  useEffect(() => {
    const loadCases = async () => {
      try {
        const res = await fetch("/api/cases");
        if (res.ok) {
          const data = await res.json();
          setCases(data.map((c: any) => ({ ...c, desc: c.description || c.desc || "" })));
          setLoading(false);
          return;
        }
      } catch {}
      setLoading(false);
    };
    loadCases();
  }, []);

  useEffect(() => { setPage(1); }, [statusFilter, typeFilter]);

  const statusColor = (status: string) => {
    if (status === "未回应") return "bg-orange-50 text-orange-600 border border-orange-200";
    if (status === "协商中") return "bg-blue-50 text-blue-600 border border-blue-200";
    if (status === "申请结案中") return "bg-yellow-50 text-yellow-600 border border-yellow-200";
    return "bg-green-50 text-green-600 border border-green-200";
  };

  const statusBar = (status: string) => {
    if (status === "未回应") return "bg-orange-400";
    if (status === "协商中") return "bg-blue-500";
    if (status === "申请结案中") return "bg-yellow-400";
    return "bg-green-500";
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
  };

  const applyFilters = (list: CaseItem[]) => {
    let filtered = list;
    if (statusFilter !== "全部") filtered = filtered.filter(c => c.status === statusFilter);
    if (typeFilter !== "全部") filtered = filtered.filter(c => c.type === typeFilter);
    return filtered;
  };

  const premiumCases = applyFilters(cases.filter(c => c.plan === "premium"));
  const regularCases = applyFilters(cases.filter(c => c.plan !== "premium"));
  const totalPages = Math.ceil(regularCases.length / CASES_PER_PAGE);
  const paginatedRegular = regularCases.slice((page - 1) * CASES_PER_PAGE, page * CASES_PER_PAGE);

  const CaseCard = ({ card, featured }: { card: CaseItem; featured?: boolean }) => (
    <Link href={`/case/${card.id}`}>
      <div className={`bg-white border rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer flex ${featured ? "border-yellow-300" : "border-[#E5E7EB]"}`}>
        <div className={`w-1 shrink-0 ${featured ? "bg-yellow-400" : statusBar(card.status)}`} />
        <div className="p-4 md:p-6 flex-1">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="text-[#1F2937] font-semibold text-sm md:text-base truncate">{card.company}</div>
                {featured && <span className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full shrink-0">置顶</span>}
              </div>
              <div className="text-[#2B6CB0] font-bold text-base md:text-lg mt-0.5">{card.amount}</div>
            </div>
            <div className={`text-xs px-2 md:px-3 py-1 rounded-full shrink-0 ${statusColor(card.status)}`}>{card.status}</div>
          </div>
          <div className="text-xs text-[#6B7280] mb-1">{card.type}</div>
          <div className="text-[#4B5563] text-xs md:text-sm mb-2 line-clamp-2">{card.desc}</div>
          {formatDate(card.date) && (
            <div className="text-xs text-[#9CA3AF] border-t border-[#F3F4F6] pt-2">发布于 {formatDate(card.date)}</div>
          )}
        </div>
      </div>
    </Link>
  );

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1F2937]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-10 md:py-16">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-[#0F2A44] mb-2">纠纷记录</h1>
          <p className="text-[#6B7280] text-sm">共 {cases.length} 条公开纠纷记录</p>
        </div>

        <div className="flex gap-2 mb-3 flex-wrap">
          {statusFilters.map((f) => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition ${statusFilter === f ? "bg-[#2B6CB0] border-[#2B6CB0] text-white" : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#2B6CB0] hover:text-[#2B6CB0]"}`}>
              {f} <span className="opacity-60">{f === "全部" ? cases.length : cases.filter(c => c.status === f).length}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {typeFilters.map((f) => (
            <button key={f} onClick={() => setTypeFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs border transition ${typeFilter === f ? "bg-[#0F2A44] border-[#0F2A44] text-white" : "bg-white border-[#E5E7EB] text-[#9CA3AF] hover:border-[#0F2A44] hover:text-[#0F2A44]"}`}>
              {f}
            </button>
          ))}
        </div>

        {loading && <div className="text-center py-24 text-[#6B7280] text-sm">加载中...</div>}

        {!loading && premiumCases.length === 0 && regularCases.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📭</div>
            <div className="text-[#6B7280] text-sm mb-6">暂无符合条件的记录</div>
            <Link href="/create" className="inline-block bg-[#2B6CB0] px-6 py-2.5 rounded-xl text-sm text-white">发布第一条记录</Link>
          </div>
        )}

        {!loading && premiumCases.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-semibold text-[#0F2A44]">置顶推广</span>
              <span className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full">{premiumCases.length} 条</span>
            </div>
            <div className="space-y-3">{premiumCases.map(card => <CaseCard key={card.id} card={card} featured />)}</div>
            <div className="border-t border-[#E5E7EB] mt-6" />
          </div>
        )}

        {!loading && paginatedRegular.length > 0 && (
          <div>
            <div id="regular-cases" className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-[#0F2A44]">最新记录 <span className="text-xs text-[#9CA3AF] font-normal">{regularCases.length} 条</span></span>
              {totalPages > 1 && <span className="text-xs text-[#9CA3AF]">第 {page} / {totalPages} 页</span>}
            </div>
            <div className="space-y-3">{paginatedRegular.map(card => <CaseCard key={card.id} card={card} />)}</div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                <button onClick={() => { setPage(1); document.getElementById("regular-cases")?.scrollIntoView({behavior:"smooth"}); }} disabled={page === 1}
                  className="px-3 py-2 rounded-lg border border-[#E5E7EB] text-xs text-[#6B7280] hover:border-[#2B6CB0] disabled:opacity-30 transition">«</button>
                <button onClick={() => { setPage(p => Math.max(1, p-1)); document.getElementById("regular-cases")?.scrollIntoView({behavior:"smooth"}); }} disabled={page === 1}
                  className="px-3 py-2 rounded-lg border border-[#E5E7EB] text-xs text-[#6B7280] hover:border-[#2B6CB0] disabled:opacity-30 transition">‹ 上一页</button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p;
                  if (totalPages <= 5) p = i + 1;
                  else if (page <= 3) p = i + 1;
                  else if (page >= totalPages - 2) p = totalPages - 4 + i;
                  else p = page - 2 + i;
                  return (
                    <button key={p} onClick={() => { setPage(p); document.getElementById("regular-cases")?.scrollIntoView({behavior:"smooth"}); }}
                      className={`px-3 py-2 rounded-lg border text-xs transition ${page === p ? "bg-[#2B6CB0] border-[#2B6CB0] text-white" : "border-[#E5E7EB] text-[#6B7280] hover:border-[#2B6CB0]"}`}>{p}</button>
                  );
                })}
                <button onClick={() => { setPage(p => Math.min(totalPages, p+1)); document.getElementById("regular-cases")?.scrollIntoView({behavior:"smooth"}); }} disabled={page === totalPages}
                  className="px-3 py-2 rounded-lg border border-[#E5E7EB] text-xs text-[#6B7280] hover:border-[#2B6CB0] disabled:opacity-30 transition">下一页 ›</button>
                <button onClick={() => { setPage(totalPages); document.getElementById("regular-cases")?.scrollIntoView({behavior:"smooth"}); }} disabled={page === totalPages}
                  className="px-3 py-2 rounded-lg border border-[#E5E7EB] text-xs text-[#6B7280] hover:border-[#2B6CB0] disabled:opacity-30 transition">»</button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
