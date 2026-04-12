"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ThreadSummary = {
  case_id: string;
  company?: string;
  responder_id: string;
  poster_id: string;
  last_message: string;
  last_timestamp: string;
  message_count: number;
};

export default function MessagesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [readTimes, setReadTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) { router.replace("/login"); return; }
    setCurrentUser(user);

    const stored = localStorage.getItem("dm_read_times");
    const times = stored ? JSON.parse(stored) : {};
    setReadTimes(times);

    const now = new Date().toISOString();
    localStorage.setItem("dm_last_cleared", now);

    const load = async () => {
      try {
        const res = await fetch(`/api/messages?caseId=all&userId=${encodeURIComponent(user)}`);
        if (res.ok) {
          const data = await res.json();
          // sort: unread first, then by timestamp
          const withRead = data.map((t: ThreadSummary) => ({
            ...t,
            _unread: t.last_timestamp > (times[`${t.case_id}_${t.responder_id}`] || ""),
          }));
          withRead.sort((a: any, b: any) => {
            if (a._unread && !b._unread) return -1;
            if (!a._unread && b._unread) return 1;
            return b.last_timestamp.localeCompare(a.last_timestamp);
          });
          setThreads(withRead);
          const newTimes: Record<string, string> = { ...times };
          data.forEach((t: ThreadSummary) => {
            const key = `${t.case_id}_${t.responder_id}`;
            newTimes[key] = now;
          });
          localStorage.setItem("dm_read_times", JSON.stringify(newTimes));
          setReadTimes(newTimes);
          setLoading(false);
          return;
        }
      } catch {}
      setLoading(false);
    };

    load();
  }, []);

  const isUnread = (thread: ThreadSummary) => {
    if (!thread.last_timestamp) return false;
    const key = `${thread.case_id}_${thread.responder_id}`;
    const lastRead = readTimes[key] || "";
    return thread.last_timestamp > lastRead;
  };

  const formatTime = (ts: string) => {
    if (!ts) return "";
    const date = new Date(ts);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    return date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
  };

  const getInitial = (name: string) => name ? name.charAt(0).toUpperCase() : "?";

  const getColor = (name: string) => {
    const colors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  };

  const unreadCount = threads.filter(t => isUnread(t)).length;

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1F2937]">
      <div className="max-w-[700px] mx-auto px-4 md:px-8 py-8 md:py-12">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0F2A44]">私信</h1>
            <p className="text-[#6B7280] text-sm mt-1">
              {unreadCount > 0
                ? <span className="text-[#2B6CB0] font-medium">{unreadCount} 条未读消息</span>
                : threads.length > 0 ? `${threads.length} 个对话` : "暂无私信"}
            </p>
          </div>
        </div>

        {threads.length === 0 && !loading && (
          <div className="text-center py-24 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#F3F4F6] flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#D1D5DB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
            </div>
            <div className="text-[#6B7280] text-sm font-medium">暂无私信</div>
            <p className="text-[#9CA3AF] text-xs mt-1">在案件页面点击「我要回应」开始对话</p>
          </div>
        )}

        <div className="space-y-2">
          {threads.map((thread, index) => {
            const unread = isUnread(thread);
            const displayName = thread.company || thread.case_id;
            const role = currentUser === thread.responder_id ? "与发帖方的对话" : "与回应方的对话";

            return (
              <Link key={index} href={`/messages/${thread.case_id}/${encodeURIComponent(thread.responder_id)}`}>
                <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition cursor-pointer border ${
                  unread
                    ? "bg-white border-[#2B6CB0]/30 shadow-md shadow-blue-100"
                    : "bg-white border-[#E5E7EB] hover:border-[#D1D5DB] hover:shadow-sm"
                }`}>

                  {/* AVATAR with unread ring */}
                  <div className="relative shrink-0">
                    <div className={`w-12 h-12 rounded-full ${getColor(displayName)} flex items-center justify-center`}>
                      <span className="text-white font-bold text-lg">{getInitial(displayName)}</span>
                    </div>
                    {unread && (
                      <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#2B6CB0] border-2 border-white" />
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <div className={`text-sm truncate pr-2 ${unread ? "font-bold text-[#1F2937]" : "font-semibold text-[#4B5563]"}`}>
                        {displayName}
                      </div>
                      <div className={`text-xs shrink-0 ${unread ? "text-[#2B6CB0] font-medium" : "text-[#9CA3AF]"}`}>
                        {formatTime(thread.last_timestamp)}
                      </div>
                    </div>
                    <div className="text-xs text-[#9CA3AF] mb-1">{role}</div>
                    <div className={`text-sm truncate ${unread ? "text-[#1F2937] font-medium" : "text-[#9CA3AF]"}`}>
                      {thread.last_message || "暂无消息"}
                    </div>
                  </div>

                  {/* UNREAD COUNT BADGE */}
                  {unread && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#2B6CB0] shrink-0" />
                  )}

                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </main>
  );
}