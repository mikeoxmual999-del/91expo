"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1F2937]">
      <div className="max-w-[1000px] mx-auto px-8 py-20">

        <Link href="/" className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] text-sm mb-12 transition">
          ← 返回首页 / Back to Home
        </Link>

        <div className="mb-16">
          <div className="text-[#2B6CB0] text-lg font-medium mb-1">关于平台</div>
          <div className="text-[#2B6CB0]/60 text-sm font-medium mb-3">About the Platform</div>
          <h1 className="text-4xl font-bold text-[#0F2A44] mb-1 leading-tight">一个基于事实的记录平台</h1>
          <h2 className="text-2xl font-semibold text-[#0F2A44]/50 mb-4 leading-tight">A Fact-Based Records Platform</h2>
          <p className="text-[#6B7280] text-base leading-relaxed max-w-2xl mb-2">
            我们致力于以结构化方式呈现商业纠纷与相关信息，让复杂问题可以被看见、被理解、被持续记录。
          </p>
          <p className="text-[#9CA3AF] text-base leading-relaxed max-w-2xl italic">
            We are committed to presenting commercial disputes and related information in a structured way, making complex issues visible, understandable, and continuously documented.
          </p>
        </div>

        <div className="mb-14">
          <h2 className="text-xl font-bold text-[#0F2A44] mb-1">平台定位</h2>
          <h3 className="text-base font-semibold text-[#0F2A44]/50 mb-4">Our Position</h3>
          <p className="text-[#4B5563] leading-relaxed mb-2">在跨境商业与信息快速流动的环境中，争议与信息不对称普遍存在。许多问题并不立即形成法律结论，却缺乏一个公开、持续、可追溯的呈现方式。</p>
          <p className="text-[#9CA3AF] leading-relaxed italic mb-4">In an environment of cross-border commerce and rapidly flowing information, disputes and information asymmetry are common. Many issues do not immediately lead to legal conclusions, yet lack a public, continuous, and traceable way to be presented.</p>
          <p className="text-[#4B5563] leading-relaxed mb-2">本平台提供一个中立的信息空间，用于记录、整理与展示相关事实材料，使信息能够被更清晰地理解，而判断权始终保留给公众与相关专业机构。</p>
          <p className="text-[#9CA3AF] leading-relaxed italic">This platform provides a neutral information space to document, organize, and display factual materials, enabling clearer understanding while leaving judgment to the public and relevant professional institutions.</p>
        </div>

        <div className="mb-14">
          <h2 className="text-xl font-bold text-[#0F2A44] mb-1">我们在做什么</h2>
          <h3 className="text-base font-semibold text-[#0F2A44]/50 mb-6">What We Do</h3>
          <div className="space-y-4">
            {[
              {
                title: "1. 呈现事实，而非结论",
                titleEn: "1. Present Facts, Not Conclusions",
                desc: "我们以已有材料为基础进行结构化展示，不对事件作出判断或裁定。",
                descEn: "We provide structured presentations based on available materials, without making judgments or rulings on events.",
              },
              {
                title: "2. 记录过程，而非瞬时表达",
                titleEn: "2. Document the Process, Not Just a Moment",
                desc: "争议往往是长期过程，我们支持持续更新与补充，使信息具备时间维度。",
                descEn: "Disputes are often long-term processes. We support ongoing updates and additions, giving information a temporal dimension.",
              },
              {
                title: "3. 提供回应空间",
                titleEn: "3. Provide Space for Response",
                desc: "平台鼓励相关方进行回应与补充，使信息更加完整与多维。",
                descEn: "The platform encourages relevant parties to respond and add context, making information more complete and multi-dimensional.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
                <div className="text-[#0F2A44] font-semibold mb-1">{item.title}</div>
                <div className="text-[#0F2A44]/50 text-sm font-medium mb-3">{item.titleEn}</div>
                <p className="text-[#4B5563] leading-relaxed mb-1">{item.desc}</p>
                <p className="text-[#9CA3AF] leading-relaxed italic text-sm">{item.descEn}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-14">
          <h2 className="text-xl font-bold text-[#0F2A44] mb-1">我们不做什么</h2>
          <h3 className="text-base font-semibold text-[#0F2A44]/50 mb-4">What We Don't Do</h3>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-[#4B5563] leading-relaxed">平台不对信息的真实性作出最终认定。</p>
                <p className="text-[#9CA3AF] italic">We do not make final determinations on the truthfulness of information.</p>
              </div>
              <div>
                <p className="text-[#4B5563] leading-relaxed">平台不参与任何纠纷的裁决或调解。</p>
                <p className="text-[#9CA3AF] italic">We do not participate in the adjudication or mediation of any dispute.</p>
              </div>
              <div>
                <p className="text-[#4B5563] leading-relaxed">平台不提供法律意见或结果保证。</p>
                <p className="text-[#9CA3AF] italic">We do not provide legal advice or guarantee any outcomes.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E5E7EB] pt-10 text-sm text-[#9CA3AF] leading-relaxed">
          <p>本页面仅用于说明平台定位与信息结构，具体法律边界与责任说明，请参考相关免责声明与用户协议。</p>
          <p className="italic mt-1">This page is for informational purposes only. For specific legal boundaries and liability details, please refer to our Disclaimer and Terms of Service.</p>
        </div>

      </div>
    </main>
  );
}