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
  description?: string;
  date?: string;
  timeline?: string[];
  creator?: string;
  paid?: boolean;
};

type Message = { sender: string; text: string; timestamp: string; };
type DMThread = { caseId: string; posterId: string; responderId: string; messages: Message[]; };
type CoordinationRequest = { caseId: string; amount: string; desc: string; contact: string; date: string; };

const ADMIN_PASSWORD = "Baobei1109";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<"pending" | "all" | "dms" | "coordination" | "post">("pending");
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [dmThreads, setDmThreads] = useState<DMThread[]>([]);
  const [expandedDm, setExpandedDm] = useState<string | null>(null);
  const [coordRequests, setCoordRequests] = useState<CoordinationRequest[]>([]);

  // FREE POST FORM
  const [postForm, setPostForm] = useState({ company: "", amount: "", type: "", desc: "" });
  const [posting, setPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  const loadCases = async () => {
    try {
      const res = await fetch("/api/cases?all=true");
      if (res.ok) {
        const data = await res.json();
        const arr = data.map((c: any) => ({ ...c, desc: c.description || c.desc || "" }))
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setCases(arr);
        return;
      }
    } catch {}
    const stored = localStorage.getItem("cases");
    if (!stored) return;
    const data = JSON.parse(stored);
    setCases(Object.entries(data).map(([id, value]: any) => ({ id, ...value }))
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const loadDMs = () => {
    const threads: DMThread[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("dm_")) {
        try { threads.push(JSON.parse(localStorage.getItem(key) || "")); } catch {}
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
      setCoordRequests(data.sort((a: CoordinationRequest, b: CoordinationRequest) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch {}
  };

  useEffect(() => {
    if (authed) { loadCases(); loadDMs(); loadCoordination(); }
  }, [authed]);

  const handleLogin = () => {
    if (input === ADMIN_PASSWORD) { setAuthed(true); setError(false); }
    else setError(true);
  };

  const handleApprove = async (id: string) => {
    if (!confirm("确认批准结案？")) return;
    const now = new Date().toLocaleString("zh-CN");
    const c = cases.find(x => x.id === id);
    const timeline = [...(c?.timeline || []), `✅ 管理员已批准结案 · ${now}`];
    try { await fetch("/api/cases", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "已解决", timeline }) }); } catch {}
    const stored = localStorage.getItem("cases");
    if (stored) { const data = JSON.parse(stored); if (data[id]) { data[id].timeline = timeline; data[id].status = "已解决"; localStorage.setItem("cases", JSON.stringify(data)); } }
    loadCases();
  };

  const handleReject = async (id: string) => {
    if (!confirm("确认驳回结案申请？")) return;
    const now = new Date().toLocaleString("zh-CN");
    const c = cases.find(x => x.id === id);
    const timeline = [...(c?.timeline || []), `❌ 管理员驳回结案申请 · ${now}`];
    try { await fetch("/api/cases", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "协商中", timeline }) }); } catch {}
    const stored = localStorage.getItem("cases");
    if (stored) { const data = JSON.parse(stored); if (data[id]) { data[id].timeline = timeline; data[id].status = "协商中"; localStorage.setItem("cases", JSON.stringify(data)); } }
    loadCases();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确认删除该记录？删除后将无法恢复。")) return;
    try { await fetch("/api/cases", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); } catch {}
    const stored = localStorage.getItem("cases");
    if (stored) { const data = JSON.parse(stored); delete data[id]; localStorage.setItem("cases", JSON.stringify(data)); }
    loadCases();
  };

  const handleDeleteCoord = (index: number) => {
    if (!confirm("确认删除此协调请求？")) return;
    const updated = coordRequests.filter((_, i) => i !== index);
    setCoordRequests(updated);
    localStorage.setItem("coordination_requests", JSON.stringify(updated));
  };

  const handleFreePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.company.trim() || !postForm.amount.trim() || !postForm.desc.trim()) {
      alert("请填写企业名称、涉及金额及纠纷描述");
      return;
    }
    setPosting(true);
    const newId = Date.now().toString();
    const now = new Date().toLocaleString("zh-CN");
    const caseData = {
      id: newId,
      company: postForm.company.trim(),
      amount: postForm.amount.trim(),
      status: "未回应",
      type: postForm.type || "未分类",
      description: postForm.desc.trim(),
      creator: "admin",
      paid: true,
      plan: "basic",
      duration: "permanent",
      timeline: [`📋 管理员免费发布 · ${now}`],
    };

    // save to DB
    try {
      await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(caseData),
      });
    } catch {}

    // save to localStorage
    const stored = localStorage.getItem("cases");
    const localCases = stored ? JSON.parse(stored) : {};
    localCases[newId] = { ...caseData, desc: postForm.desc.trim(), date: new Date().toISOString() };
    localStorage.setItem("cases", JSON.stringify(localCases));

    setPostForm({ company: "", amount: "", type: "", desc: "" });
    setPosting(false);
    setPostSuccess(true);
    setTimeout(() => setPostSuccess(false), 3000);
    loadCases();
  };

  const statusColor = (status: string) => {
    if (status === "未回应") return "text-red-400 bg-red-500/10 border border-red-500/20";
    if (status === "协商中") return "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20";
    if (status === "申请结案中") return "text-orange-400 bg-orange-500/10 border border-orange-500/20";
    return "text-green-400 bg-green-500/10 border border-green-500/20";
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "日期未知";
    return new Date(dateStr).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
  };

  const formatTime = (ts: string) => {
    if (!ts) return "";
    return new Date(ts).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  const getCaseCompany = (caseId: string) => cases.find((x) => x.id === caseId)?.company || caseId;
  const pending = cases.filter((c) => c.status === "申请结案中");

  const inputClass = "w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition text-sm";

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
              <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">管理员密码</label>
              <input type="password" value={input} onChange={(e) => { setInput(e.target.value); setError(false); }} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="请输入密码" className={inputClass} />
              {error && <p className="text-red-400 text-xs mt-2">密码错误，请重试</p>}
            </div>
            <button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-sm font-medium transition">进入后台</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <div className="max-w-[1000px] mx-auto px-8 py-16">

        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="text-xs text-white/30 uppercase tracking-widest mb-1">管理员后台</div>
            <h1 className="text-2xl font-semibold">管理控制台</h1>
          </div>
          <button onClick={() => setAuthed(false)} className="text-sm text-white/30 hover:text-white/60 transition">退出后台</button>
        </div>

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
            <div className="text-2xl font-bold text-green-400 mb-1">{cases.filter((c) => c.status === "已解决").length}</div>
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

        <div className="flex gap-3 mb-8 flex-wrap">
          <button onClick={() => setTab("pending")} className={`px-5 py-2.5 rounded-lg text-sm border transition ${tab === "pending" ? "bg-orange-500/20 border-orange-500/40 text-orange-400" : "bg-white/5 border-white/10 text-white/50 hover:text-white"}`}>
            结案审核{pending.length > 0 && <span className="ml-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pending.length}</span>}
          </button>
          <button onClick={() => setTab("all")} className={`px-5 py-2.5 rounded-lg text-sm border transition ${tab === "all" ? "bg-blue-600 border-blue-600 text-white" : "bg-white/5 border-white/10 text-white/50 hover:text-white"}`}>
            所有记录<span className="ml-2 text-xs opacity-60">{cases.length}</span>
          </button>
          <button onClick={() => { setTab("dms"); loadDMs(); }} className={`px-5 py-2.5 rounded-lg text-sm border transition ${tab === "dms" ? "bg-blue-600 border-blue-600 text-white" : "bg-white/5 border-white/10 text-white/50 hover:text-white"}`}>
            所有私信<span className="ml-2 text-xs opacity-60">{dmThreads.length}</span>
          </button>
          <button onClick={() => { setTab("coordination"); loadCoordination(); }} className={`px-5 py-2.5 rounded-lg text-sm border transition ${tab === "coordination" ? "bg-purple-600 border-purple-600 text-white" : "bg-white/5 border-white/10 text-white/50 hover:text-white"}`}>
            协调请求{coordRequests.length > 0 && <span className="ml-2 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">{coordRequests.length}</span>}
          </button>
          <button onClick={() => setTab("post")} className={`px-5 py-2.5 rounded-lg text-sm border transition ${tab === "post" ? "bg-green-600 border-green-600 text-white" : "bg-white/5 border-white/10 text-white/50 hover:text-white"}`}>
            ✍️ 免费发布
          </button>
        </div>

        {tab === "pending" && (
          <div>
            {pending.length === 0 && <div className="text-center py-24"><div className="text-white/40 text-sm">暂无待审核的结案申请</div></div>}
            <div className="space-y-4">
              {pending.map((c) => (
                <div key={c.id} className="bg-[#111827] border border-orange-500/20 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div><div className="text-white font-semibold text-lg">{c.company}</div><div className="text-blue-400 font-bold mt-1">{c.amount}</div></div>
                    <div className="text-xs px-3 py-1 rounded-full text-orange-400 bg-orange-500/10 border border-orange-500/20">申请结案中</div>
                  </div>
                  <div className="text-xs text-white/40 mb-2">{c.type}</div>
                  <div className="text-sm text-white/60 mb-4 leading-relaxed">{c.desc}</div>
                  <div className="text-xs text-white/25 mb-5 border-t border-white/5 pt-3">发布于 {formatDate(c.date)} · 创建者：{c.creator || "未知"}</div>
                  <div className="flex gap-3">
                    <button onClick={() => handleApprove(c.id)} className="bg-green-600 hover:bg-green-500 px-6 py-2.5 rounded-lg text-sm transition">✅ 批准结案</button>
                    <button onClick={() => handleReject(c.id)} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-6 py-2.5 rounded-lg text-sm transition">❌ 驳回申请</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "all" && (
          <div>
            {cases.length === 0 && <div className="text-center py-24"><div className="text-white/40 text-sm">平台暂无任何记录</div></div>}
            <div className="space-y-4">
              {cases.map((c) => (
                <div key={c.id} className="bg-[#111827] border border-white/10 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div><div className="text-white font-semibold">{c.company}</div><div className="text-blue-400 font-bold mt-1">{c.amount}</div></div>
                    <div className="flex items-center gap-2">
                      {!c.paid && c.creator !== "system" && <span className="text-xs px-2 py-1 rounded-full text-yellow-400 bg-yellow-500/10 border border-yellow-500/20">待付款</span>}
                      <div className={`text-xs px-3 py-1 rounded-full ${statusColor(c.status)}`}>{c.status}</div>
                    </div>
                  </div>
                  <div className="text-xs text-white/40 mb-2">{c.type}</div>
                  <div className="text-sm text-white/60 mb-4 leading-relaxed">{c.desc}</div>
                  <div className="text-xs text-white/25 mb-5 border-t border-white/5 pt-3">发布于 {formatDate(c.date)} · 创建者：{c.creator || "未知"}</div>
                  <button onClick={() => handleDelete(c.id)} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-5 py-2 rounded-lg text-sm transition">🗑️ 删除记录</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "dms" && (
          <div>
            {dmThreads.length === 0 && <div className="text-center py-24"><div className="text-white/40 text-sm">暂无私信记录</div></div>}
            <div className="space-y-4">
              {dmThreads.map((thread, index) => {
                const key = `${thread.caseId}_${thread.responderId}`;
                const isExpanded = expandedDm === key;
                const lastMsg = thread.messages[thread.messages.length - 1];
                return (
                  <div key={index} className="bg-[#111827] border border-white/10 rounded-xl overflow-hidden">
                    <button onClick={() => setExpandedDm(isExpanded ? null : key)} className="w-full px-6 py-5 flex justify-between items-start hover:bg-white/5 transition text-left">
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

        {tab === "coordination" && (
          <div>
            {coordRequests.length === 0 && <div className="text-center py-24"><div className="text-white/40 text-sm">暂无协调请求</div></div>}
            <div className="space-y-4">
              {coordRequests.map((req, index) => (
                <div key={index} className="bg-[#111827] border border-purple-500/20 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div><div className="text-white font-semibold text-lg">{getCaseCompany(req.caseId)}</div><div className="text-xs text-white/30 mt-1">案件 ID：{req.caseId}</div></div>
                    <div className="text-xs px-3 py-1 rounded-full text-purple-400 bg-purple-500/10 border border-purple-500/20">协调请求</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/5 rounded-xl px-4 py-3"><div className="text-xs text-white/30 mb-1">期望解决金额</div><div className="text-white text-sm font-medium">{req.amount || "未填写"}</div></div>
                    <div className="bg-white/5 rounded-xl px-4 py-3"><div className="text-xs text-white/30 mb-1">联系方式</div><div className="text-blue-400 text-sm font-medium">{req.contact || "未填写"}</div></div>
                  </div>
                  {req.desc && <div className="bg-white/5 rounded-xl px-4 py-3 mb-4"><div className="text-xs text-white/30 mb-1">补充说明</div><div className="text-white/70 text-sm leading-relaxed">{req.desc}</div></div>}
                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="text-xs text-white/25">提交于 {formatDate(req.date)}</div>
                    <div className="flex gap-3">
                      <Link href={`/case/${req.caseId}`} className="border border-white/20 hover:border-white/40 text-white/60 px-4 py-2 rounded-lg text-xs transition">查看案件</Link>
                      <button onClick={() => handleDeleteCoord(index)} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-xs transition">删除请求</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "post" && (
          <div>
            <div className="bg-[#111827] border border-green-500/20 rounded-2xl p-8">
              <h2 className="text-lg font-semibold mb-2">免费发布记录</h2>
              <p className="text-white/40 text-sm mb-8">以管理员身份直接发布，无需付款，立即公开。</p>

              {postSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm mb-6">
                  ✅ 发布成功！记录已公开展示。
                </div>
              )}

              <form onSubmit={handleFreePost} className="space-y-6">
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">企业名称 <span className="text-red-400">*</span></label>
                  <input value={postForm.company} onChange={(e) => setPostForm({ ...postForm, company: e.target.value })} placeholder="例：深圳某贸易有限公司" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">涉及金额 <span className="text-red-400">*</span></label>
                  <input value={postForm.amount} onChange={(e) => setPostForm({ ...postForm, amount: e.target.value })} placeholder="例：¥120,000" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">纠纷类型</label>
                  <select value={postForm.type} onChange={(e) => setPostForm({ ...postForm, type: e.target.value })} className={`${inputClass} bg-[#0B0F14] cursor-pointer`}>
                    <option value="">请选择类型</option>
                    <option value="货款纠纷">货款纠纷</option>
                    <option value="合同纠纷">合同纠纷</option>
                    <option value="工程款">工程款</option>
                    <option value="劳动争议">劳动争议</option>
                    <option value="知识产权">知识产权</option>
                    <option value="服务纠纷">服务纠纷</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">纠纷描述 <span className="text-red-400">*</span></label>
                  <textarea value={postForm.desc} onChange={(e) => setPostForm({ ...postForm, desc: e.target.value })} placeholder="请简要描述纠纷经过..." rows={5} className={`${inputClass} resize-none`} />
                  <div className="text-right text-xs text-white/20 mt-1">{postForm.desc.length} 字</div>
                </div>
                <div className="border-t border-white/10" />
                <button type="submit" disabled={posting} className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl text-sm font-medium transition">
                  {posting ? "发布中..." : "✍️ 立即免费发布"}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}