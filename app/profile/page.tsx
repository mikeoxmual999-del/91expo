"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type CaseItem = {
  id: string;
  company: string;
  amount: string;
  status: string;
  type: string;
  desc: string;
  description?: string;
  date?: string;
  creator?: string;
  paid?: boolean;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const [cases, setCases] = useState<CaseItem[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) { router.replace("/login"); return; }
    setUser(storedUser);
    loadCases(storedUser);
  }, [router]);

  const loadCases = async (storedUser: string) => {
    try {
      const res = await fetch(`/api/cases?creator=${encodeURIComponent(storedUser)}`);
      if (res.ok) {
        const data = await res.json();
        setCases(data.map((c: any) => ({ ...c, desc: c.description || c.desc || "" })));
        return;
      }
    } catch (err) { console.error("DB fetch failed", err); }

    const storedCases = localStorage.getItem("cases");
    if (!storedCases) return;
    const parsed = JSON.parse(storedCases);
    const userCases = Object.entries(parsed)
      .map(([id, value]: any) => ({ id, ...value }))
      .filter((c: CaseItem) => c.creator === storedUser)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setCases(userCases);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("loginStateChanged"));
    router.replace("/");
  };

  const statusColor = (status: string) => {
    if (status === "待付款") return "bg-yellow-50 text-yellow-600 border border-yellow-200";
    if (status === "未回应") return "bg-orange-50 text-orange-600 border border-orange-200";
    if (status === "协商中") return "bg-blue-50 text-blue-600 border border-blue-200";
    if (status === "申请结案中") return "bg-yellow-50 text-yellow-600 border border-yellow-200";
    return "bg-green-50 text-green-600 border border-green-200";
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
  };

  if (!user) return null;

  const paidCases = cases.filter(c => !!c.paid);
  const unpaidCases = cases.filter(c => !c.paid);

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1F2937]">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-8 md:py-16">

        <Link href="/" className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] text-sm mb-6 md:mb-10 transition">
          ← 返回首页
        </Link>

        <div className="mb-6 md:mb-10">
          <h1 className="text-2xl font-bold text-[#0F2A44] mb-2">我的账户</h1>
          <p className="text-[#6B7280]">管理你的账户与发布记录</p>
        </div>

        {/* USER INFO */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 md:p-6 mb-6 md:mb-10 flex flex-col md:flex-row md:items-center gap-4 md:justify-between shadow-sm">
          <div>
            <div className="text-xs text-[#6B7280] uppercase tracking-widest mb-2 font-medium">当前账号（手机号）</div>
            <div className="text-[#1F2937] font-semibold text-base md:text-lg break-all">{user}</div>
          </div>
          <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm transition shrink-0">
            退出登录
          </button>
        </div>

        {/* UNPAID CASES */}
        {unpaidCases.length > 0 && (
          <div className="mb-6 md:mb-10">
            <h2 className="text-lg font-bold mb-4 text-yellow-600">⚠️ 待付款记录</h2>
            <div className="space-y-4">
              {unpaidCases.map((c) => (
                <div key={c.id} className="bg-white border border-yellow-200 rounded-xl p-4 md:p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-[#1F2937]">{c.company}</div>
                      <div className="text-[#2B6CB0] font-bold mt-1">{c.amount}</div>
                    </div>
                    <div className="text-xs px-3 py-1 rounded-full bg-yellow-50 text-yellow-600 border border-yellow-200">待付款</div>
                  </div>
                  <div className="text-xs text-[#6B7280] mb-2">{c.type}</div>
                  <div className="text-sm text-[#4B5563] mb-4 leading-relaxed">{c.desc}</div>
                  <div className="text-yellow-600/70 text-xs mb-4">完成付款后记录将正式公开展示</div>
                  <Link href={`/pricing?caseId=${c.id}`} className="inline-block bg-yellow-500 hover:bg-yellow-400 text-white px-5 py-2 rounded-lg text-sm font-medium transition">
                    去付款 →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MY CASES */}
        <div>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg font-bold text-[#0F2A44]">我的发布</h2>
            <Link href="/create" className="text-sm bg-[#2B6CB0] hover:bg-[#2563a0] text-white px-4 py-2 rounded-lg transition">
              + 发布新记录
            </Link>
          </div>

          {paidCases.length === 0 && unpaidCases.length === 0 && (
            <div className="text-center py-20 bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
              <div className="text-4xl mb-4">📝</div>
              <div className="text-[#6B7280] text-sm mb-4">暂无发布记录</div>
              <Link href="/create" className="inline-block text-sm bg-[#2B6CB0] hover:bg-[#2563a0] text-white px-6 py-2.5 rounded-xl transition">
                发布第一条记录
              </Link>
            </div>
          )}

          {paidCases.length === 0 && unpaidCases.length > 0 && (
            <div className="text-center py-10 bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
              <div className="text-[#6B7280] text-sm">暂无已公开的记录</div>
            </div>
          )}

          <div className="space-y-4">
            {paidCases.map((c) => (
              <div key={c.id} className="bg-white border border-[#E5E7EB] rounded-xl p-4 md:p-6 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold text-[#1F2937]">{c.company}</div>
                    <div className="text-[#2B6CB0] font-bold mt-1">{c.amount}</div>
                  </div>
                  <div className={`text-xs px-3 py-1 rounded-full ${statusColor(c.status)}`}>{c.status}</div>
                </div>
                <div className="text-xs text-[#6B7280] mb-2">{c.type}</div>
                <div className="text-sm text-[#4B5563] mb-4 leading-relaxed">{c.desc}</div>
                {formatDate(c.date) && (
                  <div className="text-xs text-[#9CA3AF] mb-4 border-t border-[#F3F4F6] pt-3">
                    发布于 {formatDate(c.date)}
                  </div>
                )}
                <button onClick={() => router.push(`/case/${c.id}`)} className="text-sm px-4 py-2 border border-[#E5E7EB] rounded-lg hover:border-[#2B6CB0] hover:text-[#2B6CB0] transition">
                  查看详情
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}