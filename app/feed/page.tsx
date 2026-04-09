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
        // try database first
        const res = await fetch("/api/cases");
        if (res.ok) {
          const data = await res.json();
          // normalize description field
          const arr = data.map((c: any) => ({
            ...c,
            desc: c.description || c.desc || "",
          }));
          setCases(arr);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("DB fetch failed, falling back to localStorage", err);
      }

      // fallback to localStorage
      const stored = localStorage.getItem("cases");
      if (stored) {
        const data = JSON.parse(stored);
        const arr = Object.entries(data)
          .map(([id, value]: any) => ({ id, ...value }))
          .filter((c: any) => c.paid === true || c.creator === "system")
          .sort((a: any, b: any) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
        setCases(arr);
      }
      setLoading(false);
    };

    loadCases();
  }, []);

  const statusColor = (status: string) => {
    if (status === "未回应") return "text-red-400 bg-red-500/10 border border-red-500/20";
    if (status === "协商中") return "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20";
    if (status === "申请结案中") return "text-orange-400 bg-orange-500/10 border border-orange-500/20";
    return "text-green-400 bg-green-500/10 border border-green-500/20";
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filtered = filter === "全部"
    ? cases
    : cases.filter((c) => c.status === filter);

  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <div className="max-w-[1200px] mx-auto px-8 py-16">

        <div className="mb-10">
          <h1 className="text-2xl font-semibold mb-2">纠纷记录</h1>
          <p className="text-white/50">浏览平台中的公开纠纷记录</p>
        </div>

        {/* FILTER BAR */}
        <div className="flex gap-3 mb-10 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm border transition ${
                filter === f
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white"
              }`}
            >
              {f}
              <span className="ml-2 text-xs opacity-60">
                {f === "全部"
                  ? cases.length
                  : cases.filter((c) => c.status === f).length}
              </span>
            </button>
          ))}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center py-24">
            <div className="text-white/30 text-sm">加载中...</div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📭</div>
            <div className="text-white/40 text-sm mb-6">
              {filter === "全部" ? "暂无记录" : `暂无「${filter}」状态的记录`}
            </div>
            <Link
              href="/create"
              className="inline-block bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl text-sm transition"
            >
              发布第一条记录
            </Link>
          </div>
        )}

        {/* LIST */}
        <div className="space-y-4">
          {filtered.map((card) => (
            <Link key={card.id} href={`/case/${card.id}`}>
              <div className="bg-[#111827] border border-white/10 rounded-xl p-6 hover:border-white/20 transition cursor-pointer">

                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-white font-medium">{card.company}</div>
                    <div className="text-blue-400 font-semibold text-lg mt-1">{card.amount}</div>
                  </div>
                  <div className={`text-xs px-3 py-1 rounded-full ${statusColor(card.status)}`}>
                    {card.status}
                  </div>
                </div>

                <div className="text-xs text-white/50 mb-2">{card.type}</div>
                <div className="text-white/70 text-sm mb-4">{card.desc}</div>

                {formatDate(card.date) && (
                  <div className="text-xs text-white/25 border-t border-white/5 pt-3">
                    发布于 {formatDate(card.date)}
                  </div>
                )}

              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}