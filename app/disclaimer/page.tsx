"use client";

import Link from "next/link";

export default function DisclaimerPage() {
  const sections = [
    {
      title: "1. 平台性质",
      titleEn: "1. Platform Nature",
      content: "91记录是一个中立的商业争议信息记录平台。本平台仅提供信息发布与展示服务，不代表任何一方的立场，亦不对任何争议作出法律裁定或道德评判。",
      contentEn: "91Records is a neutral platform for recording commercial dispute information. We provide information publishing and display services only, and do not represent any party or make any legal or moral judgments on disputes.",
    },
    {
      title: "2. 内容真实性",
      titleEn: "2. Content Accuracy",
      content: "平台上发布的所有内容均由用户自行提交。本平台不对用户发布内容的真实性、完整性或准确性作出保证，亦不承担因用户发布虚假信息所引发的任何法律责任。",
      contentEn: "All content published on this platform is submitted by users. We do not guarantee the truthfulness, completeness, or accuracy of user-submitted content, and we assume no legal liability for false information posted by users.",
    },
    {
      title: "3. 非法律意见",
      titleEn: "3. Not Legal Advice",
      content: "本平台提供的任何信息均不构成法律意见或专业建议。如您面临法律纠纷，请咨询具有执业资格的律师或相关专业机构。",
      contentEn: "Nothing on this platform constitutes legal advice or professional guidance. If you are involved in a legal dispute, please consult a qualified attorney or relevant professional institution.",
    },
    {
      title: "4. 责任限制",
      titleEn: "4. Limitation of Liability",
      content: "在法律允许的最大范围内，本平台对因使用或无法使用本平台服务所造成的任何直接、间接、附带或后果性损失，不承担任何责任。",
      contentEn: "To the fullest extent permitted by law, this platform shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use our services.",
    },
    {
      title: "5. 第三方链接",
      titleEn: "5. Third-Party Links",
      content: "本平台可能包含指向第三方网站的链接。我们对第三方网站的内容、隐私政策或行为不承担任何责任，访问第三方网站的风险由用户自行承担。",
      contentEn: "This platform may contain links to third-party websites. We are not responsible for the content, privacy policies, or practices of any third-party sites. Users access such sites at their own risk.",
    },
    {
      title: "6. 内容删除",
      titleEn: "6. Content Removal",
      content: "若您认为平台上发布的内容侵犯了您的合法权益，您可以通过平台管理员渠道提交删除申请。我们将在核实后依据相关法律法规进行处理。",
      contentEn: "If you believe any content on this platform infringes your legal rights, you may submit a removal request through the platform administrator. We will review and handle the request in accordance with applicable laws.",
    },
    {
      title: "7. 修改权利",
      titleEn: "7. Right to Modify",
      content: "本平台保留随时修改本免责声明的权利，修改后的内容将在平台上公示。继续使用本平台即表示您接受更新后的声明内容。",
      contentEn: "We reserve the right to modify this disclaimer at any time. Changes will be published on the platform. Continued use of the platform constitutes acceptance of the updated disclaimer.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1F2937]">
      <div className="max-w-[900px] mx-auto px-8 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] text-sm mb-12 transition">← 返回首页 / Back to Home</Link>
        <div className="mb-14">
          <div className="text-[#2B6CB0] text-sm font-medium uppercase tracking-widest mb-3">法律声明 / Legal Notice</div>
          <h1 className="text-4xl font-bold text-[#0F2A44] mb-1 leading-tight">免责声明</h1>
          <h2 className="text-xl font-semibold text-[#0F2A44]/60 mb-4">Disclaimer</h2>
          <p className="text-[#9CA3AF] text-sm">最后更新 / Last Updated: {new Date().getFullYear()}</p>
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
          <p>如对本声明有任何疑问，请通过平台管理员渠道与我们联系。</p>
          <p className="italic mt-1">For any questions regarding this disclaimer, please contact us through the platform administrator channel.</p>
        </div>
      </div>
    </main>
  );
}