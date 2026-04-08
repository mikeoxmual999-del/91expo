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

    if (!phone.trim()) {
      alert("请输入手机号");
      return;
    }

    setSubmitting(true);

    const fullPhone = `${countryCode}${phone.trim()}`;

    try {
      // save user to database
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });
    } catch (err) {
      console.error("DB save failed, continuing with localStorage", err);
    }

    // always save to localStorage for session
    localStorage.setItem("user", fullPhone);
    window.dispatchEvent(new Event("loginStateChanged"));

    router.replace("/");
  }

  const inputClass =
    "bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition text-sm";

  return (
    <main className="min-h-screen bg-[#0B0F14] text-white flex flex-col">
      <div className="max-w-[420px] w-full mx-auto px-6 py-16">

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-10 transition"
        >
          ← 返回首页
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">登录 / 注册</h1>
          <p className="text-white/40 text-sm">使用手机号进入平台，无需密码。</p>
        </div>

        <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 space-y-5">

          <div>
            <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">
              手机号
            </label>
            <div className="flex gap-3">

              <div className="relative w-[110px]">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full bg-[#0B0F14] border border-white/10 px-3 py-3 rounded-xl text-white text-sm appearance-none pr-8 focus:outline-none focus:border-blue-500 transition cursor-pointer"
                >
                  {countries.map((c) => (
                    <option
                      key={c.code}
                      value={c.code}
                      style={{ backgroundColor: "#0B0F14", color: "white" }}
                    >
                      {c.label} {c.code}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">
                  ▼
                </div>
              </div>

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号"
                type="tel"
                className={`flex-1 ${inputClass}`}
              />

            </div>
          </div>

          <div className="border-t border-white/10" />

          <button
            type="button"
            disabled
            className="w-full border border-white/10 text-white/30 py-3 rounded-xl text-sm cursor-not-allowed"
          >
            获取验证码（即将上线）
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl text-sm font-medium transition"
          >
            {submitting ? "登录中..." : "登录 / 注册"}
          </button>

        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          登录即表示您同意平台服务条款与隐私政策
        </p>

      </div>
    </main>
  );
}