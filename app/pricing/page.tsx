"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PRICING, PLAN_LABELS, PLAN_FEATURES, type PlanType } from "../config/pricing";

const DISCLAIMER_ZH = `【重要声明 — 请在付款前仔细阅读】

1. 服务性质：51记录（51jilu）仅提供商业纠纷信息的记录与展示服务，不提供法律建议、调解或仲裁服务，亦不对任何争议的处理结果承担责任。

2. 发布者责任：发布者须确保所提交的全部信息真实、合法、无误，并对所发布内容承担完全的法律责任。如因发布虚假、诽谤或侵权内容而产生的任何法律纠纷或损失，由发布者自行承担，与本平台无关。

3. 付款不退款：所有付款均为一次性服务费，一经完成不予退款。付款即视为您同意本声明的全部条款。

4. 内容下架条款：平台以"长期展示"为目标，但在以下情况下，平台有权将内容下架，且不退还任何费用：
   • 被发布方提供经核实的合法证据证明内容不实；
   • 内容违反适用法律法规；
   • 内容违反本平台用户协议；
   • 依据法院命令、政府要求或监管指令；
   • 平台因运营、技术或不可抗力原因终止服务。

5. 平台免责：本平台不对因展示内容引发的任何直接、间接、附带或后果性损失承担责任，包括但不限于名誉损失、经济损失或法律费用。

6. 内容真实性：平台不对用户发布内容的真实性作出独立核实或保证，所有内容均代表发布者个人立场。`;

const DISCLAIMER_EN = `【IMPORTANT NOTICE — Please read carefully before payment】

1. Nature of Service: 51jilu provides commercial dispute information recording and display services only. We do not provide legal advice, mediation, or arbitration, and bear no responsibility for the outcome of any dispute.

2. Publisher Responsibility: Publishers must ensure all submitted information is truthful, lawful, and accurate. Publishers bear full legal responsibility for their content. Any legal disputes or losses arising from false, defamatory, or infringing content are the sole responsibility of the publisher.

3. No Refund Policy: All payments are one-time service fees and are non-refundable once completed. Completing payment constitutes your agreement to all terms in this disclaimer.

4. Content Removal: While the platform aims for long-term display, we reserve the right to remove content without refund under the following circumstances:
   • The published party provides verified lawful evidence proving the content is false;
   • The content violates applicable laws or regulations;
   • The content violates our Terms of Service;
   • Required by court order, government request, or regulatory directive;
   • The platform ceases operations due to business, technical, or force majeure reasons.

5. Platform Liability: This platform bears no liability for any direct, indirect, incidental, or consequential losses arising from displayed content.

6. Content Accuracy: The platform does not independently verify or guarantee the accuracy of user-submitted content.`;

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId");
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("basic");
  const [agreed, setAgreed] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const price = PRICING[selectedPlan];
  const premiumAddon = PRICING.premium - PRICING.basic;

  const handleContinue = () => {
    if (!caseId) { router.push("/create"); return; }
    if (!agreed) { setShowDisclaimer(true); return; }
    localStorage.setItem("pending_payment", JSON.stringify({
      caseId,
      plan: selectedPlan,
      duration: selectedPlan === "premium" ? "7" : "permanent",
      price,
    }));
    router.push(`/checkout?caseId=${caseId}`);
  };

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1F2937]">
      <div className="max-w-[800px] mx-auto px-4 md:px-8 py-10 md:py-16">

        <div className="mb-10 text-center">
          <div className="text-[#2B6CB0] text-sm uppercase tracking-widest mb-3 font-medium">发布纠纷</div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F2A44] mb-3">选择发布方案</h1>
          <p className="text-[#6B7280] text-sm">所有方案均为永久发布，一次付款长期有效</p>
        </div>

        {/* PLANS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

          {/* BASIC */}
          <button onClick={() => setSelectedPlan("basic")} className={`text-left bg-white border rounded-2xl p-6 md:p-8 transition shadow-sm ${selectedPlan === "basic" ? "border-[#2B6CB0] ring-1 ring-[#2B6CB0]" : "border-[#E5E7EB] hover:border-[#CBD5E0]"}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-[#1F2937] font-semibold text-lg mb-1">{PLAN_LABELS.basic}</div>
                <div className="text-[#6B7280] text-xs">标准展示位置 · 永不下架</div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedPlan === "basic" ? "border-[#2B6CB0] bg-[#2B6CB0]" : "border-[#D1D5DB]"}`}>
                {selectedPlan === "basic" && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>
            <ul className="space-y-2 mb-6">
              {PLAN_FEATURES.basic.map((f) => (
                <li key={f} className="flex items-center gap-2 text-[#4B5563] text-sm">
                  <span className="text-[#2B6CB0] text-xs">✓</span>{f}
                </li>
              ))}
            </ul>
            <div className="text-3xl font-bold text-[#0F2A44]">${PRICING.basic} <span className="text-[#6B7280] text-sm font-normal">USD</span></div>
            <div className="text-xs text-[#9CA3AF] mt-1">一次性付款，永久有效</div>
          </button>

          {/* PREMIUM */}
          <button onClick={() => setSelectedPlan("premium")} className={`text-left bg-white border rounded-2xl p-6 md:p-8 transition shadow-sm relative ${selectedPlan === "premium" ? "border-yellow-500 ring-1 ring-yellow-500" : "border-[#E5E7EB] hover:border-[#CBD5E0]"}`}>
            <div className="absolute -top-3 left-6 bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full">置顶推广</div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-[#1F2937] font-semibold text-lg mb-1">{PLAN_LABELS.premium}</div>
                <div className="text-yellow-600 text-xs">首页 + 列表顶部展示 7 天</div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedPlan === "premium" ? "border-yellow-500 bg-yellow-500" : "border-[#D1D5DB]"}`}>
                {selectedPlan === "premium" && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>
            <ul className="space-y-2 mb-6">
              {PLAN_FEATURES.premium.map((f) => (
                <li key={f} className="flex items-center gap-2 text-[#4B5563] text-sm">
                  <span className="text-yellow-500 text-xs">✓</span>{f}
                </li>
              ))}
            </ul>
            <div>
              <div className="text-3xl font-bold text-[#0F2A44]">${PRICING.premium} <span className="text-[#6B7280] text-sm font-normal">USD</span></div>
              <div className="text-xs text-[#9CA3AF] mt-1">永久发布 ${PRICING.basic} + 置顶 7 天 +${premiumAddon}</div>
            </div>
          </button>

        </div>

        {/* SUMMARY */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 md:p-8 mb-6 shadow-sm">
          <h2 className="text-sm font-semibold text-[#6B7280] uppercase tracking-widest mb-4">订单摘要</h2>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[#6B7280] text-sm">{PLAN_LABELS[selectedPlan]}</span>
            <span className="text-[#1F2937] text-sm">${PRICING[selectedPlan]} USD</span>
          </div>
          {selectedPlan === "premium" && (
            <div className="flex justify-between items-center mb-3">
              <span className="text-[#6B7280] text-sm">其中置顶推广 7 天</span>
              <span className="text-yellow-600 text-sm">+${premiumAddon} USD</span>
            </div>
          )}
          <div className="border-t border-[#E5E7EB] mt-4 pt-4 flex justify-between items-center">
            <span className="text-[#1F2937] font-semibold">总计</span>
            <span className="text-2xl font-bold text-[#0F2A44]">${price} <span className="text-[#6B7280] text-sm font-normal">USD</span></span>
          </div>
        </div>

        {/* DISCLAIMER CHECKBOX */}
        <div className={`bg-white border rounded-2xl p-5 md:p-6 mb-6 shadow-sm ${showDisclaimer && !agreed ? "border-red-300" : "border-[#E5E7EB]"}`}>
          <h2 className="text-sm font-semibold text-[#6B7280] uppercase tracking-widest mb-4">免责声明</h2>
          <div className="bg-[#F9FAFB] rounded-xl p-4 mb-4 max-h-32 overflow-y-auto">
            <p className="text-xs text-[#4B5563] leading-relaxed mb-3">{DISCLAIMER_ZH}</p>
            <p className="text-xs text-[#4B5563] leading-relaxed">{DISCLAIMER_EN}</p>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setShowDisclaimer(false); }}
              className="mt-0.5 w-4 h-4 rounded border-[#D1D5DB] text-[#2B6CB0] cursor-pointer shrink-0" />
            <span className="text-sm text-[#4B5563]">
              我已完整阅读并理解上述免责声明，确认所提交信息真实合法，同意付款后不予退款，并愿意承担因发布内容引起的全部法律责任。
              <br />
              <span className="text-xs text-[#9CA3AF]">I have fully read and understood the disclaimer above. I confirm my submitted information is truthful and lawful, agree that all payments are non-refundable, and accept full legal responsibility for my published content.</span>
            </span>
          </label>
          {showDisclaimer && !agreed && (
            <p className="text-red-500 text-xs mt-2">⚠️ 请先阅读并勾选同意免责声明</p>
          )}
        </div>

        <button onClick={handleContinue}
          className={`w-full py-4 rounded-xl text-base font-semibold transition text-white ${
            selectedPlan === "premium" ? "bg-yellow-500 hover:bg-yellow-400" : "bg-[#2B6CB0] hover:bg-[#2563a0]"
          } ${!agreed ? "opacity-70" : ""}`}>
          {caseId ? `继续付款 → $${price} USD` : "发布纠纷并选择方案"}
        </button>
        <p className="text-center text-[#9CA3AF] text-xs mt-4">支持信用卡 · WeChat Pay · 更多支付方式</p>

      </div>
    </main>
  );
}

export default function PricingPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#F5F7FA]" />}><PricingContent /></Suspense>;
}
