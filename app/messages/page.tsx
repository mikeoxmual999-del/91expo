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

    // load per-thread read times
    const stored = localStorage.getItem("dm_read_times");
    const times = stored ? JSON.parse(stored) : {};
    setReadTimes(times);

    // mark all as read now
    const now = new Date().toISOString();
    localStorage.setItem("dm_last_cleared", now);

    const load = async () => {
      try {
        const res = await fetch(`/api/messages?caseId=all&userId=${encodeURIComponent(user)}`);
        if (res.ok) {
          const data = await res.json();
          setThreads(data);

          // mark each thread as read
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

      // fallback localStorage
      const found: ThreadSummary[] = [];
      const cases = localStorage.getItem("cases");
      const caseMap: Record<string, string> = {};
      if (cases) {
        const data = JSON.parse(cases);
        Object.entries(data).forEach(([id, val]: any) => { caseMap[id] = val.company; });
      }
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("dm_") && !key.includes("%") && !key.includes("read") && !key.includes("cleared")) {
          try {
            const thread = JSON.parse(localStorage.getItem(key) || "");
            if (thread.posterId === user || thread.responderId === user) {
              const lastMsg = thread.messages[thread.messages.length - 1];
              found.push({
                case_id: thread.caseId,
                company: caseMap[thread.caseId] || thread.caseId,
                responder_id: thread.responderId,
                poster_id: thread.posterId,
                last_message: lastMsg?.text || "",
                last_timestamp: lastMsg?.timestamp || "",
                message_count: thread.messages.length,
              });
            }
          } catch {}
        }
      }
      found.sort((a, b) => b.last_timestamp.localeCompare(a.last_timestamp));
      setThreads(found);
      setLoading(false);
    };

    load();
  }, []);

  const isUnread = (thread: ThreadSummary, user: string) => {
    if (!thread.last_timestamp) return false;
    const key = `${thread.case_id}_${thread.responder_id}`;
    const lastRead = readTimes[key] || "";
    // only unread if last message was NOT sent by current user AND after last read
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

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1F2937]">
      <div className="max-w-[800px] mx-auto px-4 md:px-8 py-10 md:py-16">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0F2A44] mb-1">私信</h1>
            <p className="text-[#6B7280] text-sm">{threads.length > 0 ? `${threads.length} 个对话` : "暂无私信"}</p>
          </div>
        </div>

        {threads.length === 0 && !loading && (
          <div className="text-center py-24 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-[#D1D5DB] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
            <div className="text-[#6B7280] text-sm">暂无私信</div>
            <p className="text-[#9CA3AF] text-xs mt-2">在案件页面点击「我要回应」开始对话</p>
          </div>
        )}

        <div className="space-y-3">
          {threads.map((thread, index) => {
            const otherUser = currentUser === thread.responder_id ? thread.poster_id : thread.responder_id;
            const unread = currentUser ? isUnread(thread, currentUser) : false;
            return (
              <Link key={index} href={`/messages/${thread.case_id}/${encodeURIComponent(thread.responder_id)}`}>
                <div className={`bg-white border rounded-xl px-5 md:px-6 py-4 md:py-5 hover:shadow-md transition cursor-pointer ${unread ? "border-[#2B6CB0]/40" : "border-[#E5E7EB]"}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-[#9CA3AF] mb-1">📁 {thread.company || thread.case_id}</div>
                      <div className={`text-sm mb-1.5 ${unread ? "text-[#1F2937] font-bold" : "text-[#1F2937] font-semibold"}`}>{otherUser}</div>
                      <div className={`text-sm truncate ${unread ? "text-[#1F2937] font-medium" : "text-[#6B7280]"}`}>
                        {thread.last_message || "暂无消息"}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4 shrink-0">
                      <div className="text-xs text-[#9CA3AF]">{formatTime(thread.last_timestamp)}</div>
                      {unread && (
                        <div className="bg-red-500 text-white text-xs w-2 h-2 rounded-full" />
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