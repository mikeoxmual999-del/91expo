"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

type Message = { sender: string; text: string; timestamp: string; };
type DMThread = { caseId: string; posterId: string; responderId: string; messages: Message[]; lastReadBy?: Record<string, string>; };

export default function DMPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = Array.isArray(params.caseId) ? params.caseId[0] : (params.caseId as string);
  const responderId = decodeURIComponent(Array.isArray(params.userId) ? params.userId[0] : (params.userId as string));

  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [caseCompany, setCaseCompany] = useState<string>("");
  const [thread, setThread] = useState<DMThread | null>(null);
  const [input, setInput] = useState("");
  const [statusUpdated, setStatusUpdated] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const threadKey = `dm_${caseId}_${responderId}`;

  const markAsRead = (t: DMThread, user: string) => {
    const updated: DMThread = { ...t, lastReadBy: { ...t.lastReadBy, [user]: new Date().toISOString() } };
    localStorage.setItem(threadKey, JSON.stringify(updated));
    return updated;
  };

  const loadThread = (user: string) => {
    const stored = localStorage.getItem(threadKey);
    if (stored) {
      let t: DMThread = JSON.parse(stored);
      t = markAsRead(t, user);
      setThread(t);
      // if thread already has messages, mark status as already updated
      if (t.messages.length > 0) setStatusUpdated(true);
    } else {
      const cases = localStorage.getItem("cases");
      if (!cases) return;
      const data = JSON.parse(cases);
      const caseData = data[caseId];
      if (!caseData) return;
      const newThread: DMThread = {
        caseId,
        posterId: caseData.creator || "unknown",
        responderId,
        messages: [],
        lastReadBy: { [user]: new Date().toISOString() },
      };
      localStorage.setItem(threadKey, JSON.stringify(newThread));
      setThread(newThread);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) { router.replace("/login"); return; }
    setCurrentUser(user);

    // load case company from DB first, then localStorage
    const loadCompany = async () => {
      try {
        const res = await fetch(`/api/cases?id=${caseId}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.company) { setCaseCompany(data.company); return; }
        }
      } catch {}
      const cases = localStorage.getItem("cases");
      if (cases) {
        const data = JSON.parse(cases);
        if (data[caseId]?.company) setCaseCompany(data[caseId].company);
      }
    };

    loadCompany();
    loadThread(user);
  }, [caseId, responderId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [thread?.messages]);

  const handleSend = async () => {
    if (!input.trim() || !currentUser || !thread) return;

    const isFirstMessage = thread.messages.length === 0 && !statusUpdated;
    const newMessage: Message = { sender: currentUser, text: input.trim(), timestamp: new Date().toISOString() };
    const updated: DMThread = {
      ...thread,
      messages: [...thread.messages, newMessage],
      lastReadBy: { ...thread.lastReadBy, [currentUser]: new Date().toISOString() },
    };
    localStorage.setItem(threadKey, JSON.stringify(updated));
    setThread(updated);
    setInput("");

    // only on first ever message — update case status to 协商中
    if (isFirstMessage) {
      setStatusUpdated(true);
      const now = new Date().toLocaleString("zh-CN");
      const storedCases = localStorage.getItem("cases");
      if (storedCases) {
        const cases = JSON.parse(storedCases);
        if (cases[caseId] && cases[caseId].status === "未回应") {
          if (!cases[caseId].timeline) cases[caseId].timeline = [];
          cases[caseId].timeline.push(`📩 ${currentUser} 发起了私信联系 · ${now}`);
          cases[caseId].status = "协商中";
          localStorage.setItem("cases", JSON.stringify(cases));
        }
      }
      try {
        const storedCases2 = localStorage.getItem("cases");
        if (storedCases2) {
          const cases2 = JSON.parse(storedCases2);
          if (cases2[caseId]) {
            await fetch("/api/cases", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: caseId, status: "协商中", timeline: cases2[caseId].timeline }),
            });
          }
        }
      } catch {}
    }
  };

  const formatTime = (ts: string) => new Date(ts).toLocaleString("zh-CN", {
    month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  });

  const otherUser = currentUser === thread?.posterId ? thread?.responderId : thread?.posterId;

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1F2937] flex flex-col">
      <div className="max-w-[800px] w-full mx-auto px-6 py-10 flex flex-col flex-1">

        <Link href={`/case/${caseId}`} className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] text-sm mb-8 transition">
          ← 返回案件详情
        </Link>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl px-6 py-4 mb-6 shadow-sm">
          <div className="text-xs text-[#9CA3AF] uppercase tracking-widest mb-1">私信对话</div>
          <div className="text-[#0F2A44] font-bold">{caseCompany || "加载中..."}</div>
          <div className="text-xs text-[#6B7280] mt-1">与 <span className="text-[#2B6CB0] font-medium">{otherUser || "..."}</span> 的私信</div>
        </div>

        <div className="flex-1 bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-4 overflow-y-auto min-h-[400px] max-h-[520px] flex flex-col gap-4 shadow-sm">
          {(!thread || thread.messages.length === 0) && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
                <div className="text-[#9CA3AF] text-sm">暂无消息，发送第一条消息开始对话</div>
              </div>
            </div>
          )}

          {thread?.messages.map((msg, index) => {
            const isMe = msg.sender === currentUser;
            return (
              <div key={index} className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                <div className="text-xs text-[#9CA3AF] px-1">{isMe ? "我" : msg.sender} · {formatTime(msg.timestamp)}</div>
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${isMe ? "bg-[#2B6CB0] text-white rounded-br-sm" : "bg-[#F3F4F6] text-[#1F2937] rounded-bl-sm"}`}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
            placeholder="输入消息..."
            className="flex-1 bg-white border border-[#E5E7EB] px-4 py-3 rounded-xl text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2B6CB0] transition text-sm shadow-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-[#2B6CB0] hover:bg-[#2563a0] disabled:opacity-30 disabled:cursor-not-allowed px-6 py-3 rounded-xl text-sm transition text-white"
          >
            发送
          </button>
        </div>

      </div>
    </main>
  );
}