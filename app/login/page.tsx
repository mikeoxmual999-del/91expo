"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type LoginMethod = "choose" | "phone" | "email";
type Step = "input" | "verify";

export default function LoginPage() {
  const router = useRouter();

  const [method, setMethod] = useState<LoginMethod>("choose");
  const [step, setStep] = useState<Step>("input");
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const countries = [
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
      setCooldown(prev => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
    }, 1000);
  };

  const handleSendCode = async () => {
    if (method === "phone" && !phone.trim()) { setError("请输入手机号"); return; }
    if (method === "email" && !email.trim()) { setError("请输入邮箱"); return; }
    setSending(true);
    setError("");
    try {
      const body = method === "email"
        ? { type: "email", email: email.trim() }
        : { phone: fullPhone };
      const res = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) { setStep("verify"); startCooldown(); }
      else setError(data.error || "发送失败，请重试");
    } catch { setError("网络错误，请重试"); }
    setSending(false);
  };

  const handleVerify = async () => {
    if (!code.trim()) { setError("请输入验证码"); return; }
    setVerifying(true);
    setError("");
    try {
      const identifier = method === "email" ? email.trim() : fullPhone;
      const body = method === "email"
        ? { type: "email", email: email.trim(), code: code.trim() }
        : { phone: fullPhone, code: code.trim() };
      const res = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: identifier }),
        });
        localStorage.setItem("user", identifier);
        const expiry = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem("user_expiry", expiry.toString());
        window.dispatchEvent(new Event("loginStateChanged"));
        router.replace("/");
      } else setError(data.error || "验证码错误，请重试");
    } catch { setError("网络错误，请重试"); }
    setVerifying(false);
  };

  const inputClass = "w-full bg-[#F5F7FA] border border-[#E5E7EB] px-4 py-3 rounded-xl text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2B6CB0] transition text-sm";

  return (
    <main className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <div className="max-w-[420px] w-full mx-auto px-4 py-10 md:py-16">

        <Link href="/" className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] text-sm mb-6 md:mb-10 transition">
          ← 返回首页
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0F2A44] mb-2">登录 / 注册</h1>
          <p className="text-[#6B7280] text-sm">
            {method === "choose" && "请选择登录方式"}
            {method === "phone" && step === "input" && "使用手机号登录"}
            {method === "email" && step === "input" && "使用邮箱登录"}
            {step === "verify" && method === "phone" && `验证码已发送至 ${fullPhone}`}
            {step === "verify" && method === "email" && `验证码已发送至 ${email}`}
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 md:p-8 shadow-sm">

          {/* CHOOSE METHOD */}
          {method === "choose" && (
            <div className="space-y-3">
              <button onClick={() => setMethod("email")}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-[#E5E7EB] hover:border-[#2B6CB0] hover:bg-blue-50 transition text-left">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-lg">📧</span>
                </div>
                <div>
                  <div className="font-semibold text-[#1F2937] text-sm">邮箱登录</div>
                  <div className="text-xs text-[#6B7280]">推荐中国用户使用</div>
                </div>
              </button>

              <button onClick={() => setMethod("phone")}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-[#E5E7EB] hover:border-[#2B6CB0] hover:bg-blue-50 transition text-left">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <span className="text-lg">📱</span>
                </div>
                <div>
                  <div className="font-semibold text-[#1F2937] text-sm">手机号登录</div>
                  <div className="text-xs text-[#6B7280]">适用于美国、英国、香港、新加坡、马来西亚</div>
                </div>
              </button>

              <div className="flex items-center gap-3 p-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] opacity-60 cursor-not-allowed">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <span className="text-lg">💬</span>
                </div>
                <div>
                  <div className="font-semibold text-[#1F2937] text-sm">微信登录</div>
                  <div className="text-xs text-[#9CA3AF]">即将上线</div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mt-2">
                <p className="text-xs text-yellow-700">⚠️ 中国大陆手机号暂不支持短信验证，请使用邮箱登录</p>
              </div>
            </div>
          )}

          {/* PHONE INPUT */}
          {method === "phone" && step === "input" && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs text-[#6B7280] uppercase tracking-widest mb-2 font-medium">手机号</label>
                <div className="flex gap-3">
                  <div className="relative w-[110px]">
                    <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full bg-[#F5F7FA] border border-[#E5E7EB] px-3 py-3 rounded-xl text-[#1F2937] text-sm appearance-none pr-8 focus:outline-none focus:border-[#2B6CB0] transition cursor-pointer">
                      {countries.map((c) => <option key={c.code} value={c.code}>{c.label} {c.code}</option>)}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-xs">▼</div>
                  </div>
                  <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                    placeholder="请输入手机号" type="tel" inputMode="numeric" autoComplete="tel"
                    className="flex-1 bg-[#F5F7FA] border border-[#E5E7EB] px-4 py-3 rounded-xl text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2B6CB0] transition text-sm" />
                </div>
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <div className="border-t border-[#E5E7EB]" />
              <button onClick={handleSendCode} disabled={sending}
                className="w-full bg-[#2B6CB0] hover:bg-[#2563a0] disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl text-sm font-medium transition text-white">
                {sending ? "发送中..." : "获取验证码"}
              </button>
              <button onClick={() => setMethod("choose")} className="w-full text-xs text-[#6B7280] hover:text-[#1F2937] transition">← 返回选择登录方式</button>
            </div>
          )}

          {/* EMAIL INPUT */}
          {method === "email" && step === "input" && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs text-[#6B7280] uppercase tracking-widest mb-2 font-medium">邮箱地址</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                  placeholder="请输入邮箱地址" type="email" autoComplete="email"
                  className={inputClass} />
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <div className="border-t border-[#E5E7EB]" />
              <button onClick={handleSendCode} disabled={sending}
                className="w-full bg-[#2B6CB0] hover:bg-[#2563a0] disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl text-sm font-medium transition text-white">
                {sending ? "发送中..." : "获取验证码"}
              </button>
              <button onClick={() => setMethod("choose")} className="w-full text-xs text-[#6B7280] hover:text-[#1F2937] transition">← 返回选择登录方式</button>
            </div>
          )}

          {/* VERIFY */}
          {step === "verify" && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs text-[#6B7280] uppercase tracking-widest mb-2 font-medium">验证码</label>
                <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  placeholder="请输入6位验证码" type="tel" inputMode="numeric" maxLength={6} autoComplete="one-time-code"
                  className={`${inputClass} text-center tracking-[0.5em] text-lg font-bold`} />
              </div>
              {error && <p className="text-red-500 text-xs text-center">{error}</p>}
              <div className="border-t border-[#E5E7EB]" />
              <button onClick={handleVerify} disabled={verifying || code.length < 4}
                className="w-full bg-[#2B6CB0] hover:bg-[#2563a0] disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl text-sm font-medium transition text-white">
                {verifying ? "验证中..." : "确认登录"}
              </button>
              <div className="text-center">
                {cooldown > 0
                  ? <p className="text-xs text-[#9CA3AF]">{cooldown}秒后可重新发送</p>
                  : <button onClick={() => { setStep("input"); setCode(""); setError(""); }}
                      className="text-xs text-[#2B6CB0] hover:underline">重新发送验证码</button>}
              </div>
            </div>
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