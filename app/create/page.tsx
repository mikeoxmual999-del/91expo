"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const router = useRouter();

  const [form, setForm] = useState({ company: "", amount: "", type: "", desc: "" });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const user = localStorage.getItem("user");
    if (!user) { alert("请先登录后再发布纠纷记录"); router.push("/login"); return; }
    if (!form.company.trim() || !form.amount.trim() || !form.desc.trim()) { alert("请填写企业名称、涉及金额及纠纷描述"); return; }
    setSubmitting(true);
    const newId = Date.now().toString();
    const timeline = [`记录已创建，等待付款确认 · ${new Date().toLocaleString("zh-CN")}`];
    const caseData = { id: newId, company: form.company.trim(), amount: form.amount.trim(), status: "待付款", type: form.type || "未分类", description: form.desc.trim(), creator: user, paid: false, timeline };
    try {
      await fetch("/api/cases", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(caseData) });
    } catch (err) { console.error("DB save failed", err); }
    const stored = localStorage.getItem("cases");
    let cases = stored ? JSON.parse(stored) : {};
    cases[newId] = { ...caseData, desc: form.desc.trim(), date: new Date().toISOString() };
    localStorage.setItem("cases", JSON.stringify(cases));
    router.push(`/pricing?caseId=${newId}`);
  }

  const inputClass = "w-full bg-[#F5F7FA] border border-[#E5E7EB] px-4 py-3 rounded-xl text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2B6CB0] transition text-sm";

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1F2937]">
      <div className="max-w-[700px] mx-auto px-8 py-16">

        <Link href="/" className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] text-sm mb-10 transition">
          ← 返回首页
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0F2A44] mb-2">发布纠纷记录</h1>
          <p className="text-[#6B7280] text-sm">请如实填写纠纷信息，提交后选择发布方案完成付款后正式公开。</p>
        </div>

        {/* STEPS */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#2B6CB0] text-white text-xs flex items-center justify-center font-medium">1</div>
            <span className="text-[#1F2937] text-sm font-medium">填写信息</span>
          </div>
          <div className="flex-1 h-px bg-[#E5E7EB]" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#E5E7EB] text-[#9CA3AF] text-xs flex items-center justify-center font-medium">2</div>
            <span className="text-[#9CA3AF] text-sm">选择方案</span>
          </div>
          <div className="flex-1 h-px bg-[#E5E7EB]" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#E5E7EB] text-[#9CA3AF] text-xs flex items-center justify-center font-medium">3</div>
            <span className="text-[#9CA3AF] text-sm">完成付款</span>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="block text-xs text-[#6B7280] uppercase tracking-widest mb-2 font-medium">
                企业名称 <span className="text-red-500">*</span>
              </label>
              <input name="company" value={form.company} placeholder="例：深圳某贸易有限公司" onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className="block text-xs text-[#6B7280] uppercase tracking-widest mb-2 font-medium">
                涉及金额 <span className="text-red-500">*</span>
              </label>
              <input name="amount" value={form.amount} placeholder="例：¥120,000" onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className="block text-xs text-[#6B7280] uppercase tracking-widest mb-2 font-medium">
                纠纷类型
              </label>
              <select name="type" value={form.type} onChange={handleChange} className={`${inputClass} cursor-pointer`}>
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
              <label className="block text-xs text-[#6B7280] uppercase tracking-widest mb-2 font-medium">
                纠纷描述 <span className="text-red-500">*</span>
              </label>
              <textarea name="desc" value={form.desc} placeholder="请简要描述纠纷经过、事件背景及目前状况..." onChange={handleChange} rows={5} className={`${inputClass} resize-none`} />
              <div className="text-right text-xs text-[#9CA3AF] mt-1">{form.desc.length} 字</div>
            </div>

            <div className="border-t border-[#E5E7EB]" />

            <button type="submit" disabled={submitting} className="w-full bg-[#2B6CB0] hover:bg-[#2563a0] disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl text-sm font-medium transition text-white">
              {submitting ? "处理中..." : "下一步：选择方案 →"}
            </button>

          </form>
        </div>

        <p className="text-center text-[#9CA3AF] text-xs mt-6">提交即表示您确认所填写信息真实有效</p>

      </div>
    </main>
  );
}