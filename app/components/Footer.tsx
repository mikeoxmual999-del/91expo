"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-[#0F2A44] mt-auto">
      <div className="max-w-[1400px] mx-auto px-8 py-12">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* LEFT — BRAND */}
          <div>
            <Link href="/" className="text-white font-bold text-xl">
              91<span className="text-blue-300">记录</span>
            </Link>
            <p className="text-white/60 text-sm mt-3 leading-relaxed max-w-[240px]">
              商业争议记录与协商平台。以事实为基础，推动问题透明解决。
            </p>
          </div>

          {/* MIDDLE — LINKS */}
          <div>
            <div className="text-xs text-white/60 uppercase tracking-widest mb-4 font-medium">
              平台导航
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/" className="text-white/60 hover:text-white text-sm transition">首页</Link>
              <Link href="/feed" className="text-white/60 hover:text-white text-sm transition">争议记录</Link>
              <Link href="/create" className="text-white/60 hover:text-white text-sm transition">发布纠纷</Link>
              <Link href="/search" className="text-white/60 hover:text-white text-sm transition">搜索企业</Link>
              <Link href="/about" className="text-white/60 hover:text-white text-sm transition">关于我们</Link>
            </div>
          </div>

          {/* RIGHT — LEGAL */}
          <div>
            <div className="text-xs text-white/60 uppercase tracking-widest mb-4 font-medium">
              法律与支持
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/disclaimer" className="text-white/40 hover:text-white text-sm transition">免责声明</Link>
              <Link href="/terms" className="text-white/40 hover:text-white text-sm transition">用户协议</Link>
              <Link href="/privacy" className="text-white/40 hover:text-white text-sm transition">隐私政策</Link>
              <Link href="/admin" className="text-white/20 hover:text-white/40 text-xs transition mt-2">管理员入口</Link>
            </div>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/20 text-xs">
            © {new Date().getFullYear()} 91记录 · 商业争议记录与协商平台
          </p>
          <p className="text-white/20 text-xs">
            本平台仅提供信息记录服务，不对内容真实性作出认定
          </p>
        </div>

      </div>
    </footer>
  );
}