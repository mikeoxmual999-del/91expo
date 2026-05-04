"use client";

import Link from "next/link";

export default function PrivacyPage() {
  const sections = [
    {
      title: "1. 我们收集的信息", titleEn: "1. Information We Collect",
      content: "我们收集您在注册和使用平台过程中主动提供的信息，包括手机号码或邮箱地址、发布的争议内容、私信内容及协调请求信息。我们也会自动收集设备信息和访问日志，用于平台安全和性能优化。",
      contentEn: "We collect information you actively provide during registration and use, including your phone number or email address, submitted dispute content, messages, and coordination requests. We also automatically collect device information and access logs for platform security and performance.",
    },
    {
      title: "2. 信息使用方式", titleEn: "2. How We Use Your Information",
      content: "您提供的信息仅用于提供平台服务、验证身份、处理协调请求及改善用户体验。我们不会将您的个人信息出售给任何第三方，亦不用于定向广告投放。",
      contentEn: "Your information is used solely to provide platform services, verify identity, process coordination requests, and improve user experience. We do not sell your personal information to any third party, nor use it for targeted advertising.",
    },
    {
      title: "3. 信息存储", titleEn: "3. Data Storage",
      content: "平台使用服务器数据库及浏览器本地存储（localStorage）保存用户数据。我们建议您不要在公共设备上使用本平台账户，以保护您的个人信息安全。",
      contentEn: "The platform uses server databases and browser local storage (localStorage) to save user data. We recommend that you avoid using your account on public devices to protect your personal information.",
    },
    {
      title: "4. 信息共享", titleEn: "4. Information Sharing",
      content: "除以下情况外，我们不会与任何第三方共享您的个人信息：（1）您明确授权；（2）法律法规要求；（3）保护平台或用户的合法权益所必要。",
      contentEn: "We do not share your personal information with any third party except in the following cases: (1) you have given explicit consent; (2) required by law or regulation; (3) necessary to protect the legitimate rights of the platform or users.",
    },
    {
      title: "5. 私信隐私", titleEn: "5. Message Privacy",
      content: "私信内容在正常情况下仅对对话双方可见。平台管理员仅在处理投诉、维护平台安全或依法配合监管要求时，方可访问私信内容。",
      contentEn: "Messages are normally only visible to the two parties in a conversation. Platform administrators may only access message content when handling complaints, maintaining platform security, or complying with regulatory requirements.",
    },
    {
      title: "6. 您的权利", titleEn: "6. Your Rights",
      content: "您有权查阅、更正或删除您在平台上发布的内容。如需删除账户或相关数据，请通过管理员渠道提交申请，我们将在合理时间内予以处理。",
      contentEn: "You have the right to access, correct, or delete content you have published on the platform. To delete your account or associated data, please submit a request through the administrator channel and we will process it within a reasonable timeframe.",
    },
    {
      title: "7. 未成年人保护", titleEn: "7. Protection of Minors",
      content: "本平台不面向18岁以下未成年人提供服务。如我们发现未成年人在未获得监护人同意的情况下使用本平台，我们将采取措施删除相关信息并注销账户。",
      contentEn: "This platform is not intended for users under the age of 18. If we discover that a minor is using the platform without guardian consent, we will take steps to remove the relevant information and deactivate the account.",
    },
    {
      title: "8. 政策更新", titleEn: "8. Policy Updates",
      content: "我们可能不定期更新本隐私政策。重大变更将在平台上显著公示，并在合理时间前通知用户。继续使用平台即表示您接受更新后的隐私政策。",
      contentEn: "We may update this privacy policy from time to time. Major changes will be prominently announced on the platform with reasonable advance notice. Continued use of the platform constitutes acceptance of the updated policy.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1F2937]">
      <div className="max-w-[900px] mx-auto px-4 md:px-8 py-10 md:py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] text-sm mb-10 transition">← 返回首页 / Back to Home</Link>
        <div className="mb-12">
          <div className="text-[#2B6CB0] text-sm font-medium uppercase tracking-widest mb-2">法律文件 / Legal Document</div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0F2A44] mb-1 leading-tight">隐私政策</h1>
          <h2 className="text-xl font-semibold text-[#0F2A44]/40 mb-4">Privacy Policy</h2>
          <p className="text-[#9CA3AF] text-sm">最后更新 / Last Updated: {new Date().getFullYear()}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-6 md:px-8 py-6 mb-6">
          <p className="text-[#2B6CB0] text-sm leading-relaxed mb-2">我们重视您的隐私。本政策说明我们如何收集、使用和保护您在使用分鉴路（Fenjianlu）平台时提供的个人信息。</p>
          <p className="text-[#2B6CB0]/60 text-sm leading-relaxed italic">We value your privacy. This policy explains how we collect, use, and protect the personal information you provide when using the Fenjianlu platform.</p>
        </div>
        <div className="space-y-4">
          {sections.map((s) => (
            <div key={s.title} className="bg-white border border-[#E5E7EB] rounded-2xl px-6 md:px-8 py-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#0F2A44] mb-1">{s.title}</h2>
              <h3 className="text-xs font-semibold text-[#0F2A44]/40 mb-4">{s.titleEn}</h3>
              <p className="text-[#4B5563] text-sm leading-relaxed mb-2">{s.content}</p>
              <p className="text-[#9CA3AF] text-sm leading-relaxed italic">{s.contentEn}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-[#E5E7EB] pt-8 mt-10 text-xs text-[#9CA3AF] leading-relaxed">
          <p>如对本隐私政策有任何疑问，请通过平台管理员渠道与我们联系。</p>
          <p className="italic mt-1">For any questions regarding this privacy policy, please contact us through the platform administrator channel.</p>
        </div>
      </div>
    </main>
  );
}