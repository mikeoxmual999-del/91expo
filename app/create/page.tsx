"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    company: "",
    amount: "",
    type: "",
    desc: "",
  });

  const [submitting, setSubmitting] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const user = localStorage.getItem("user");

    if (!user) {
      alert("请先登录后再发布纠纷记录");
      router.push("/login");
      return;
    }

    if (!form.company.trim() || !form.amount.trim() || !form.desc.trim()) {
      alert("请填写企业名称、涉及金额及纠纷描述");
      return;
    }

    setSubmitting(true);

    const stored = localStorage.getItem("cases");
    let cases = stored ? JSON.parse(stored) : {};

    const newId = Date.now().toString();

    cases[newId] = {
      company: form.company.trim(),
      amount: form.amount.trim(),
      status: "未回应",
      type: form.type || "未分类",
      desc: form.desc.trim(),
      creator: user,
      date: new Date().toISOString(),
      timeline: [`记录已创建 · ${new Date().toLocaleString("zh-CN")}`],
    };

    localStorage.setItem("cases", JSON.stringify(cases));

    router.push(`/case/${newId}`);
  }

  const inputClass =
    "w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition text-sm";

  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <div className="max-w-[700px] mx-auto px-8 py-16">

        {/* BACK */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-10 transition"
        >
          ← 返回首页
        </Link>

        {/* TITLE */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">发布纠纷记录</h1>
          <p className="text-white/40 text-sm">
            请如实填写纠纷信息，提交后将公开显示在平台记录中。
          </p>
        </div>

        {/* FORM CARD */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* COMPANY */}
            <div>
              <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">
                企业名称 <span className="text-red-400">*</span>
              </label>
              <input
                name="company"
                value={form.company}
                placeholder="例：深圳某贸易有限公司"
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* AMOUNT */}
            <div>
              <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">
                涉及金额 <span className="text-red-400">*</span>
              </label>
              <input
                name="amount"
                value={form.amount}
                placeholder="例：¥120,000"
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* TYPE */}
            <div>
              <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">
                纠纷类型
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className={`${inputClass} bg-[#0B0F14] cursor-pointer`}
              >
                <option value="" style={{ backgroundColor: "#0B0F14", color: "white" }}>请选择类型</option>
                <option value="货款纠纷" style={{ backgroundColor: "#0B0F14", color: "white" }}>货款纠纷</option>
                <option value="合同纠纷" style={{ backgroundColor: "#0B0F14", color: "white" }}>合同纠纷</option>
                <option value="工程款" style={{ backgroundColor: "#0B0F14", color: "white" }}>工程款</option>
                <option value="劳动争议" style={{ backgroundColor: "#0B0F14", color: "white" }}>劳动争议</option>
                <option value="知识产权" style={{ backgroundColor: "#0B0F14", color: "white" }}>知识产权</option>
                <option value="服务纠纷" style={{ backgroundColor: "#0B0F14", color: "white" }}>服务纠纷</option>
                <option value="其他" style={{ backgroundColor: "#0B0F14", color: "white" }}>其他</option>
              </select>
            </div>

            {/* DESC */}
            <div>
              <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">
                纠纷描述 <span className="text-red-400">*</span>
              </label>
              <textarea
                name="desc"
                value={form.desc}
                placeholder="请简要描述纠纷经过、事件背景及目前状况..."
                onChange={handleChange}
                rows={5}
                className={`${inputClass} resize-none`}
              />
              <div className="text-right text-xs text-white/20 mt-1">
                {form.desc.length} 字
              </div>
            </div>

            {/* DIVIDER */}
            <div className="border-t border-white/10" />

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl text-sm font-medium transition"
            >
              {submitting ? "提交中..." : "提交记录"}
            </button>

          </form>
        </div>

        {/* NOTE */}
        <p className="text-center text-white/20 text-xs mt-6">
          提交即表示您确认所填写信息真实有效，平台不承担因虚假信息引起的法律责任。
        </p>

      </div>
    </main>
  );
}