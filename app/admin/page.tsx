"use client";
 
import Link from "next/link";
import { useState, useEffect } from "react";
 
type CaseItem = {
  id: string;
  company: string;
  amount: string;
  status: string;
  type: string;
  desc: string;
  date?: string;
  timeline?: string[];
  creator?: string;
  paid?: boolean;
};
 
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
};
 
type CoordinationRequest = {
  caseId: string;
  amount: string;
  desc: string;
  contact: string;
  date: string;
};
 
const ADMIN_PASSWORD = "Baobei1109";
 
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<"pending" | "all" | "dms" | "coordination">("pending");
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [dmThreads, setDmThreads] = useState<DMThread[]>([]);
  const [expandedDm, setExpandedDm] = useState<string | null>(null);
  const [coordRequests, setCoordRequests] = useState<CoordinationRequest[]>([]);
 
  const loadCases = () => {
    const stored = localStorage.getItem("cases");
    if (!stored) return;
    const data = JSON.parse(stored);
    const all = Object.entries(data)
      .map(([id, value]: any) => ({ id, ...value }))
      .sort((a: any, b: any) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    setCases(all);
  };
 
  const loadDMs = () => {
    const threads: DMThread[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("dm_")) {
        try {
          const thread = JSON.parse(localStorage.getItem(key) || "");
          threads.push(thread);
        } catch {}
      }
    }
    threads.sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1]?.timestamp || "";
      const bLast = b.messages[b.messages.length - 1]?.timestamp || "";
      return bLast.localeCompare(aLast);
    });
    setDmThreads(threads);
  };
 
  const loadCoordination = () => {
    const stored = localStorage.getItem("coordination_requests");
    if (!stored) return;
    try {
      const data = JSON.parse(stored);
      const sorted = data.sort((a: CoordinationRequest, b: CoordinationRequest) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setCoordRequests(sorted);
    } catch {}
  };
 
  useEffect(() => {
    if (authed) {
      loadCases();
      loadDMs();
      loadCoordination();
    }
  }, [authed]);
 
  const handleLogin = () => {
    if (input === ADMIN_PASSWORD) {
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
    }
  };
 
  const handleApprove = (id: string) => {
    const confirmed = confirm("确认批准结案？该记录将标记为已解决。");
    if (!confirmed) return;
    const stored = localStorage.getItem("cases");
    if (!stored) return;
    const data = JSON.parse(stored);
    if (!data[id]) return;
    const now = new Date().toLocaleString("zh-CN");
    if (!data[id].timeline) data[id].timeline = [];
    data[id].timeline.push(`✅ 管理员已批准结案 · ${now}`);
    data[id].status = "已解决";
    localStorage.setItem("cases", JSON.stringify(data));
    loadCases();
  };
 
  const handleReject = (id: string) => {
    const confirmed = confirm("确认驳回结案申请？该记录将返回协商中状态。");
    if (!confirmed) return;
    const stored = localStorage.getItem("cases");
    if (!stored) return;
    const data = JSON.parse(stored);
    if (!data[id]) return;
    const now = new Date().toLocaleString("zh-CN");
    if (!data[id].timeline) data[id].timeline = [];
    data[id].timeline.push(`❌ 管理员驳回结案申请，记录返回协商中 · ${now}`);
    data[id].status = "协商中";
    localStorage.setItem("cases", JSON.stringify(data));
    loadCases();
  };
 
  const handleDelete = (id: string) => {
    const confirmed = confirm("确认删除该记录？\n\n删除后将无法恢复。");
    if (!confirmed) return;
    const stored = localStorage.getItem("cases");
    if (!stored) return;
    const data = JSON.parse(stored);
    delete data[id];
    localStorage.setItem("cases", JSON.stringify(data));
    loadCases();
  };
 
  const handleDeleteCoord = (index: number) => {
    const confirmed = confirm("确认删除此协调请求？");
    if (!confirmed) return;
    const updated = coordRequests.filter((_, i) => i !== index);
    setCoordRequests(updated);
    localStorage.setItem("coordination_requests", JSON.stringify(updated));
  };
 
  const statusColor = (status: string) => {
    if (status === "未回应") return "text-red-400 bg-red-500/10 border border-red-500/20";
    if (status === "协商中") return "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20";
    if (status === "申请结案中") return "text-orange-400 bg-orange-500/10 border border-orange-500/20";
    return "text-green-400 bg-green-500/10 border border-green-500/20";
  };
 
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "日期未知";
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
 
  const formatTime = (ts: string) => {
    if (!ts) return "";
    return new Date(ts).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
 
  const getCaseCompany = (caseId: string) => {
    const c = cases.find((x) => x.id === caseId);
    return c?.company || caseId;
  };
 
  const pending = cases.filter((c) => c.status === "申请结案中");
 
  // LOGIN SCREEN
  if (!authed) {
    return (
      <main className="min-h-screen bg-[#0B0F14] text-white flex items-center justify-center">
        <div className="w-full max-w-[400px] px-6">
          <div className="mb-8 text-center">
            <div className="text-white/30 text-xs uppercase tracking-widest mb-2">管理员入口</div>
            <h1 className="text-2xl font-semibold">后台登录</h1>
          </div>
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 space-y-5">
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                管理员密码
              </label>
              <input
                type="password"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(false); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="请输入密码"
                className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition text-sm"
              />
              {error && <p className="text-red-400 text-xs mt-2">密码错误，请重试</p>}
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-sm font-medium transition"
            >
              进入后台
            </button>
          </div>
        </div>
      </main>
    );
  }
 
  // ADMIN DASHBOARD
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <div className="max-w-[1000px] mx-auto px-8 py-16">
 
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="text-xs text-white/30 uppercase tracking-widest mb-1">管理员后台</div>
            <h1 className="text-2xl font-semibold">管理控制台</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/create"
              className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg text-sm transition"
            >
              + 发布记录
            </Link>
            <button
              onClick={() => setAuthed(false)}
              className="text-sm text-white/30 hover:text-white/60 transition"
            >
              退出后台
            </button>
          </div>
        </div>
 
        {/* STATS ROW */}
        <div className="grid grid-cols-6 gap-4 mb-10">
          <div className="bg-[#111827] border border-white/10 rounded-xl px-4 py-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{cases.length}</div>
            <div className="text-xs text-white/40">全部记录</div>
          </div>
          <div className="bg-[#111827] border border-orange-500/20 rounded-xl px-4 py-4 text-center">
            <div className="text-2xl font-bold text-orange-400 mb-1">{pending.length}</div>
            <div className="text-xs text-white/40">待审核结案</div>
          </div>
          <div className="bg-[#111827] border border-green-500/20 rounded-xl px-4 py-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {cases.filter((c) => c.status === "已解决").length}
            </div>
            <div className="text-xs text-white/40">已解决</div>
          </div>
          <div className="bg-[#111827] border border-blue-500/20 rounded-xl px-4 py-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">{dmThreads.length}</div>
            <div className="text-xs text-white/40">私信对话</div>
          </div>
          <div className="bg-[#111827] border border-purple-500/20 rounded-xl px-4 py-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">{coordRequests.length}</div>
            <div className="text-xs text-white/40">协调请求</div>
          </div>
          <div className="bg-[#111827] border border-yellow-500/20 rounded-xl px-4 py-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">{cases.filter(c => !c.paid && c.creator !== "system").length}</div>
            <div className="text-xs text-white/40">待付款</div>
          </div>
        </div>
 
        {/* TABS */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <button
            onClick={() => setTab("pending")}
            className={`px-5 py-2.5 rounded-lg text-sm border transition ${
              tab === "pending"
                ? "bg-orange-500/20 border-orange-500/40 text-orange-400"
                : "bg-white/5 border-white/10 text-white/50 hover:text-white"
            }`}
          >
            结案审核
            {pending.length > 0 && (
              <span className="ml-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {pending.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("all")}
            className={`px-5 py-2.5 rounded-lg text-sm border transition ${
              tab === "all"
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white/5 border-white/10 text-white/50 hover:text-white"
            }`}
          >
            所有记录
            <span className="ml-2 text-xs opacity-60">{cases.length}</span>
          </button>
          <button
            onClick={() => { setTab("dms"); loadDMs(); }}
            className={`px-5 py-2.5 rounded-lg text-sm border transition ${
              tab === "dms"
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white/5 border-white/10 text-white/50 hover:text-white"
            }`}
          >
            所有私信
            <span className="ml-2 text-xs opacity-60">{dmThreads.length}</span>
          </button>
          <button
            onClick={() => { setTab("coordination"); loadCoordination(); }}
            className={`px-5 py-2.5 rounded-lg text-sm border transition ${
              tab === "coordination"
                ? "bg-purple-600 border-purple-600 text-white"
                : "bg-white/5 border-white/10 text-white/50 hover:text-white"
            }`}
          >
            协调请求
            {coordRequests.length > 0 && (
              <span className="ml-2 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {coordRequests.length}
              </span>
            )}
          </button>
        </div>
 
        {/* TAB: PENDING */}
        {tab === "pending" && (
          <div>
            {pending.length === 0 && (
              <div className="text-center py-24">
                <div className="text-white/20 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <div className="text-white/40 text-sm">暂无待审核的结案申请</div>
              </div>
            )}
            <div className="space-y-4">
              {pending.map((c) => (
                <div key={c.id} className="bg-[#111827] border border-orange-500/20 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-white font-semibold text-lg">{c.company}</div>
                      <div className="text-blue-400 font-bold mt-1">{c.amount}</div>
                    </div>
                    <div className="text-xs px-3 py-1 rounded-full text-orange-400 bg-orange-500/10 border border-orange-500/20">
                      申请结案中
                    </div>
                  </div>
                  <div className="text-xs text-white/40 mb-2">{c.type}</div>
                  <div className="text-sm text-white/60 mb-4 leading-relaxed">{c.desc}</div>
                  <div className="text-xs text-white/25 mb-5 border-t border-white/5 pt-3">
                    发布于 {formatDate(c.date)} · 创建者：{c.creator || "未知"}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleApprove(c.id)} className="bg-green-600 hover:bg-green-500 px-6 py-2.5 rounded-lg text-sm transition">✅ 批准结案</button>
                    <button onClick={() => handleReject(c.id)} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-6 py-2.5 rounded-lg text-sm transition">❌ 驳回申请</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
 
        {/* TAB: ALL RECORDS */}
        {tab === "all" && (
          <div>
            {cases.length === 0 && (
              <div className="text-center py-24">
                <div className="text-white/40 text-sm">平台暂无任何记录</div>
              </div>
            )}
            <div className="space-y-4">
              {cases.map((c) => (
                <div key={c.id} className="bg-[#111827] border border-white/10 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-white font-semibold">{c.company}</div>
                      <div className="text-blue-400 font-bold mt-1">{c.amount}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!c.paid && c.creator !== "system" && (
                        <span className="text-xs px-2 py-1 rounded-full text-yellow-400 bg-yellow-500/10 border border-yellow-500/20">待付款</span>
                      )}
                      <div className={`text-xs px-3 py-1 rounded-full ${statusColor(c.status)}`}>{c.status}</div>
                    </div>
                  </div>
                  <div className="text-xs text-white/40 mb-2">{c.type}</div>
                  <div className="text-sm text-white/60 mb-4 leading-relaxed">{c.desc}</div>
                  <div className="text-xs text-white/25 mb-5 border-t border-white/5 pt-3">
                    发布于 {formatDate(c.date)} · 创建者：{c.creator || "未知"}
                  </div>
                  <button onClick={() => handleDelete(c.id)} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-5 py-2 rounded-lg text-sm transition">
                    🗑️ 删除记录
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
 
        {/* TAB: ALL DMs */}
        {tab === "dms" && (
          <div>
            {dmThreads.length === 0 && (
              <div className="text-center py-24">
                <div className="text-white/40 text-sm">暂无私信记录</div>
              </div>
            )}
            <div className="space-y-4">
              {dmThreads.map((thread, index) => {
                const key = `${thread.caseId}_${thread.responderId}`;
                const isExpanded = expandedDm === key;
                const lastMsg = thread.messages[thread.messages.length - 1];
                return (
                  <div key={index} className="bg-[#111827] border border-white/10 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedDm(isExpanded ? null : key)}
                      className="w-full px-6 py-5 flex justify-between items-start hover:bg-white/5 transition text-left"
                    >
                      <div>
                        <div className="text-white font-medium text-sm mb-1">📁 案件：{getCaseCompany(thread.caseId)}</div>
                        <div className="text-xs text-white/40">发帖人：{thread.posterId} · 回应者：{thread.responderId}</div>
                        {lastMsg && <div className="text-xs text-white/30 mt-2 truncate max-w-[500px]">最新：{lastMsg.text}</div>}
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <div className="text-xs text-white/30 mb-1">{thread.messages.length} 条消息</div>
                        <div className="text-xs text-white/20">{lastMsg ? formatTime(lastMsg.timestamp) : ""}</div>
                        <div className="text-white/40 text-xs mt-2">{isExpanded ? "▲ 收起" : "▼ 展开"}</div>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-white/10 px-6 py-5 space-y-4 max-h-[400px] overflow-y-auto">
                        {thread.messages.length === 0 && <div className="text-white/30 text-sm text-center py-4">暂无消息</div>}
                        {thread.messages.map((msg, mIndex) => (
                          <div key={mIndex} className="flex flex-col gap-1">
                            <div className="text-xs text-white/30">{msg.sender} · {formatTime(msg.timestamp)}</div>
                            <div className="bg-white/5 rounded-xl px-4 py-3 text-sm text-white/80 leading-relaxed">{msg.text}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
 
        {/* TAB: COORDINATION */}
        {tab === "coordination" && (
          <div>
            {coordRequests.length === 0 && (
              <div className="text-center py-24">
                <div className="text-white/40 text-sm">暂无协调请求</div>
              </div>
            )}
            <div className="space-y-4">
              {coordRequests.map((req, index) => (
                <div key={index} className="bg-[#111827] border border-purple-500/20 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-white font-semibold text-lg">
                        {getCaseCompany(req.caseId)}
                      </div>
                      <div className="text-xs text-white/30 mt-1">
                        案件 ID：{req.caseId}
                      </div>
                    </div>
                    <div className="text-xs px-3 py-1 rounded-full text-purple-400 bg-purple-500/10 border border-purple-500/20">
                      协调请求
                    </div>
                  </div>
 
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/5 rounded-xl px-4 py-3">
                      <div className="text-xs text-white/30 mb-1">期望解决金额</div>
                      <div className="text-white text-sm font-medium">{req.amount || "未填写"}</div>
                    </div>
                    <div className="bg-white/5 rounded-xl px-4 py-3">
                      <div className="text-xs text-white/30 mb-1">联系方式</div>
                      <div className="text-blue-400 text-sm font-medium">{req.contact || "未填写"}</div>
                    </div>
                  </div>
 
                  {req.desc && (
                    <div className="bg-white/5 rounded-xl px-4 py-3 mb-4">
                      <div className="text-xs text-white/30 mb-1">补充说明</div>
                      <div className="text-white/70 text-sm leading-relaxed">{req.desc}</div>
                    </div>
                  )}
 
                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="text-xs text-white/25">
                      提交于 {formatDate(req.date)}
                    </div>
                    <div className="flex gap-3">
                      <Link
                        href={`/case/${req.caseId}`}
                        className="border border-white/20 hover:border-white/40 text-white/60 px-4 py-2 rounded-lg text-xs transition"
                      >
                        查看案件
                      </Link>
                      <button
                        onClick={() => handleDeleteCoord(index)}
                        className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-xs transition"
                      >
                        删除请求
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
 
      </div>
    </main>
  );
}