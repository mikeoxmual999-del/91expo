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

export default function FeedPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [filter, setFilter] = useState("全部");
  const [loading, setLoading] = useState(true);
  const [showAllFeatured, setShowAllFeatured] = useState(false);
  const [showAllRegular, setShowAllRegular] = useState(false);

  const filters = ["全部", "未回应", "协商中", "申请结案中", "已解决"];

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
      const stored = localStorage.getItem("cases");
      if (stored) {
        const data = JSON.parse(stored);
        setCases(Object.entries(data).map(([id, value]: any) => ({ id, ...value })).filter((c: any) => c.paid === true || c.creator === "system").sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
      setLoading(false);
    };
    loadCases();
  }, []);

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

  const applyFilter = (list: CaseItem[]) =>
    filter === "全部" ? list : list.filter((c) => c.status === filter);

  const featuredCases = applyFilter(cases.filter(c => c.plan === "premium"));
  const regularCases = applyFilter(cases.filter(c => c.plan !== "premium"));

  const visibleFeatured = showAllFeatured ? featuredCases : featuredCases.slice(0, 6);
  const visibleRegular = showAllRegular ? regularCases : regularCases.slice(0, 10);

  const CaseCard = ({ card, featured }: { card: CaseItem; featured?: boolean }) => (
    <Link href={`/case/${card.id}`}>
      <div className={`bg-white border rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer flex ${featured ? "border-yellow-200" : "border-[#E5E7EB]"}`}>
        {featured && <div className="w-1 shrink-0 bg-yellow-400" />}
        {!featured && <div className={`w-1 shrink-0 ${statusBar(card.status)}`} />}
        <div className="p-4 md:p-6 flex-1">
          <div className="flex justify-between items-start mb-2 md:mb-3">
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="text-[#1F2937] font-semibold text-sm md:text-base truncate">{card.company}</div>
                {featured && <span className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full shrink-0">置顶</span>}
              </div>
              <div className="text-[#2B6CB0] font-bold text-base md:text-lg mt-0.5">{card.amount}</div>
            </div>
            <div className={`text-xs px-2 md:px-3 py-1 rounded-full shrink-0 ${statusColor(card.status)}`}>{card.status}</div>
          </div>
          <div className="text-xs text-[#6B7280] mb-1 md:mb-2">{card.type}</div>
          <div className="text-[#4B5563] text-xs md:text-sm mb-2 md:mb-4 line-clamp-2">{card.desc}</div>
          {formatDate(card.date) && (
            <div className="text-xs text-[#9CA3AF] border-t border-[#F3F4F6] pt-2 md:pt-3">发布于 {formatDate(card.date)}</div>
          )}
        </div>
      </div>
    </Link>
  );

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1F2937]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-10 md:py-16">

        <div className="mb-6 md:mb-10">
          <h1 className="text-xl md:text-2xl font-bold text-[#0F2A44] mb-2">纠纷记录</h1>
          <p className="text-[#6B7280] text-sm">浏览平台中的公开纠纷记录</p>
        </div>

        {/* FILTER BAR */}
        <div className="flex gap-2 mb-6 md:mb-10 flex-wrap">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm border transition ${filter === f ? "bg-[#2B6CB0] border-[#2B6CB0] text-white" : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#2B6CB0] hover:text-[#2B6CB0]"}`}>
              {f}
              <span className="ml-1.5 text-xs opacity-60">{f === "全部" ? cases.length : cases.filter((c) => c.status === f).length}</span>
            </button>
          ))}
        </div>

        {loading && <div className="text-center py-24"><div className="text-[#6B7280] text-sm">加载中...</div></div>}

        {!loading && featuredCases.length === 0 && regularCases.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📭</div>
            <div className="text-[#6B7280] text-sm mb-6">{filter === "全部" ? "暂无记录" : `暂无「${filter}」状态的记录`}</div>
            <Link href="/create" className="inline-block bg-[#2B6CB0] hover:bg-[#2563a0] px-6 py-2.5 rounded-xl text-sm transition text-white">发布第一条记录</Link>
          </div>
        )}

        {/* FEATURED SECTION */}
        {!loading && featuredCases.length > 0 && (
          <div className="mb-10 md:mb-14">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-2">
                <span className="text-base md:text-lg font-bold text-[#0F2A44]">精选推广</span>
                <span className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full">置顶</span>
              </div>
              <span className="text-xs text-[#9CA3AF]">{featuredCases.length} 条</span>
            </div>
            <div className="space-y-3 md:space-y-4">
              {visibleFeatured.map((card) => <CaseCard key={card.id} card={card} featured />)}
            </div>
            {featuredCases.length > 6 && (
              <button onClick={() => setShowAllFeatured(!showAllFeatured)}
                className="mt-4 w-full py-3 border border-yellow-200 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-xl text-sm transition">
                {showAllFeatured ? "收起" : `查看全部 ${featuredCases.length} 条精选推广 ↓`}
              </button>
            )}
          </div>
        )}

        {/* REGULAR SECTION */}
        {!loading && regularCases.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <span className="text-base md:text-lg font-bold text-[#0F2A44]">最新记录</span>
              <span className="text-xs text-[#9CA3AF]">{regularCases.length} 条</span>
            </div>
            <div className="space-y-3 md:space-y-4">
              {visibleRegular.map((card) => <CaseCard key={card.id} card={card} />)}
            </div>
            {regularCases.length > 10 && (
              <button onClick={() => setShowAllRegular(!showAllRegular)}
                className="mt-4 w-full py-3 border border-[#E5E7EB] text-[#6B7280] bg-white hover:bg-[#F9FAFB] rounded-xl text-sm transition">
                {showAllRegular ? "收起" : `查看全部 ${regularCases.length} 条记录 ↓`}
              </button>
            )}
          </div>
        )}

      </div>
    </main>
  );
}