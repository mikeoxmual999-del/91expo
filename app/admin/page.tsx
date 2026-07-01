"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

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
  images?: string[];
};

type Message = { sender: string; text: string; timestamp: string; };
type DMThread = { caseId: string; posterId: string; responderId: string; messages: Message[]; };
type CoordinationRequest = { id?: number; caseId: string; amount: string; desc: string; contact: string; date: string; };
type StatusFilter = "全部" | "待付款" | "未回应" | "协商中" | "申请结案中" | "已解决";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<"pending" | "all" | "dms" | "coordination" | "post">("pending");
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [dmThreads, setDmThreads] = useState<DMThread[]>([]);
  const [expandedDm, setExpandedDm] = useState<string | null>(null);
  const [coordRequests, setCoordRequests] = useState<CoordinationRequest[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("全部");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "status">("date");
  const [lightbox, setLightbox] = useState<string | null>(null);

  const [postForm, setPostForm] = useState({ company: "", amount: "", type: "", desc: "", creator: "admin", plan: "basic" });
  const [postImages, setPostImages] = useState<File[]>([]);
  const [postPreviews, setPostPreviews] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [skipAiCompliance, setSkipAiCompliance] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/admin/me", { credentials: "same-origin" });
        const data = await res.json();
        setAuthed(Boolean(data.authenticated));
      } catch {
        setAuthed(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkSession();
  }, []);

  const loadCases = async () => {
    try {
      const res = await fetch("/api/cases?all=true");
      if (res.ok) {
        const data = await res.json();
        const arr = data.map((c: any) => ({
          ...c,
          desc: c.description || c.desc || "",
          images: typeof c.images === "string" ? JSON.parse(c.images) : c.images || [],
        })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

  const loadDMs = async () => {
    try {
      const allCaseIds = cases.map(c => c.id);
      const allThreads: DMThread[] = [];
      for (const caseId of allCaseIds) {
        const res = await fetch(`/api/messages?caseId=${caseId}`);
        if (res.ok) {
          const threads = await res.json();
          for (const t of threads) {
            const msgRes = await fetch(`/api/messages?caseId=${caseId}&responderId=${encodeURIComponent(t.responder_id)}`);
            if (msgRes.ok) {
              const msgs = await msgRes.json();
              allThreads.push({ caseId, posterId: t.poster_id || "", responderId: t.responder_id, messages: msgs.map((m: any) => ({ sender: m.sender, text: m.text, timestamp: m.timestamp })) });
            }
          }
        }
      }
      allThreads.sort((a, b) => { const aLast = a.messages[a.messages.length - 1]?.timestamp || ""; const bLast = b.messages[b.messages.length - 1]?.timestamp || ""; return bLast.localeCompare(aLast); });
      setDmThreads(allThreads);
      return;
    } catch {}
    const threads: DMThread[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("dm_") && !key.includes("%")) {
        try { threads.push(JSON.parse(localStorage.getItem(key) || "")); } catch {}
      }
    }
    setDmThreads(threads);
  };

  const loadCoordination = async () => {
    try {
      const res = await fetch("/api/coordination");
      if (res.ok) {
        const data = await res.json();
        setCoordRequests(data.map((r: any) => ({ id: r.id, caseId: r.case_id, amount: r.amount || "", desc: r.description || "", contact: r.contact || "", date: r.date })));
        return;
      }
    } catch {}
    const stored = localStorage.getItem("coordination_requests");
    if (!stored) return;
    try { setCoordRequests(JSON.parse(stored).sort((a: CoordinationRequest, b: CoordinationRequest) => new Date(b.date).getTime() - new Date(a.date).getTime())); } catch {}
  };

  useEffect(() => { if (authed) { loadCases(); loadCoordination(); } }, [authed]);

  const handleLogin = async () => {
    setLoggingIn(true);
    setError(false);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password: input }),
      });

      if (!res.ok) {
        setError(true);
        return;
      }

      setInput("");
      setAuthed(true);
    } catch {
      setError(true);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch {}

    setAuthed(false);
  };

  const handleApprove = async (id: string) => {
    if (!confirm("确认批准结案？")) return;
    const now = new Date().toLocaleString("zh-CN");
    const c = cases.find(x => x.id === id);
    const timeline = [...(c?.timeline || []), `✅ 管理员已批准结案 · ${now}`];
    try { await fetch("/api/cases", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "已解决", timeline }) }); } catch {}
    loadCases();
  };

  const handleForceClose = async (id: string) => {
    const now = new Date().toLocaleString("zh-CN");
    const c = cases.find(x => x.id === id);
    const timeline = [...(c?.timeline || []), `✅ 管理员已批准结案 · ${now}`];
    try { await fetch("/api/cases", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "已解决", timeline }) }); } catch {}
    loadCases();
  };

  const handleReject = async (id: string) => {
    if (!confirm("确认驳回结案申请？")) return;
    const now = new Date().toLocaleString("zh-CN");
    const c = cases.find(x => x.id === id);
    const timeline = [...(c?.timeline || []), `❌ 管理员驳回结案申请 · ${now}`];
    try { await fetch("/api/cases", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "协商中", timeline }) }); } catch {}
    loadCases();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确认删除该记录？删除后将无法恢复。")) return;
    try { await fetch("/api/cases", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); } catch {}
    loadCases();
  };

  const handleDeleteCoord = async (index: number, id?: number) => {
    if (!confirm("确认删除此协调请求？")) return;
    if (id) { try { await fetch("/api/coordination", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); } catch {} }
    setCoordRequests(coordRequests.filter((_, i) => i !== index));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - postImages.length;
    const toAdd = files.slice(0, remaining);
    if (toAdd.some(f => f.size > 5 * 1024 * 1024)) { alert("每张图片不能超过 5MB"); return; }
    setPostImages([...postImages, ...toAdd]);
    setPostPreviews([...postPreviews, ...toAdd.map(f => URL.createObjectURL(f))]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePostImage = (i: number) => {
    setPostImages(postImages.filter((_, idx) => idx !== i));
    setPostPreviews(postPreviews.filter((_, idx) => idx !== i));
  };

  const handleFreePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.company.trim() || !postForm.amount.trim() || !postForm.desc.trim()) { alert("请填写企业名称、涉及金额及纠纷描述"); return; }
    setPosting(true);
    const newId = Date.now().toString();
    const now = new Date().toLocaleString("zh-CN");
    const caseData = { id: newId, company: postForm.company.trim(), amount: postForm.amount.trim(), status: "未回应", type: postForm.type || "未分类", description: postForm.desc.trim(), creator: postForm.creator.trim() || "admin", paid: true, plan: postForm.plan, duration: "permanent", timeline: [`记录已创建 · ${now}`], ...(skipAiCompliance ? { adminOverride: true } : {}) };
    try { await fetch("/api/cases", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify(caseData) }); } catch {}

    if (postImages.length > 0) {
      try {
        const formData = new FormData();
        formData.append("caseId", newId);
        postImages.forEach(img => formData.append("images", img));
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (uploadData.paths) { await fetch("/api/cases", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: newId, images: uploadData.paths }) }); }
      } catch {}
    }

    setPostForm({ company: "", amount: "", type: "", desc: "", creator: "admin", plan: "basic" });
    setPostImages([]); setPostPreviews([]);
    setSkipAiCompliance(false);
    setPosting(false); setPostSuccess(true);
    setTimeout(() => setPostSuccess(false), 3000);
    loadCases();
  };

  const handleAdminAmount = (val: string) => {
    const raw = val.replace(/[^0-9]/g, "");
    if (raw === "") { setPostForm(f => ({ ...f, amount: "" })); return; }
    setPostForm(f => ({ ...f, amount: "¥" + Number(raw).toLocaleString("zh-CN") }));
  };

  const statusColor = (status: string) => {
    if (status === "未回应") return "text-red-400 bg-red-500/10 border border-red-500/20";
    if (status === "协商中") return "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20";
    if (status === "申请结案中") return "text-orange-400 bg-orange-500/10 border border-orange-500/20";
    return "text-green-400 bg-green-500/10 border border-green-500/20";
  };

  const formatDate = (dateStr?: string) => { if (!dateStr) return "日期未知"; return new Date(dateStr).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" }); };
  const formatTime = (ts: string) => { if (!ts) return ""; return new Date(ts).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }); };
  const getCaseCompany = (caseId: string) => cases.find((x) => x.id === caseId)?.company || caseId;
  const pending = cases.filter((c) => c.status === "申请结案中");

  const filteredCases = cases
    .filter(c => statusFilter === "全部" || c.status === statusFilter)
    .filter(c => !search || c.company.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase()) || c.type.includes(search) || c.status.includes(search))
    .sort((a, b) => {
      if (sortBy === "amount") { const aNum = parseInt(a.amount.replace(/[^0-9]/g, "") || "0"); const bNum = parseInt(b.amount.replace(/[^0-9]/g, "") || "0"); return bNum - aNum; }
      if (sortBy === "status") return a.status.localeCompare(b.status);
      return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
    });

  const inputClass = "w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition text-sm";

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-[#0B0F14] text-white flex items-center justify-center">
        <div className="text-white/40 text-sm">Loading...</div>
      </main>
    );
  }

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
            <button onClick={handleLogin} disabled={loggingIn} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl text-sm font-medium transition">{loggingIn ? "Logging in..." : "进入后台"}</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">

      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center px-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl">×</button>
          <img src={lightbox} alt="" className="max-w-full max-h-[90vh] rounded-xl object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}

      <div className="max-w-[1100px] mx-auto px-8 py-16">

        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="text-xs text-white/30 uppercase tracking-widest mb-1">管理员后台</div>
            <h1 className="text-2xl font-semibold">管理控制台</h1>
          </div>
          <button onClick={handleLogout} className="text-sm text-white/30 hover:text-white/60 transition">退出后台</button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-6 gap-4 mb-10">
          <div className="bg-[#111827] border border-white/10 rounded-xl px-4 py-4 text-center"><div className="text-2xl font-bold text-white mb-1">{cases.length}</div><div className="text-xs text-white/40">全部记录</div></div>
          <div className="bg-[#111827] border border-orange-500/20 rounded-xl px-4 py-4 text-center"><div className="text-2xl font-bold text-orange-400 mb-1">{pending.length}</div><div className="text-xs text-white/40">待审核结案</div></div>
          <div className="bg-[#111827] border border-green-500/20 rounded-xl px-4 py-4 text-center"><div className="text-2xl font-bold text-green-400 mb-1">{cases.filter(c => c.status === "已解决").length}</div><div className="text-xs text-white/40">已解决</div></div>
          <div className="bg-[#111827] border border-blue-500/20 rounded-xl px-4 py-4 text-center"><div className="text-2xl font-bold text-blue-400 mb-1">{dmThreads.length}</div><div className="text-xs text-white/40">私信对话</div></div>
          <div className="bg-[#111827] border border-purple-500/20 rounded-xl px-4 py-4 text-center"><div className="text-2xl font-bold text-purple-400 mb-1">{coordRequests.length}</div><div className="text-xs text-white/40">协调请求</div></div>
          <div className="bg-[#111827] border border-yellow-500/20 rounded-xl px-4 py-4 text-center"><div className="text-2xl font-bold text-yellow-400 mb-1">{cases.filter(c => !c.paid && c.creator !== "system").length}</div><div className="text-xs text-white/40">待付款</div></div>
        </div>

        {/* TABS */}
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

        {/* PENDING */}
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
                  {c.images && c.images.length > 0 && (
                    <div className="grid grid-cols-5 gap-2 mb-4">
                      {c.images.map((src, i) => (
                        <div key={i} onClick={() => setLightbox(src)} className="aspect-square rounded-lg overflow-hidden border border-white/10 cursor-pointer hover:opacity-80 transition">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
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

        {/* ALL CASES */}
        {tab === "all" && (
          <div>
            {/* SEARCH + SORT */}
            <div className="flex gap-3 mb-6">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索企业名称、描述、类型、状态..."
                className="flex-1 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition text-sm"
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as StatusFilter)}
                className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white/60 focus:outline-none focus:border-blue-500 transition text-sm cursor-pointer"
              >
                <option value="全部" style={{backgroundColor:"#0B0F14"}}>全部状态</option>
                <option value="待付款" style={{backgroundColor:"#0B0F14"}}>待付款</option>
                <option value="未回应" style={{backgroundColor:"#0B0F14"}}>未回应</option>
                <option value="协商中" style={{backgroundColor:"#0B0F14"}}>协商中</option>
                <option value="申请结案中" style={{backgroundColor:"#0B0F14"}}>申请结案中</option>
                <option value="已解决" style={{backgroundColor:"#0B0F14"}}>已解决</option>
              </select>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white/60 focus:outline-none focus:border-blue-500 transition text-sm cursor-pointer"
              >
                <option value="date" style={{backgroundColor:"#0B0F14"}}>按日期排序</option>
                <option value="amount" style={{backgroundColor:"#0B0F14"}}>按金额排序</option>
                <option value="status" style={{backgroundColor:"#0B0F14"}}>按状态排序</option>
              </select>
            </div>
            <div className="text-xs text-white/30 mb-4">共 {filteredCases.length} 条记录{search && `（搜索：${search}）`}</div>
            {filteredCases.length === 0 && <div className="text-center py-24"><div className="text-white/40 text-sm">未找到匹配记录</div></div>}
            <div className="space-y-4">
              {filteredCases.map((c) => (
                <div key={c.id} className="bg-[#111827] border border-white/10 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div><div className="text-white font-semibold">{c.company}</div><div className="text-blue-400 font-bold mt-1">{c.amount}</div></div>
                    <div className="flex items-center gap-2">
                      {!c.paid && c.creator !== "system" && <span className="text-xs px-2 py-1 rounded-full text-yellow-400 bg-yellow-500/10 border border-yellow-500/20">待付款</span>}
                      <div className={`text-xs px-3 py-1 rounded-full ${statusColor(c.status)}`}>{c.status}</div>
                    </div>
                  </div>
                  <div className="text-xs text-white/40 mb-2">{c.type}</div>
                  <div className="text-sm text-white/60 mb-3 leading-relaxed">{c.desc}</div>
                  {c.images && c.images.length > 0 && (
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {c.images.map((src, i) => (
                        <div key={i} onClick={() => setLightbox(src)} className="aspect-square rounded-lg overflow-hidden border border-white/10 cursor-pointer hover:opacity-80 transition">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-white/25 mb-4 border-t border-white/5 pt-3">发布于 {formatDate(c.date)} · 创建者：{c.creator || "未知"} · ID: {c.id}</div>
                  <div className="flex gap-3 flex-wrap">
                    <Link href={`/case/${c.id}`} className="border border-white/20 hover:border-white/40 text-white/60 px-4 py-2 rounded-lg text-xs transition">查看详情</Link>
                    {c.status !== "已解决" && <button onClick={() => handleForceClose(c.id)} className="bg-green-600 hover:bg-green-500 px-5 py-2 rounded-lg text-sm transition">✅ 批准结案</button>}
                    <button onClick={() => handleDelete(c.id)} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-5 py-2 rounded-lg text-sm transition">🗑️ 删除记录</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DMS */}
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

        {/* COORDINATION */}
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
                      <button onClick={() => handleDeleteCoord(index, req.id)} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-xs transition">删除请求</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FREE POST */}
        {tab === "post" && (
          <div>
            <div className="bg-[#111827] border border-green-500/20 rounded-2xl p-8">
              <h2 className="text-lg font-semibold mb-2">免费发布记录</h2>
              <p className="text-white/40 text-sm mb-8">以管理员身份直接发布，无需付款，立即公开。</p>
              {postSuccess && <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm mb-6">✅ 发布成功！记录已公开展示。</div>}
              <form onSubmit={handleFreePost} className="space-y-6">
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">企业名称 <span className="text-red-400">*</span></label>
                  <input value={postForm.company} onChange={(e) => setPostForm({ ...postForm, company: e.target.value })} placeholder="例：深圳某贸易有限公司" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">涉及金额 <span className="text-red-400">*</span></label>
                  <input value={postForm.amount} onChange={(e) => handleAdminAmount(e.target.value)} placeholder="例：120000" inputMode="numeric" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">纠纷类型</label>
                  <select value={postForm.type} onChange={(e) => setPostForm({ ...postForm, type: e.target.value })} className={`${inputClass} bg-[#0B0F14] cursor-pointer`}>
                    <option value="" style={{backgroundColor:"#0B0F14",color:"white"}}>请选择类型</option>
                    <option value="货款纠纷" style={{backgroundColor:"#0B0F14",color:"white"}}>货款纠纷</option>
                    <option value="合同纠纷" style={{backgroundColor:"#0B0F14",color:"white"}}>合同纠纷</option>
                    <option value="工程款" style={{backgroundColor:"#0B0F14",color:"white"}}>工程款</option>
                    <option value="劳动争议" style={{backgroundColor:"#0B0F14",color:"white"}}>劳动争议</option>
                    <option value="知识产权" style={{backgroundColor:"#0B0F14",color:"white"}}>知识产权</option>
                    <option value="服务纠纷" style={{backgroundColor:"#0B0F14",color:"white"}}>服务纠纷</option>
                    <option value="其他" style={{backgroundColor:"#0B0F14",color:"white"}}>其他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">纠纷描述 <span className="text-red-400">*</span></label>
                  <textarea value={postForm.desc} onChange={(e) => setPostForm({ ...postForm, desc: e.target.value })} placeholder="请简要描述纠纷经过..." rows={5} className={`${inputClass} resize-none`} />
                  <div className="text-right text-xs text-white/20 mt-1">{postForm.desc.length} 字</div>
                </div>
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">上传凭证图片 <span className="text-white/20 normal-case font-normal">（选填，最多 5 张）</span></label>
                  <div className="grid grid-cols-5 gap-3 mb-3">
                    {postPreviews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-white/10">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removePostImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full text-white text-xs flex items-center justify-center hover:bg-black/80 transition">×</button>
                      </div>
                    ))}
                    {postImages.length < 5 && (
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-white/20 hover:border-white/40 flex flex-col items-center justify-center gap-1 transition text-white/30 hover:text-white/60">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        <span className="text-xs">{postImages.length}/5</span>
                      </button>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleImageChange} />
                  <p className="text-xs text-white/20">支持 JPG、PNG、WebP，每张不超过 5MB</p>
                </div>
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">发布者</label>
                  <input value={postForm.creator} onChange={(e) => setPostForm({ ...postForm, creator: e.target.value })} placeholder="例：user@gmail.com" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">发布方案</label>
                  <select value={postForm.plan} onChange={(e) => setPostForm({ ...postForm, plan: e.target.value })} className={`${inputClass} bg-[#0B0F14] cursor-pointer`}>
                    <option value="basic" style={{backgroundColor:"#0B0F14",color:"white"}}>永久发布（基础）</option>
                    <option value="premium" style={{backgroundColor:"#0B0F14",color:"white"}}>永久发布 + 置顶推广 7 天</option>
                  </select>
                </div>
                <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipAiCompliance}
                    onChange={(e) => setSkipAiCompliance(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-green-600"
                  />
                  <span>
                    <span className="block text-sm text-white">跳过AI合规检查 / Skip AI compliance check</span>
                    <span className="block text-xs text-white/40 mt-1">硬词遮罩仍会始终生效（如诈骗等会被替换为※）。 / Hard-word masking still always applies.</span>
                  </span>
                </label>
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
