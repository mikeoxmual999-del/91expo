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

export default function HomePage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCases = async () => {
      try {
        const res = await fetch("/api/cases");
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            const arr = data.map((c: any) => ({ ...c, desc: c.description || c.desc || "", meta: c.date ? new Date(c.date).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }) : "日期未知" }));
            setCases(arr);
            setLoading(false);
            return;
          }
        }
      } catch {}
      const stored = localStorage.getItem("cases");
      if (stored) {
        try {
          const data = JSON.parse(stored);
          const arr = Object.entries(data).map(([id, value]: any) => ({ id, ...value, meta: value.date ? new Date(value.date).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }) : "日期未知" })).filter((c: any) => c.paid === true || c.creator === "system").sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setCases(arr);
        } catch { setCases([]); }
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
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <div className="text-blue-300 text-sm font-medium mb-4 uppercase tracking-widest">交易争议记录平台</div>
            <div className="w-12 h-[4px] bg-blue-400 mb-6" />
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-5 text-white">
              记录每一笔交易中的
              <br />
              争议与进展
            </h1>
            <p className="text-white/60 mb-8 max-w-xl leading-relaxed text-sm md:text-base">
              面向消费者、企业及其他交易参与方的信息记录与协商平台。
            </p>
            <div className="flex gap-3 md:gap-4">
              <Link href="/create" className="inline-block bg-[#2B6CB0] hover:bg-[#2563a0] px-6 md:px-8 py-3 md:py-4 rounded-xl text-sm md:text-base font-medium transition text-white">
                发布纠纷
              </Link>
              <Link href="/feed" className="inline-block border border-white/30 hover:border-white/60 px-6 md:px-8 py-3 md:py-4 rounded-xl text-sm md:text-base font-medium transition text-white/80 hover:text-white">
                浏览记录
              </Link>
            </div>
            <div className="flex gap-6 md:gap-8 mt-8 md:mt-10">
              {stats.map((s) => (
                <div key={s.label}>
                  {loading ? (
                    <div className="h-7 w-10 rounded-md bg-white/10 animate-pulse" />
                  ) : (
                    <div className="text-xl md:text-2xl font-bold text-white">{s.value}</div>
                  )}
                  <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:block h-[600px] overflow-hidden pointer-events-none">
            {loading ? (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden flex">
                    <div className="w-1 shrink-0 bg-[#E5E7EB]" />
                    <div className="p-5 flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-2">
                          <div className="h-4 w-32 rounded bg-[#E5E7EB] animate-pulse" />
                          <div className="h-5 w-20 rounded bg-[#E5E7EB] animate-pulse" />
                        </div>
                        <div className="h-5 w-14 rounded-full bg-[#E5E7EB] animate-pulse" />
                      </div>
                      <div className="h-3 w-24 rounded bg-[#E5E7EB] animate-pulse mb-2" />
                      <div className="h-3 w-full rounded bg-[#E5E7EB] animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <div className="flex flex-col gap-4" style={{ animation: cases.length > 0 ? `scrollUp ${cases.length * 4}s linear infinite` : undefined }}>
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
                        <div className={`text-xs px-2 py-0.5 rounded-full ${statusColor(card.status)}`}>{card.status}</div>
                      </div>
                      <div className="text-xs text-[#6B7280] mb-1">{card.type}</div>
                      <div className="text-[#4B5563] text-xs leading-relaxed line-clamp-2">{card.desc}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            )}
          </div>
        </div>
      </section>

      {/* ABOUT / INTRO */}
      <section className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">

            {/* LEFT — MISSION */}
            <div>
              <div className="text-[#2B6CB0] text-xs font-medium uppercase tracking-widest mb-4">关于我们</div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#0F2A44] mb-5 leading-snug">
                让交易争议<br />被清晰记录
              </h2>
              <p className="text-[#4B5563] text-sm md:text-base leading-relaxed mb-4">
                51记录是一个面向消费者、企业及其他交易参与方的信息记录与协商平台。我们以透明、客观、结构化的方式记录交易争议，帮助相关事实与进展被清晰呈现。
              </p>
              <p className="text-[#4B5563] text-sm md:text-base leading-relaxed">
                每一条记录将根据平台规则及适用法律持续保存、更新与展示，帮助相关进展被清晰追踪。
              </p>
            </div>

            {/* RIGHT — TRUST BADGES */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-[#F5F7FA] border border-[#E5E7EB] rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#0F2A44] flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h1v11H4M9 10h1v11H9M14 10h1v11H14M19 10h1v11H19" /></svg>
                </div>
                <div>
                  <div className="font-semibold text-[#0F2A44] text-sm mb-1">美国注册企业</div>
                  <div className="text-sm text-[#6B7280] leading-relaxed">51记录由美国注册公司运营，受美国联邦及州法律保护，平台运营合规透明。</div>
                </div>
              </div>
              <div className="bg-[#F5F7FA] border border-[#E5E7EB] rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#0F2A44] flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v5c0 5-3.5 9.74-7 11-3.5-1.26-7-6-7-11V7l7-4z" /></svg>
                </div>
                <div>
                  <div className="font-semibold text-[#0F2A44] text-sm mb-1">受美国法律保护</div>
                  <div className="text-sm text-[#6B7280] leading-relaxed">平台依据美国《消费者保护法》及相关法规运营，用户发布的真实消费记录受言论自由保障。</div>
                </div>
              </div>
              <div className="bg-[#F5F7FA] border border-[#E5E7EB] rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#0F2A44] flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div>
                  <div className="font-semibold text-[#0F2A44] text-sm mb-1">数据安全与隐私</div>
                  <div className="text-sm text-[#6B7280] leading-relaxed">我们严格保护用户隐私，所有支付均通过 Stripe 安全处理，平台不存储任何支付信息。</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* LATEST FEED */}
      <section className="py-10 md:py-16">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-bold text-[#0F2A44]">最新记录</h2>
            <Link href="/feed" className="text-sm text-[#2B6CB0] hover:underline transition">查看全部 →</Link>
          </div>
          <div className="space-y-3 md:space-y-4">
            {loading && Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden flex">
                <div className="w-1 shrink-0 bg-[#E5E7EB]" />
                <div className="p-4 md:p-6 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-2">
                      <div className="h-4 w-36 rounded bg-[#E5E7EB] animate-pulse" />
                      <div className="h-5 w-24 rounded bg-[#E5E7EB] animate-pulse" />
                    </div>
                    <div className="h-6 w-16 rounded-full bg-[#E5E7EB] animate-pulse" />
                  </div>
                  <div className="h-3 w-28 rounded bg-[#E5E7EB] animate-pulse mb-3" />
                  <div className="h-4 w-full rounded bg-[#E5E7EB] animate-pulse mb-3" />
                  <div className="h-3 w-20 rounded bg-[#E5E7EB] animate-pulse" />
                </div>
              </div>
            ))}
            {!loading && latest.map((card) => (
              <Link key={card.id} href={`/case/${card.id}`}>
                <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer flex">
                  <div className={`w-1 shrink-0 ${statusBar(card.status)}`} />
                  <div className="p-4 md:p-6 flex-1">
                    <div className="flex justify-between items-start mb-2 md:mb-3">
                      <div>
                        <div className="text-[#1F2937] font-semibold text-sm md:text-base">{card.company}</div>
                        <div className="text-[#2B6CB0] font-bold text-base md:text-lg mt-0.5 md:mt-1">{card.amount}</div>
                      </div>
                      <div className={`text-xs px-2 md:px-3 py-1 rounded-full shrink-0 ml-2 ${statusColor(card.status)}`}>{card.status}</div>
                    </div>
                    <div className="text-xs text-[#6B7280] mb-1 md:mb-2">{card.type}</div>
                    <div className="text-[#4B5563] text-xs md:text-sm mb-2 md:mb-3 line-clamp-2">{card.desc}</div>
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
