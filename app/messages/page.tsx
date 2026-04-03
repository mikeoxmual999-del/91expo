"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DMThread = {
  caseId: string;
  posterId: string;
  responderId: string;
  messages: { sender: string; text: string; timestamp: string }[];
  lastReadBy?: Record<string, string>; // userId -> last read timestamp
};

export default function MessagesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [threads, setThreads] = useState<DMThread[]>([]);
  const [caseNames, setCaseNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.replace("/login");
      return;
    }
    setCurrentUser(user);

    // load case names
    const stored = localStorage.getItem("cases");
    if (stored) {
      const data = JSON.parse(stored);
      const names: Record<string, string> = {};
      Object.entries(data).forEach(([id, val]: any) => {
        names[id] = val.company;
      });
      setCaseNames(names);
    }

    // find all DM threads this user is part of
    const found: DMThread[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("dm_")) {
        try {
          const thread: DMThread = JSON.parse(localStorage.getItem(key) || "");
          if (thread.posterId === user || thread.responderId === user) {
            found.push(thread);
          }
        } catch {}
      }
    }

    // sort newest first
    found.sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1]?.timestamp || "";
      const bLast = b.messages[b.messages.length - 1]?.timestamp || "";
      return bLast.localeCompare(aLast);
    });

    setThreads(found);
  }, []);

  const getUnreadCount = (thread: DMThread, user: string) => {
    const lastRead = thread.lastReadBy?.[user] || "";
    return thread.messages.filter(
      (m) => m.sender !== user && m.timestamp > lastRead
    ).length;
  };

  const formatTime = (ts: string) => {
    if (!ts) return "";
    const date = new Date(ts);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
  };

  const totalUnread = threads.reduce(
    (sum, t) => sum + getUnreadCount(t, currentUser || ""),
    0
  );

  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <div className="max-w-[800px] mx-auto px-8 py-16">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold mb-1">私信</h1>
            <p className="text-white/40 text-sm">
              {totalUnread > 0
                ? `你有 ${totalUnread} 条未读消息`
                : "所有消息已读"}
            </p>
          </div>
        </div>

        {/* EMPTY */}
        {threads.length === 0 && (
          <div className="text-center py-24 bg-[#111827] border border-white/10 rounded-2xl">
            <div className="flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
            </div>
            <div className="text-white/40 text-sm">暂无私信</div>
            <p className="text-white/20 text-xs mt-2">
              在案件页面点击「私信联系」开始对话
            </p>
          </div>
        )}

        {/* THREAD LIST */}
        <div className="space-y-3">
          {threads.map((thread, index) => {
            const otherUser =
              currentUser === thread.posterId
                ? thread.responderId
                : thread.posterId;
            const lastMsg = thread.messages[thread.messages.length - 1];
            const unread = getUnreadCount(thread, currentUser || "");

            return (
              <Link
                key={index}
                href={`/messages/${thread.caseId}/${encodeURIComponent(thread.responderId)}`}
              >
                <div className={`bg-[#111827] border rounded-xl px-6 py-5 hover:border-white/20 transition cursor-pointer ${
                  unread > 0 ? "border-blue-500/30" : "border-white/10"
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">

                      {/* CASE NAME */}
                      <div className="text-xs text-white/30 mb-1">
                        📁 {caseNames[thread.caseId] || thread.caseId}
                      </div>

                      {/* OTHER USER */}
                      <div className="text-white font-medium text-sm mb-2">
                        {otherUser}
                      </div>

                      {/* LAST MESSAGE */}
                      <div className={`text-sm truncate ${
                        unread > 0 ? "text-white/80" : "text-white/40"
                      }`}>
                        {lastMsg
                          ? `${lastMsg.sender === currentUser ? "你：" : ""}${lastMsg.text}`
                          : "暂无消息"}
                      </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex flex-col items-end gap-2 ml-4 shrink-0">
                      <div className="text-xs text-white/30">
                        {lastMsg ? formatTime(lastMsg.timestamp) : ""}
                      </div>
                      {unread > 0 && (
                        <div className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                          {unread}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </main>
  );
}