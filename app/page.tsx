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
  meta: string;
  paid?: boolean;
  creator?: string;
};

const defaultCases = [
  {
    id: "default-1",
    company: "深圳某贸易公司",
    amount: "¥120,000",
    status: "未回应",
    type: "货款纠纷",
    desc: "交付完成后长期未付款，沟通无回应。",
    date: new Date().toISOString(),
    creator: "system",
    paid: true,
    meta: new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }),
  },
  {
    id: "default-2",
    company: "上海某科技公司",
    amount: "¥45,000",
    status: "协商中",
    type: "合同纠纷",
    desc: "签订合同后未按约定交付，正在沟通。",
    date: new Date().toISOString(),
    creator: "system",
    paid: true,
    meta: new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }),
  },
  {
    id: "default-3",
    company: "北京某工程公司",
    amount: "¥300,000",
    status: "已解决",
    type: "工程款",
    desc: "项目完成后尾款迟迟未结。",
    date: new Date().toISOString(),
    creator: "system",
    paid: true,
    meta: new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }),
  },
];

export default function HomePage() {
  const [cases, setCases] = useState<CaseItem[]>(defaultCases);

  useEffect(() => {
    const loadCases = async () => {
      try {
        const res = await fetch("/api/cases");
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            const arr = data.map((c: any) => ({
              ...c,
              desc: c.description || c.desc || "",
              meta: c.date
                ? new Date(c.date).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" })
                : "日期未知",
            }));
            setCases([...defaultCases, ...arr]);
            return;
          }
        }
      } catch (err) {
        console.error("DB fetch failed, using localStorage", err);
      }

      const stored = localStorage.getItem("cases");
      if (stored) {
        try {
          const data = JSON.parse(stored);
          const arr = Object.entries(data)
            .map(([id, value]: any) => ({
              id, ...value,
              meta: value.date
                ? new Date(value.date).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" })
                : "日期未知",
            }))
            .filter((c: any) => c.paid === true || c.creator === "system")
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setCases(arr.length > 0 ? arr : defaultCases);
        } catch {
          setCases(defaultCases);
        }
      }
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

  const latest = cases.slice(0, 5);

  const stats = [
    { label: "全部记录", value: cases.length },
    { label: "处理中", value: cases.filter(c => c.status === "未回应" || c.status === "协商中").length },
    { label: "已解决", value: cases.filter(c => c.status === "已解决").length },
  ];

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1F2937]">

      {/* HERO */}
      <section className="bg-[#0F2A44]">
        <div className="max-w-[1400px] mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <div>
            <div className="text-blue-300 text-sm font-medium mb-4 uppercase tracking-widest">
              商业争议记录平台
            </div>
            <div className="w-12 h-[4px] bg-blue-400 mb-6" />
            <h1 className="text-5xl font-bold leading-tight mb-5 text-white">
              让每一条纠纷
              <br />
              都有记录与进展
            </h1>
            <p className="text-white/60 mb-8 max-w-xl leading-relaxed">
              以结构化方式记录纠纷信息，帮助信息被理解，并推动问题向解决发展。
            </p>
            <div className="flex gap-4">
              <Link href="/create" className="inline-block bg-[#2B6CB0] hover:bg-[#2563a0] px-8 py-4 rounded-xl text-base font-medium transition text-white">
                发布纠纷
              </Link>
              <Link href="/feed" className="inline-block border border-white/30 hover:border-white/60 px-8 py-4 rounded-xl text-base font-medium transition text-white/80 hover:text-white">
                浏览记录
              </Link>
            </div>
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
          <div className="h-[600px] overflow-hidden pointer-events-none">
            <div className="animate-scroll flex flex-col gap-4">
              {[...cases, ...cases, ...cases].map((card, index) => (
                <Link key={index} href={`/case/${card.id}`} className="pointer-events-auto">
                  <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer flex">
                    <div className={`w-1 shrink-0 ${statusBar(card.status)}`} />
                    <div className="p-5 flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-[#1F2937] font-semibold text-sm">{card.company}</div>
                          <div className="text-[#2B6CB0] font-bold mt-0.5">{card.amount}</div>
                        </div>
                        <div className={`text-xs px-2 py-0.5 rounded-full ${statusColor(card.status)}`}>
                          {card.status}
                        </div>
                      </div>
                      <div className="text-xs text-[#6B7280] mb-1">{card.type}</div>
                      <div className="text-[#4B5563] text-xs leading-relaxed line-clamp-2">{card.desc}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* LATEST FEED */}
      <section className="py-16">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-[#0F2A44]">最新记录</h2>
            <Link href="/feed" className="text-sm text-[#2B6CB0] hover:underline transition">
              查看全部 →
            </Link>
          </div>
          <div className="space-y-4">
            {latest.map((card) => (
              <Link key={card.id} href={`/case/${card.id}`}>
                <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer flex">
                  <div className={`w-1 shrink-0 ${statusBar(card.status)}`} />
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-[#1F2937] font-semibold">{card.company}</div>
                        <div className="text-[#2B6CB0] font-bold text-lg mt-1">{card.amount}</div>
                      </div>
                      <div className={`text-xs px-3 py-1 rounded-full ${statusColor(card.status)}`}>
                        {card.status}
                      </div>
                    </div>
                    <div className="text-xs text-[#6B7280] mb-2">{card.type}</div>
                    <div className="text-[#4B5563] text-sm mb-3">{card.desc}</div>
                    <div className="text-xs text-[#9CA3AF]">{card.meta}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}