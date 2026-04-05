"use client";
 
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
 
export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [query, setQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
 
  const checkLogin = () => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
    if (user) countUnread(user);
  };
 
  const countUnread = (user: string) => {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("dm_")) {
        try {
          const thread = JSON.parse(localStorage.getItem(key) || "");
          if (thread.posterId === user || thread.responderId === user) {
            const lastRead = thread.lastReadBy?.[user] || "";
            const unread = thread.messages.filter(
              (m: any) => m.sender !== user && m.timestamp > lastRead
            ).length;
            if (unread > 0) count++;
          }
        } catch {}
      }
    }
    setUnreadCount(count);
  };
 
  useEffect(() => {
    checkLogin();
  }, [pathname]);
 
  useEffect(() => {
    const interval = setInterval(() => {
      const user = localStorage.getItem("user");
      if (user) countUnread(user);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
 
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };
 
  const navItems = [
    { name: "首页", href: "/" },
    { name: "记录", href: "/feed" },
    { name: "发布", href: "/create" },
    { name: "关于", href: "/about" },
  ];
 
  return (
    <nav className="sticky top-0 z-50 backdrop-blur bg-[#0B0F14]/80 border-b border-white/10">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex items-center justify-between h-20 gap-6">
 
          {/* LEFT */}
          <div className="flex items-center gap-12 shrink-0">
 
            {/* LOGO */}
            <Link href="/" className="text-white font-semibold text-xl">
              91<span className="text-blue-500">记录</span>
            </Link>
 
            {/* NAV */}
            <div className="hidden md:flex items-center gap-10">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-lg transition relative pb-1 ${
                      active
                        ? "text-blue-400 font-medium after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-blue-400 after:rounded-full"
                        : "text-white/60 hover:text-blue-400"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
 
          </div>
 
          {/* RIGHT */}
          <div className="flex items-center gap-4 shrink-0 ml-auto">
 
            {/* SEARCH BAR */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索纠纷 / 公司 / 姓名..."
                className="bg-white/5 border border-white/10 rounded-l-lg px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500 w-44"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-r-lg text-sm text-white border border-blue-600"
              >
                搜索
              </button>
            </form>
 
            {/* DM ICON */}
            {isLoggedIn && (
              <Link href="/messages" className="relative flex items-center justify-center shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-white/50 hover:text-white transition"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                  />
                </svg>
                {unreadCount > 0 && (
                  <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </div>
                )}
              </Link>
            )}
 
            {/* AUTH */}
            {isLoggedIn ? (
              <Link
                href="/profile"
                className="shrink-0 bg-white/10 hover:bg-white/20 transition text-sm px-4 py-2 rounded-lg text-white"
              >
                我的
              </Link>
            ) : (
              <Link
                href="/login"
                className="shrink-0 bg-blue-600 hover:bg-blue-500 transition text-sm px-4 py-2 rounded-lg text-white"
              >
                登录
              </Link>
            )}
 
          </div>
 
        </div>
      </div>
    </nav>
  );
}