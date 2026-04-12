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
};

export default function FeedPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [filter, setFilter] = useState("全部");
  const [loading, setLoading] = useState(true);

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

  const filtered = filter === "全部" ? cases : cases.filter((c) => c.status === filter);

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

        {!loading && filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📭</div>
            <div className="text-[#6B7280] text-sm mb-6">{filter === "全部" ? "暂无记录" : `暂无「${filter}」状态的记录`}</div>
            <Link href="/create" className="inline-block bg-[#2B6CB0] hover:bg-[#2563a0] px-6 py-2.5 rounded-xl text-sm transition text-white">发布第一条记录</Link>
          </div>
        )}

        <div className="space-y-3 md:space-y-4">
          {filtered.map((card) => (
            <Link key={card.id} href={`/case/${card.id}`}>
              <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer flex">
                <div className={`w-1 shrink-0 ${statusBar(card.status)}`} />
                <div className="p-4 md:p-6 flex-1">
                  <div className="flex justify-between items-start mb-2 md:mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="text-[#1F2937] font-semibold text-sm md:text-base truncate">{card.company}</div>
                      <div className="text-[#2B6CB0] font-bold text-base md:text-lg mt-0.5 md:mt-1">{card.amount}</div>
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
          ))}
        </div>

      </div>
    </main>
  );
}