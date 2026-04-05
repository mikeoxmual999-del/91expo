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
  date?: string;
  meta: string;
  paid?: boolean;
  creator?: string;
};
 
const defaultCases = {
  "1": {
    company: "深圳某贸易公司",
    amount: "¥120,000",
    status: "未回应",
    type: "货款纠纷",
    desc: "交付完成后长期未付款，沟通无回应。",
    date: new Date().toISOString(),
    creator: "system",
    paid: true,
  },
  "2": {
    company: "上海某科技公司",
    amount: "¥45,000",
    status: "协商中",
    type: "合同纠纷",
    desc: "签订合同后未按约定交付，正在沟通。",
    date: new Date().toISOString(),
    creator: "system",
    paid: true,
  },
  "3": {
    company: "北京某工程公司",
    amount: "¥300,000",
    status: "已解决",
    type: "工程款",
    desc: "项目完成后尾款迟迟未结。",
    date: new Date().toISOString(),
    creator: "system",
    paid: true,
  },
};
 
export default function HomePage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
 
  useEffect(() => {
    let stored = localStorage.getItem("cases");
    let data;
 
    try {
      data = stored ? JSON.parse(stored) : null;
    } catch {
      data = null;
    }
 
    if (!data || Object.keys(data).length === 0) {
      localStorage.setItem("cases", JSON.stringify(defaultCases));
      data = defaultCases;
    }
 
    const arr = Object.entries(data)
      .map(([id, value]: any) => ({
        id,
        ...value,
        meta: value.date
          ? new Date(value.date).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
          : "日期未知",
      }))
      // only show paid posts or system posts
      .filter((c: any) => c.paid === true || c.creator === "system")
      .sort((a: any, b: any) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
 
    setCases(arr);
  }, []);
 
  const statusColor = (status: string) => {
    if (status === "未回应") return "text-red-400 bg-red-500/10 border border-red-500/20";
    if (status === "协商中") return "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20";
    if (status === "申请结案中") return "text-orange-400 bg-orange-500/10 border border-orange-500/20";
    return "text-green-400 bg-green-500/10 border border-green-500/20";
  };
 
  const latest = cases.slice(0, 5);
 
  const stats = [
    { label: "全部记录", value: cases.length },
    { label: "处理中", value: cases.filter(c => c.status === "未回应" || c.status === "协商中").length },
    { label: "已解决", value: cases.filter(c => c.status === "已解决").length },
  ];
 
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
 
      {/* HERO */}
      <section>
        <div className="max-w-[1400px] mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
 
          {/* LEFT */}
          <div>
            <div className="text-blue-400 text-lg font-medium mb-4">
              记录事实 · 提升透明
            </div>
 
            <div className="w-12 h-[4px] bg-blue-500 mb-6" />
 
            <h1 className="text-5xl font-semibold leading-tight mb-5">
              让每一条纠纷
              <br />
              都有记录与进展
            </h1>
 
            <p className="text-white/60 mb-8 max-w-xl leading-relaxed">
              以结构化方式记录纠纷信息，帮助信息被理解，并推动问题向解决发展。
            </p>
 
            <div className="flex gap-4">
              <Link
                href="/create"
                className="inline-block bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-xl text-base font-medium transition"
              >
                发布纠纷
              </Link>
              <Link
                href="/feed"
                className="inline-block border border-white/20 hover:border-white/40 px-8 py-4 rounded-xl text-base font-medium transition text-white/70 hover:text-white"
              >
                浏览记录
              </Link>
            </div>
 
            {/* STATS */}
            <div className="flex gap-8 mt-10">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
 
          {/* RIGHT SCROLL */}
          <div className="h-[700px] overflow-hidden pointer-events-none">
            <div className="animate-scroll flex flex-col gap-5">
              {[...cases, ...cases, ...cases].map((card, index) => (
                <Link key={index} href={`/case/${card.id}`} className="pointer-events-auto">
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
                    <div className="text-white/70 text-sm mb-3">{card.desc}</div>
                    <div className="text-xs text-white/30">{card.meta}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
 
        </div>
      </section>
 
      {/* LATEST FEED */}
      <section className="pt-16 pb-20">
        <div className="max-w-[1400px] mx-auto px-8">
 
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-medium">最新记录</h2>
            <Link
              href="/feed"
              className="text-sm text-blue-400 hover:text-blue-300 transition"
            >
              查看全部 →
            </Link>
          </div>
 
          <div className="space-y-4">
            {latest.map((card) => (
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
                  <div className="text-white/70 text-sm mb-3">{card.desc}</div>
                  <div className="text-xs text-white/30">{card.meta}</div>
                </div>
              </Link>
            ))}
          </div>
 
        </div>
      </section>
 
    </main>
  );
}