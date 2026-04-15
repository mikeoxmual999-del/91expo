"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [countryCode, setCountryCode] = useState("+86");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const countries = [
    { code: "+86", label: "CN" },
    { code: "+1",  label: "US" },
    { code: "+44", label: "UK" },
    { code: "+60", label: "MY" },
    { code: "+852", label: "HK" },
    { code: "+65", label: "SG" },
  ];

  const fullPhone = `${countryCode}${phone.trim()}`;

  const startCooldown = () => {
    setCooldown(60);
    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    if (!phone.trim()) { setError("请输入手机号"); return; }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("verify");
        startCooldown();
      } else {
        setError(data.error || "发送失败，请重试");
      }
    } catch {
      setError("网络错误，请重试");
    }
    setSending(false);
  };

  const handleVerify = async () => {
    if (!code.trim()) { setError("请输入验证码"); return; }
    setVerifying(true);
    setError("");
    try {
      const res = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, code: code.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        // save user to DB
        await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: fullPhone }),
        });
        localStorage.setItem("user", fullPhone);
        window.dispatchEvent(new Event("loginStateChanged"));
        router.replace("/");
      } else {
        setError(data.error || "验证码错误，请重试");
      }
    } catch {
      setError("网络错误，请重试");
    }
    setVerifying(false);
  };

  return (
    <main className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <div className="max-w-[420px] w-full mx-auto px-4 py-10 md:py-16">

        <Link href="/" className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] text-sm mb-6 md:mb-10 transition">
          ← 返回首页
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0F2A44] mb-2">登录 / 注册</h1>
          <p className="text-[#6B7280] text-sm">
            {step === "phone" ? "使用手机号进入平台，无需密码。" : `验证码已发送至 ${fullPhone}`}
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 md:p-8 space-y-5 shadow-sm">

          {step === "phone" && (
            <>
              <div>
                <label className="block text-xs text-[#6B7280] uppercase tracking-widest mb-2 font-medium">手机号</label>
                <div className="flex gap-3">
                  <div className="relative w-[110px]">
                    <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full bg-[#F5F7FA] border border-[#E5E7EB] px-3 py-3 rounded-xl text-[#1F2937] text-sm appearance-none pr-8 focus:outline-none focus:border-[#2B6CB0] transition cursor-pointer">
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>{c.label} {c.code}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-xs">▼</div>
                  </div>
                  <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                    placeholder="请输入手机号" type="tel" inputMode="numeric"
                    className="flex-1 bg-[#F5F7FA] border border-[#E5E7EB] px-4 py-3 rounded-xl text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2B6CB0] transition text-sm" />
                </div>
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <div className="border-t border-[#E5E7EB]" />

              <button onClick={handleSendCode} disabled={sending}
                className="w-full bg-[#2B6CB0] hover:bg-[#2563a0] disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl text-sm font-medium transition text-white">
                {sending ? "发送中..." : "获取验证码"}
              </button>
            </>
          )}

          {step === "verify" && (
            <>
              <div>
                <label className="block text-xs text-[#6B7280] uppercase tracking-widest mb-2 font-medium">验证码</label>
                <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  placeholder="请输入6位验证码" type="tel" inputMode="numeric" maxLength={6}
                  className="w-full bg-[#F5F7FA] border border-[#E5E7EB] px-4 py-3 rounded-xl text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2B6CB0] transition text-sm text-center tracking-[0.5em] text-lg font-bold" />
              </div>

              {error && <p className="text-red-500 text-xs text-center">{error}</p>}

              <div className="border-t border-[#E5E7EB]" />

              <button onClick={handleVerify} disabled={verifying || code.length < 4}
                className="w-full bg-[#2B6CB0] hover:bg-[#2563a0] disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl text-sm font-medium transition text-white">
                {verifying ? "验证中..." : "确认登录"}
              </button>

              <div className="text-center">
                {cooldown > 0 ? (
                  <p className="text-xs text-[#9CA3AF]">{cooldown}秒后可重新发送</p>
                ) : (
                  <button onClick={() => { setStep("phone"); setCode(""); setError(""); }}
                    className="text-xs text-[#2B6CB0] hover:underline">
                    重新发送验证码
                  </button>
                )}
              </div>
            </>
          )}

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