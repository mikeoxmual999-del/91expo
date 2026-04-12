"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type CaseItem = {
  id: string;
  company: string;
  amount: string;
  type: string;
  status: string;
  desc: string;
  description?: string;
  date?: string;
};

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [cases, setCases] = useState<CaseItem[]>([]);

  useEffect(() => {
    const loadCases = async () => {
      try {
        const res = await fetch("/api/cases");
        if (res.ok) {
          const data = await res.json();
          setCases(data.map((c: any) => ({ ...c, desc: c.description || c.desc || "" })));
          return;
        }
      } catch {}
      const stored = localStorage.getItem("cases");
      if (!stored) return;
      const data = JSON.parse(stored);
      setCases(Object.entries(data).map(([id, value]: any) => ({ id, ...value })).filter((c: any) => c.paid === true || c.creator === "system"));
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

  const filtered = cases.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return c.company.toLowerCase().includes(q) || c.type?.toLowerCase().includes(q) || c.desc?.toLowerCase().includes(q);
  });

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1F2937]">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-8 md:py-16">

        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-[#0F2A44] mb-2">搜索纠纷记录</h1>
          <p className="text-[#6B7280] text-sm">按企业名称、纠纷类型或关键词搜索</p>
        </div>

        <div className="relative mb-6 md:mb-10">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索纠纷 / 公司名称 / 关键词..."
            className="w-full bg-white border border-[#E5E7EB] px-5 py-4 rounded-xl text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2B6CB0] transition text-sm pr-12 shadow-sm"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition text-lg">✕</button>
          )}
        </div>

        {query.trim() && (
          <div className="text-xs text-[#6B7280] mb-6">找到 {filtered.length} 条与「{query}」相关的记录</div>
        )}

        {!query.trim() && cases.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📭</div>
            <div className="text-[#6B7280] text-sm mb-6">平台暂无记录</div>
            <Link href="/create" className="inline-block bg-[#2B6CB0] hover:bg-[#2563a0] text-white px-6 py-2.5 rounded-xl text-sm transition">发布第一条记录</Link>
          </div>
        )}

        {query.trim() && filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <div className="text-[#6B7280] text-sm mb-2">未找到相关记录</div>
            <div className="text-[#9CA3AF] text-xs">尝试使用其他关键词搜索</div>
          </div>
        )}

        <div className="space-y-3 md:space-y-4">
          {filtered.map((card) => (
            <Link key={card.id} href={`/case/${card.id}`}>
              <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer flex">
                <div className={`w-1 shrink-0 ${statusBar(card.status)}`} />
                <div className="p-4 md:p-6 flex-1">
                  <div className="flex justify-between items-start gap-2 mb-2 md:mb-3">
                    <div>
                      <div className="text-[#1F2937] font-semibold text-sm md:text-base truncate">{card.company}</div>
                      <div className="text-[#2B6CB0] font-bold text-base md:text-lg mt-0.5 md:mt-1">{card.amount}</div>
                    </div>
                    <div className={`text-xs px-2 md:px-3 py-1 rounded-full shrink-0 ${statusColor(card.status)}`}>{card.status}</div>
                  </div>
                  <div className="text-xs text-[#6B7280] mb-2">{card.type}</div>
                  <div className="text-[#4B5563] text-sm mb-4">{card.desc}</div>
                  {formatDate(card.date) && (
                    <div className="text-xs text-[#9CA3AF] border-t border-[#F3F4F6] pt-3">发布于 {formatDate(card.date)}</div>
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

export default function SearchPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#F5F7FA]" />}><SearchContent /></Suspense>;
}