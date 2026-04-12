"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [countryCode, setCountryCode] = useState("+86");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const countries = [
    { code: "+86", label: "CN" },
    { code: "+1",  label: "US" },
    { code: "+44", label: "UK" },
    { code: "+60", label: "MY" },
    { code: "+852", label: "HK" },
    { code: "+65", label: "SG" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) { alert("请输入手机号"); return; }
    setSubmitting(true);
    const fullPhone = `${countryCode}${phone.trim()}`;
    try {
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });
    } catch (err) {
      console.error("DB save failed", err);
    }
    localStorage.setItem("user", fullPhone);
    window.dispatchEvent(new Event("loginStateChanged"));
    router.replace("/");
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <div className="max-w-[420px] w-full mx-auto px-4 py-10 md:py-16">

        <Link href="/" className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] text-sm mb-6 md:mb-10 transition">
          ← 返回首页
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0F2A44] mb-2">登录 / 注册</h1>
          <p className="text-[#6B7280] text-sm">使用手机号进入平台，无需密码。</p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 md:p-8 space-y-5 shadow-sm">

          <div>
            <label className="block text-xs text-[#6B7280] uppercase tracking-widest mb-2 font-medium">
              手机号
            </label>
            <div className="flex gap-3">

              <div className="relative w-[110px]">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full bg-[#F5F7FA] border border-[#E5E7EB] px-3 py-3 rounded-xl text-[#1F2937] text-sm appearance-none pr-8 focus:outline-none focus:border-[#2B6CB0] transition cursor-pointer"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label} {c.code}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-xs">▼</div>
              </div>

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号"
                type="tel"
                className="flex-1 bg-[#F5F7FA] border border-[#E5E7EB] px-4 py-3 rounded-xl text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2B6CB0] transition text-sm"
              />
            </div>
          </div>

          <div className="border-t border-[#E5E7EB]" />

          <button
            type="button"
            disabled
            className="w-full border border-[#E5E7EB] text-[#9CA3AF] py-3 rounded-xl text-sm cursor-not-allowed bg-[#F9FAFB]"
          >
            获取验证码（即将上线）
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-[#2B6CB0] hover:bg-[#2563a0] disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl text-sm font-medium transition text-white"
          >
            {submitting ? "登录中..." : "登录 / 注册"}
          </button>

        </div>

        <p className="text-center text-[#9CA3AF] text-xs mt-6">
          登录即表示您同意
          <Link href="/terms" className="text-[#2B6CB0] hover:underline mx-1">服务条款</Link>
          与
          <Link href="/privacy" className="text-[#2B6CB0] hover:underline mx-1">隐私政策</Link>
        </p>

      </div>
    </main>
  );
}