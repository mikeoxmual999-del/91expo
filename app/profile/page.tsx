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
    if (!storedUser) {
      router.replace("/login");
      return;
    }
    setUser(storedUser);
    loadCases(storedUser);
  }, [router]);

  const loadCases = async (storedUser: string) => {
    try {
      // get all cases from DB and filter by creator
      const res = await fetch(`/api/cases?creator=${encodeURIComponent(storedUser)}`);
      if (res.ok) {
        const data = await res.json();
        const arr = data.map((c: any) => ({
          ...c,
          desc: c.description || c.desc || "",
        }));
        setCases(arr);
        return;
      }
    } catch (err) {
      console.error("DB fetch failed, using localStorage", err);
    }

    // fallback to localStorage
    const storedCases = localStorage.getItem("cases");
    if (!storedCases) return;
    const parsed = JSON.parse(storedCases);
    const userCases = Object.entries(parsed)
      .map(([id, value]: any) => ({ id, ...value }))
      .filter((c: CaseItem) => c.creator === storedUser)
      .sort((a: any, b: any) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    setCases(userCases);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("loginStateChanged"));
    router.replace("/");
  };

  const statusColor = (status: string) => {
    if (status === "待付款") return "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20";
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

  if (!user) return null;

  const paidCases = cases.filter(c => c.paid === true);
  const unpaidCases = cases.filter(c => !c.paid);

  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <div className="max-w-[1000px] mx-auto px-8 py-16">

        <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-10 transition">
          ← 返回首页
        </Link>

        <div className="mb-10">
          <h1 className="text-2xl font-semibold mb-2">我的账户</h1>
          <p className="text-white/50">管理你的账户与发布记录</p>
        </div>

        <div className="bg-[#111827] border border-white/10 rounded-xl p-6 mb-10 flex items-center justify-between">
          <div>
            <div className="text-xs text-white/40 uppercase tracking-widest mb-2">当前账号（手机号）</div>
            <div className="text-white font-medium text-lg">{user}</div>
          </div>
          <button onClick={handleLogout} className="bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-400 px-5 py-2 rounded-lg text-sm transition">
            退出登录
          </button>
        </div>

        {unpaidCases.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-medium mb-4 text-yellow-400">⚠️ 待付款记录</h2>
            <div className="space-y-4">
              {unpaidCases.map((c) => (
                <div key={c.id} className="bg-[#111827] border border-yellow-500/30 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium text-white">{c.company}</div>
                      <div className="text-blue-400 font-semibold mt-1">{c.amount}</div>
                    </div>
                    <div className="text-xs px-3 py-1 rounded-full text-yellow-400 bg-yellow-500/10 border border-yellow-500/20">待付款</div>
                  </div>
                  <div className="text-xs text-white/40 mb-2">{c.type}</div>
                  <div className="text-sm text-white/60 mb-4 leading-relaxed">{c.desc}</div>
                  <div className="text-yellow-400/60 text-xs mb-4">完成付款后记录将正式公开展示</div>
                  <Link href={`/pricing?caseId=${c.id}`} className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-2 rounded-lg text-sm font-medium transition">
                    去付款 →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium">我的发布</h2>
            <Link href="/create" className="text-sm bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition">
              + 发布新记录
            </Link>
          </div>

          {paidCases.length === 0 && unpaidCases.length === 0 && (
            <div className="text-center py-20 bg-[#111827] border border-white/10 rounded-xl">
              <div className="text-4xl mb-4">📝</div>
              <div className="text-white/40 text-sm mb-4">暂无发布记录</div>
              <Link href="/create" className="inline-block text-sm bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl transition">
                发布第一条记录
              </Link>
            </div>
          )}

          {paidCases.length === 0 && unpaidCases.length > 0 && (
            <div className="text-center py-10 bg-[#111827] border border-white/10 rounded-xl">
              <div className="text-white/40 text-sm">暂无已公开的记录</div>
            </div>
          )}

          <div className="space-y-4">
            {paidCases.map((c) => (
              <div key={c.id} className="bg-[#111827] border border-white/10 rounded-xl p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-medium text-white">{c.company}</div>
                    <div className="text-blue-400 font-semibold mt-1">{c.amount}</div>
                  </div>
                  <div className={`text-xs px-3 py-1 rounded-full ${statusColor(c.status)}`}>{c.status}</div>
                </div>
                <div className="text-xs text-white/40 mb-2">{c.type}</div>
                <div className="text-sm text-white/60 mb-4 leading-relaxed">{c.desc}</div>
                {formatDate(c.date) && (
                  <div className="text-xs text-white/25 mb-4 border-t border-white/5 pt-3">
                    发布于 {formatDate(c.date)}
                  </div>
                )}
                <button onClick={() => router.push(`/case/${c.id}`)} className="text-sm px-4 py-2 border border-white/20 rounded-lg hover:border-white/40 transition">
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