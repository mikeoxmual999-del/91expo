"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type ComplianceIssue = {
  reasons: string[];
  suggestion: string;
  flaggedSpans: string[];
};

type SavedCase = {
  company?: string;
  description?: string;
  date?: string;
};

export default function CreatePage() {
  const router = useRouter();

  const [form, setForm] = useState({ company: "", amount: "", type: "", desc: "" });
  const [submitting, setSubmitting] = useState(false);
  const [complianceIssue, setComplianceIssue] = useState<ComplianceIssue | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "desc") setComplianceIssue(null);
  }

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    // only allow numbers
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (raw === "") { setForm({ ...form, amount: "" }); return; }
    // format with commas and ¥ prefix
    const formatted = "¥" + Number(raw).toLocaleString("zh-CN");
    setForm({ ...form, amount: formatted });
  }

  async function submitCase(forceContinue = false) {
    const user = localStorage.getItem("user");
    if (!user) { alert("请先登录后再发布纠纷记录"); router.push("/login"); return; }
    if (!form.company.trim() || !form.amount.trim() || !form.desc.trim()) { alert("请填写企业名称、涉及金额及纠纷描述"); return; }
    setSubmitting(true);
    if (!forceContinue) setComplianceIssue(null);
    const newId = Date.now().toString();
    const timeline = [`记录已创建，等待付款确认 · ${new Date().toLocaleString("zh-CN")}`];
    const caseData = { id: newId, company: form.company.trim(), amount: form.amount.trim(), status: "待付款", type: form.type || "未分类", description: form.desc.trim(), creator: user, paid: false, timeline };
    const requestData = { ...caseData, ...(forceContinue ? { forceContinue: true } : {}) };
    let savedCase: SavedCase | null = null;
    try {
      const res = await fetch("/api/cases", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(requestData) });
      const data = await res.json().catch(() => null);

      if (res.status === 422 && data?.error === "compliance") {
        setComplianceIssue({
          reasons: Array.isArray(data.reasons) ? data.reasons : [],
          suggestion: typeof data.suggestion === "string" ? data.suggestion : "",
          flaggedSpans: Array.isArray(data.flaggedSpans) ? data.flaggedSpans.filter((span: unknown): span is string => typeof span === "string" && span.length > 0) : [],
        });
        setSubmitting(false);
        return;
      }

      if (!res.ok) throw new Error(data?.error || `Case submit failed with status ${res.status}`);
      savedCase = data;
    } catch (err) {
      console.error("DB save failed", err);
      setSubmitting(false);
      return;
    }
    const stored = localStorage.getItem("cases");
    const cases = stored ? JSON.parse(stored) : {};
    const storedDescription = typeof savedCase?.description === "string" ? savedCase.description : form.desc.trim();
    cases[newId] = {
      ...caseData,
      company: typeof savedCase?.company === "string" ? savedCase.company : caseData.company,
      description: storedDescription,
      desc: storedDescription,
      date: savedCase?.date || new Date().toISOString(),
    };
    localStorage.setItem("cases", JSON.stringify(cases));
    router.push(`/pricing?caseId=${newId}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submitCase(false);
  }

  async function handleForceContinue() {
    const confirmed = window.confirm(
      "如果继续发布，系统会把下方标红的词句替换为 ***，其余内容保持不变。\n\nIf you continue, the highlighted words or phrases will be replaced with *** in the published post."
    );
    if (!confirmed) return;
    await submitCase(true);
  }

  function renderHighlightedDescription(text: string, flaggedSpans: string[]) {
    const spans = Array.from(new Set(flaggedSpans.filter(Boolean))).sort((a, b) => b.length - a.length);
    if (spans.length === 0) return text;

    const escaped = spans.map((span) => span.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const regex = new RegExp(`(${escaped.join("|")})`, "g");
    return text.split(regex).map((part, index) => {
      if (!spans.includes(part)) return <span key={`${part}-${index}`}>{part}</span>;
      return (
        <mark key={`${part}-${index}`} className="rounded bg-red-100 px-1 py-0.5 text-red-800 ring-1 ring-red-200">
          {part}
        </mark>
      );
    });
  }

  const inputClass = "w-full bg-[#F5F7FA] border border-[#E5E7EB] px-4 py-3 rounded-xl text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2B6CB0] transition text-sm";

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1F2937]">
      <div className="max-w-[700px] mx-auto px-4 md:px-8 py-8 md:py-16">

        <Link href="/" className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] text-sm mb-6 md:mb-10 transition">
          ← 返回首页
        </Link>

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl font-bold text-[#0F2A44] mb-2">发布纠纷记录</h1>
          <p className="text-[#6B7280] text-sm">请如实填写纠纷信息，提交后选择发布方案完成付款后正式公开。</p>
        </div>

        {/* STEPS */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#2B6CB0] text-white text-xs flex items-center justify-center font-medium">1</div>
            <span className="hidden sm:inline text-[#1F2937] text-sm font-medium">填写信息</span>
          </div>
          <div className="flex-1 h-px bg-[#E5E7EB]" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#E5E7EB] text-[#9CA3AF] text-xs flex items-center justify-center font-medium">2</div>
            <span className="hidden sm:inline text-[#9CA3AF] text-sm">选择方案</span>
          </div>
          <div className="flex-1 h-px bg-[#E5E7EB]" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#E5E7EB] text-[#9CA3AF] text-xs flex items-center justify-center font-medium">3</div>
            <span className="hidden sm:inline text-[#9CA3AF] text-sm">完成付款</span>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 md:p-8 shadow-sm">
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
              <input
                name="amount"
                value={form.amount}
                placeholder="例：120000"
                inputMode="numeric"
                onChange={handleAmountChange}
                className={inputClass}
              />
              <div className="text-xs text-[#9CA3AF] mt-1">仅输入数字，将自动添加 ¥ 符号</div>
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
              {complianceIssue?.flaggedSpans.length ? (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4">
                  <div className="mb-2 text-sm font-semibold text-red-900">以下词句被系统标记</div>
                  <div className="mb-3 text-xs text-red-700">Highlighted words or phrases were flagged by the compliance review.</div>
                  <div className="whitespace-pre-wrap rounded-lg bg-white p-3 text-sm leading-relaxed text-[#1F2937] ring-1 ring-red-100">
                    {renderHighlightedDescription(form.desc, complianceIssue.flaggedSpans)}
                  </div>
                </div>
              ) : null}
              <div className="mt-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-xs leading-relaxed text-[#6B7280]">
                本平台会自动屏蔽不合规词汇并审核内容，且不对事实作出认定。/ This platform automatically masks non-compliant terms, reviews content, and does not determine facts.
              </div>
              <div className="text-right text-xs text-[#9CA3AF] mt-1">{form.desc.length} 字</div>
            </div>

            {complianceIssue && (
              <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-5 text-sm text-[#1F2937] shadow-sm">
                <h2 className="text-base font-semibold text-amber-950">内容需要调整后再发布</h2>
                <p className="mt-1 text-xs text-amber-800/80">Content needs adjustment before publishing.</p>
                {complianceIssue.reasons.length > 0 && (
                  <div className="mt-4">
                    <div className="font-medium text-amber-950">系统提示原因</div>
                    <div className="mb-2 text-xs text-amber-800/75">Review reasons</div>
                    <ul className="space-y-1 text-amber-900/90 list-disc list-inside">
                      {complianceIssue.reasons.map((reason, index) => (
                        <li key={`${reason}-${index}`}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {complianceIssue.suggestion && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-white p-3">
                    <div className="text-sm font-semibold text-[#1F2937]">建议改写版本</div>
                    <div className="mb-2 text-xs text-[#6B7280]">Suggested version</div>
                    <p className="text-[#1F2937] leading-relaxed whitespace-pre-wrap">{complianceIssue.suggestion}</p>
                  </div>
                )}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {complianceIssue.suggestion && (
                    <button
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, desc: complianceIssue.suggestion }))}
                      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#2B6CB0] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2563a0]"
                    >
                      <span>
                        使用建议版本
                        <span className="block text-xs font-normal text-white/80">Use suggested version</span>
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleForceContinue}
                    disabled={submitting}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-amber-400 bg-white px-4 py-2 text-sm font-medium text-amber-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>
                      仍要发布
                      <span className="block text-xs font-normal text-amber-800/75">Post anyway</span>
                    </span>
                  </button>
                </div>
              </div>
            )}

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
