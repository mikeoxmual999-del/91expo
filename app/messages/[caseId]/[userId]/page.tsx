"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

type Message = {
  sender: string;
  text: string;
  timestamp: string;
};

type DMThread = {
  caseId: string;
  posterId: string;
  responderId: string;
  messages: Message[];
  lastReadBy?: Record<string, string>;
};

export default function DMPage() {
  const params = useParams();
  const router = useRouter();

  const caseId = Array.isArray(params.caseId) ? params.caseId[0] : (params.caseId as string);
  const responderId = decodeURIComponent(
    Array.isArray(params.userId) ? params.userId[0] : (params.userId as string)
  );

  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [caseCompany, setCaseCompany] = useState<string>("");
  const [thread, setThread] = useState<DMThread | null>(null);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const threadKey = `dm_${caseId}_${responderId}`;

  const markAsRead = (t: DMThread, user: string) => {
    const now = new Date().toISOString();
    const updated: DMThread = {
      ...t,
      lastReadBy: { ...t.lastReadBy, [user]: now },
    };
    localStorage.setItem(threadKey, JSON.stringify(updated));
    return updated;
  };

  const loadThread = (user: string) => {
    const stored = localStorage.getItem(threadKey);
    if (stored) {
      let t: DMThread = JSON.parse(stored);
      t = markAsRead(t, user);
      setThread(t);
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
    if (!user) {
      router.replace("/login");
      return;
    }
    setCurrentUser(user);

    const cases = localStorage.getItem("cases");
    if (cases) {
      const data = JSON.parse(cases);
      const caseData = data[caseId];
      if (caseData) setCaseCompany(caseData.company);
    }

    loadThread(user);
  }, [caseId, responderId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages]);

  const handleSend = () => {
    if (!input.trim() || !currentUser || !thread) return;

    const isAllowed =
      currentUser === thread.posterId || currentUser === thread.responderId;
    if (!isAllowed) return;

    const newMessage: Message = {
      sender: currentUser,
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const updated: DMThread = {
      ...thread,
      messages: [...thread.messages, newMessage],
      lastReadBy: {
        ...thread.lastReadBy,
        [currentUser]: new Date().toISOString(),
      },
    };

    localStorage.setItem(threadKey, JSON.stringify(updated));
    setThread(updated);
    setInput("");
  };

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const otherUser =
    currentUser === thread?.posterId ? thread?.responderId : thread?.posterId;

  if (
    thread &&
    currentUser &&
    currentUser !== thread.posterId &&
    currentUser !== thread.responderId
  ) {
    return (
      <main className="min-h-screen bg-[#0B0F14] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <div className="text-white/50 text-sm">你无权查看此对话</div>
          <Link href="/" className="mt-6 inline-block text-blue-400 hover:text-blue-300 text-sm">
            ← 返回首页
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0F14] text-white flex flex-col">
      <div className="max-w-[800px] w-full mx-auto px-6 py-10 flex flex-col flex-1">

        {/* BACK */}
        <Link
          href="/messages"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-8 transition"
        >
          ← 返回私信列表
        </Link>

        {/* HEADER */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl px-6 py-4 mb-6">
          <div className="text-xs text-white/30 uppercase tracking-widest mb-1">私信对话</div>
          <div className="text-white font-medium">{caseCompany}</div>
          <div className="text-xs text-white/40 mt-1">
            与 <span className="text-blue-400">{otherUser || "..."}</span> 的私信
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 bg-[#111827] border border-white/10 rounded-2xl p-6 mb-4 overflow-y-auto min-h-[400px] max-h-[520px] flex flex-col gap-4">

          {(!thread || thread.messages.length === 0) && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-3">💬</div>
                <div className="text-white/30 text-sm">暂无消息，发送第一条消息开始对话</div>
              </div>
            </div>
          )}

          {thread?.messages.map((msg, index) => {
            const isMe = msg.sender === currentUser;
            return (
              <div
                key={index}
                className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}
              >
                <div className="text-xs text-white/25 px-1">
                  {isMe ? "我" : msg.sender} · {formatTime(msg.timestamp)}
                </div>
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white/10 text-white/90 rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="输入消息..."
            className="flex-1 bg-[#111827] border border-white/10 px-4 py-3 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed px-6 py-3 rounded-xl text-sm transition"
          >
            发送
          </button>
        </div>

      </div>
    </main>
  );
}