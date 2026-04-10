"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type DMThread = {
  caseId: string;
  posterId: string;
  responderId: string;
  messages: { sender: string; text: string; timestamp: string }[];
};

export default function InboxPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = Array.isArray(params.caseId) ? params.caseId[0] : (params.caseId as string);

  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [caseCompany, setCaseCompany] = useState("");
  const [threads, setThreads] = useState<DMThread[]>([]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) { router.replace("/login"); return; }
    setCurrentUser(user);

    const cases = localStorage.getItem("cases");
    if (cases) {
      const data = JSON.parse(cases);
      const caseData = data[caseId];
      if (caseData) setCaseCompany(caseData.company);
    }

    const found: DMThread[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`dm_${caseId}_`)) {
        try { found.push(JSON.parse(localStorage.getItem(key) || "")); } catch {}
      }
    }
    found.sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1]?.timestamp || "";
      const bLast = b.messages[b.messages.length - 1]?.timestamp || "";
      return bLast.localeCompare(aLast);
    });
    setThreads(found);
  }, [caseId]);

  const formatTime = (ts: string) => {
    if (!ts) return "";
    return new Date(ts).toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1F2937]">
      <div className="max-w-[800px] mx-auto px-8 py-16">

        <Link href={`/case/${caseId}`} className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] text-sm mb-10 transition">
          ← 返回案件详情
        </Link>

        <div className="mb-8">
          <div className="text-xs text-[#9CA3AF] uppercase tracking-widest mb-1">私信收件箱</div>
          <h1 className="text-2xl font-bold text-[#0F2A44]">{caseCompany}</h1>
          <p className="text-[#6B7280] text-sm mt-1">以下是所有对此案件发起私信的用户</p>
        </div>

        {threads.length === 0 && (
          <div className="text-center py-24 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-[#D1D5DB] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
            <div className="text-[#6B7280] text-sm">暂无私信</div>
          </div>
        )}

        <div className="space-y-3">
          {threads.map((thread, index) => {
            const lastMsg = thread.messages[thread.messages.length - 1];
            const otherUser = thread.responderId;
            return (
              <Link key={index} href={`/messages/${caseId}/${encodeURIComponent(otherUser)}`}>
                <div className="bg-white border border-[#E5E7EB] rounded-xl px-6 py-5 hover:shadow-md transition cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                      </svg>
                      <div className="text-[#1F2937] font-semibold text-sm">{otherUser}</div>
                    </div>
                    {lastMsg && <div className="text-xs text-[#9CA3AF]">{formatTime(lastMsg.timestamp)}</div>}
                  </div>
                  <div className="text-[#6B7280] text-sm truncate pl-7">{lastMsg ? lastMsg.text : "暂无消息"}</div>
                  <div className="text-xs text-[#9CA3AF] mt-2 pl-7">共 {thread.messages.length} 条消息</div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </main>
  );
}