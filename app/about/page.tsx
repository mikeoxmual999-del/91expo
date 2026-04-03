"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <div className="max-w-[1000px] mx-auto px-8 py-20">

        {/* BACK */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-12 transition"
        >
          ← 返回首页
        </Link>

        {/* HERO */}
        <div className="mb-16">
          <div className="text-blue-400 text-lg font-medium mb-3">
            关于平台
          </div>

          <h1 className="text-4xl font-semibold mb-4 leading-tight">
            一个基于事实的记录平台
          </h1>

          <p className="text-white/60 text-base leading-relaxed max-w-2xl">
            我们致力于以结构化方式呈现商业纠纷与相关信息，让复杂问题可以被看见、被理解、被持续记录。
          </p>
        </div>

        {/* SECTION 1 */}
        <div className="mb-14">
          <h2 className="text-xl font-semibold mb-4">平台定位</h2>

          <p className="text-white/70 leading-relaxed">
            在跨境商业与信息快速流动的环境中，争议与信息不对称普遍存在。
            许多问题并不立即形成法律结论，却缺乏一个公开、持续、可追溯的呈现方式。
          </p>

          <p className="text-white/70 leading-relaxed mt-4">
            本平台提供一个中立的信息空间，用于记录、整理与展示相关事实材料，
            使信息能够被更清晰地理解，而判断权始终保留给公众与相关专业机构。
          </p>
        </div>

        {/* SECTION 2 */}
        <div className="mb-14">
          <h2 className="text-xl font-semibold mb-6">我们在做什么</h2>

          <div className="space-y-6">

            <div className="bg-[#111827] border border-white/10 rounded-xl p-6">
              <div className="text-white font-medium mb-2">
                1. 呈现事实，而非结论
              </div>
              <p className="text-white/70 leading-relaxed">
                我们以已有材料为基础进行结构化展示，不对事件作出判断或裁定。
              </p>
            </div>

            <div className="bg-[#111827] border border-white/10 rounded-xl p-6">
              <div className="text-white font-medium mb-2">
                2. 记录过程，而非瞬时表达
              </div>
              <p className="text-white/70 leading-relaxed">
                争议往往是长期过程，我们支持持续更新与补充，使信息具备时间维度。
              </p>
            </div>

            <div className="bg-[#111827] border border-white/10 rounded-xl p-6">
              <div className="text-white font-medium mb-2">
                3. 提供回应空间
              </div>
              <p className="text-white/70 leading-relaxed">
                平台鼓励相关方进行回应与补充，使信息更加完整与多维。
              </p>
            </div>

          </div>
        </div>

        {/* SECTION 3 */}
        <div className="mb-14">
          <h2 className="text-xl font-semibold mb-4">我们不做什么</h2>

          <div className="bg-[#111827] border border-white/10 rounded-xl p-6 space-y-3 text-white/70 leading-relaxed">
            <p>平台不对信息的真实性作出最终认定。</p>
            <p>平台不参与任何纠纷的裁决或调解。</p>
            <p>平台不提供法律意见或结果保证。</p>
          </div>
        </div>

        {/* FOOTER NOTE */}
        <div className="border-t border-white/10 pt-10 text-sm text-white/40 leading-relaxed">
          本页面仅用于说明平台定位与信息结构，具体法律边界与责任说明，
          请参考相关免责声明与用户协议。
        </div>

      </div>
    </main>
  );
}