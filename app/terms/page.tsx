"use client";

import Link from "next/link";

export default function TermsPage() {
  const sections = [
    {
      title: "1. 服务说明",
      titleEn: "1. Service Description",
      content: "91记录为用户提供商业争议信息的发布、查询与记录服务。本平台不提供法律咨询、调解或仲裁服务，亦不对争议结果承担任何责任。",
      contentEn: "91Records provides users with services for publishing, querying, and recording commercial dispute information. We do not offer legal consultation, mediation, or arbitration, and assume no responsibility for dispute outcomes.",
    },
    {
      title: "2. 用户注册",
      titleEn: "2. User Registration",
      content: "用户须使用真实有效的手机号码进行注册。每个手机号仅可注册一个账户。您有责任妥善保管账户信息，因账户被盗用或泄露所造成的损失由用户自行承担。",
      contentEn: "Users must register with a valid mobile phone number. Each number may only be associated with one account. You are responsible for keeping your account information secure. Losses resulting from unauthorized access are borne by the user.",
    },
    {
      title: "3. 用户行为规范",
      titleEn: "3. User Conduct",
      content: "用户在使用本平台时须遵守适用法律法规，不得发布虚假信息、诽谤他人、侵犯他人隐私或从事任何违法活动。用户对其发布内容的真实性和合法性承担全部责任。",
      contentEn: "Users must comply with applicable laws and regulations. You may not post false information, defame others, violate privacy, or engage in any illegal activities. Users bear full responsibility for the truthfulness and legality of their submitted content.",
    },
    {
      title: "4. 内容所有权",
      titleEn: "4. Content Ownership",
      content: "用户发布的内容归用户本人所有。用户发布内容即视为授权本平台在服务范围内展示、存储及传播该内容。平台不会将用户内容用于商业目的。",
      contentEn: "Content submitted by users remains the property of the user. By publishing content, you grant the platform a license to display, store, and distribute it within the scope of our services. We will not use user content for commercial purposes.",
    },
    {
      title: "5. 平台权利",
      titleEn: "5. Platform Rights",
      content: "本平台保留对违反本协议的内容进行删除、修改或屏蔽的权利，无需事先通知用户。对于严重违规行为，平台有权暂停或终止相关账户的使用权限。",
      contentEn: "We reserve the right to remove, modify, or block content that violates these terms without prior notice. For serious violations, we may suspend or terminate the associated account.",
    },
    {
      title: "6. 私信功能",
      titleEn: "6. Messaging Feature",
      content: "平台提供私信功能用于当事方之间的沟通。私信内容在正常情况下仅对双方可见，但平台管理员在必要时有权查看私信内容以维护平台安全与合规。",
      contentEn: "The platform provides a messaging feature for communication between parties. Messages are normally only visible to both parties, but platform administrators may access message content when necessary to maintain platform safety and compliance.",
    },
    {
      title: "7. 服务变更",
      titleEn: "7. Service Changes",
      content: "本平台保留随时修改、暂停或终止部分或全部服务的权利。重大变更将提前在平台上公告。继续使用即表示接受变更后的服务条款。",
      contentEn: "We reserve the right to modify, suspend, or terminate any part or all of our services at any time. Major changes will be announced in advance. Continued use constitutes acceptance of the updated terms.",
    },
    {
      title: "8. 争议解决",
      titleEn: "8. Dispute Resolution",
      content: "本协议的解释及执行均适用中华人民共和国法律。如因本协议产生争议，双方应首先协商解决；协商不成的，提交平台所在地有管辖权的人民法院诉讼解决。",
      contentEn: "This agreement shall be governed by the laws of the People's Republic of China. Disputes arising from this agreement shall first be resolved through negotiation; if negotiation fails, the matter shall be submitted to the competent court with jurisdiction.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1F2937]">
      <div className="max-w-[900px] mx-auto px-8 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] text-sm mb-12 transition">← 返回首页 / Back to Home</Link>
        <div className="mb-14">
          <div className="text-[#2B6CB0] text-sm font-medium uppercase tracking-widest mb-3">法律文件 / Legal Document</div>
          <h1 className="text-4xl font-bold text-[#0F2A44] mb-1 leading-tight">用户协议</h1>
          <h2 className="text-xl font-semibold text-[#0F2A44]/60 mb-4">Terms of Service</h2>
          <p className="text-[#9CA3AF] text-sm">最后更新 / Last Updated: {new Date().getFullYear()}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-8 py-6 mb-8">
          <p className="text-[#2B6CB0] text-sm leading-relaxed mb-2">请在使用本平台前仔细阅读以下协议。注册或使用本平台服务，即表示您已阅读、理解并同意遵守本协议的全部条款。</p>
          <p className="text-[#2B6CB0]/70 text-sm leading-relaxed italic">Please read the following agreement carefully before using this platform. By registering or using our services, you confirm that you have read, understood, and agreed to all terms of this agreement.</p>
        </div>
        <div className="space-y-4">
          {sections.map((s) => (
            <div key={s.title} className="bg-white border border-[#E5E7EB] rounded-2xl px-8 py-6 shadow-sm">
              <h2 className="text-base font-semibold text-[#0F2A44] mb-1">{s.title}</h2>
              <h3 className="text-sm font-medium text-[#0F2A44]/50 mb-3">{s.titleEn}</h3>
              <p className="text-[#6B7280] text-sm leading-relaxed mb-2">{s.content}</p>
              <p className="text-[#9CA3AF] text-sm leading-relaxed italic">{s.contentEn}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-[#E5E7EB] pt-10 mt-10 text-xs text-[#9CA3AF] leading-relaxed">
          <p>如对本协议有任何疑问，请通过平台管理员渠道与我们联系。</p>
          <p className="italic mt-1">For any questions regarding these terms, please contact us through the platform administrator channel.</p>
        </div>
      </div>
    </main>
  );
}