"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <div className="max-w-[900px] mx-auto px-8 py-20">

        {/* BACK */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-12 transition"
        >
          ← 返回首页
        </Link>

        {/* HERO */}
        <div className="mb-14">
          <div className="text-blue-400 text-sm font-medium uppercase tracking-widest mb-3">
            法律文件
          </div>
          <h1 className="text-4xl font-semibold mb-4 leading-tight">隐私政策</h1>
          <p className="text-white/40 text-sm">最后更新：{new Date().getFullYear()}年</p>
        </div>

        {/* INTRO */}
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl px-8 py-6 mb-8">
          <p className="text-blue-400/80 text-sm leading-relaxed">
            我们重视您的隐私。本政策说明我们如何收集、使用和保护您在使用 91记录 平台时提供的个人信息。
          </p>
        </div>

        {/* SECTIONS */}
        <div className="space-y-6">

          {[
            {
              title: "1. 我们收集的信息",
              content:
                "我们收集您在注册和使用平台过程中主动提供的信息，包括手机号码、发布的争议内容、私信内容及协调请求信息。我们也会自动收集设备信息和访问日志，用于平台安全和性能优化。",
            },
            {
              title: "2. 信息使用方式",
              content:
                "您提供的信息仅用于提供平台服务、验证身份、处理协调请求及改善用户体验。我们不会将您的个人信息出售给任何第三方，亦不用于定向广告投放。",
            },
            {
              title: "3. 信息存储",
              content:
                "目前平台使用浏览器本地存储（localStorage）保存用户数据。数据存储在您的本地设备上。我们建议您不要在公共设备上使用本平台账户，以保护您的个人信息安全。",
            },
            {
              title: "4. 信息共享",
              content:
                "除以下情况外，我们不会与任何第三方共享您的个人信息：（1）您明确授权；（2）法律法规要求；（3）保护平台或用户的合法权益所必要。",
            },
            {
              title: "5. 私信隐私",
              content:
                "私信内容在正常情况下仅对对话双方可见。平台管理员仅在处理投诉、维护平台安全或依法配合监管要求时，方可访问私信内容。",
            },
            {
              title: "6. 您的权利",
              content:
                "您有权查阅、更正或删除您在平台上发布的内容。如需删除账户或相关数据，请通过管理员渠道提交申请，我们将在合理时间内予以处理。",
            },
            {
              title: "7. 未成年人保护",
              content:
                "本平台不面向18岁以下未成年人提供服务。如我们发现未成年人在未获得监护人同意的情况下使用本平台，我们将采取措施删除相关信息并注销账户。",
            },
            {
              title: "8. 政策更新",
              content:
                "我们可能不定期更新本隐私政策。重大变更将在平台上显著公示，并在合理时间前通知用户。继续使用平台即表示您接受更新后的隐私政策。",
            },
          ].map((section) => (
            <div
              key={section.title}
              className="bg-[#111827] border border-white/10 rounded-2xl px-8 py-6"
            >
              <h2 className="text-base font-semibold text-white mb-3">{section.title}</h2>
              <p className="text-white/60 text-sm leading-relaxed">{section.content}</p>
            </div>
          ))}

        </div>

        {/* FOOTER NOTE */}
        <div className="border-t border-white/10 pt-10 mt-10 text-xs text-white/30 leading-relaxed">
          如对本隐私政策有任何疑问，请通过平台管理员渠道与我们联系。
        </div>

      </div>
    </main>
  );
}