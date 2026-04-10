"use client";

import Link from "next/link";

export default function TermsPage() {
  const sections = [
    { title: "1. 服务说明", content: "91记录为用户提供商业争议信息的发布、查询与记录服务。本平台不提供法律咨询、调解或仲裁服务，亦不对争议结果承担任何责任。" },
    { title: "2. 用户注册", content: "用户须使用真实有效的手机号码进行注册。每个手机号仅可注册一个账户。您有责任妥善保管账户信息，因账户被盗用或泄露所造成的损失由用户自行承担。" },
    { title: "3. 用户行为规范", content: "用户在使用本平台时须遵守适用法律法规，不得发布虚假信息、诽谤他人、侵犯他人隐私或从事任何违法活动。用户对其发布内容的真实性和合法性承担全部责任。" },
    { title: "4. 内容所有权", content: "用户发布的内容归用户本人所有。用户发布内容即视为授权本平台在服务范围内展示、存储及传播该内容。平台不会将用户内容用于商业目的。" },
    { title: "5. 平台权利", content: "本平台保留对违反本协议的内容进行删除、修改或屏蔽的权利，无需事先通知用户。对于严重违规行为，平台有权暂停或终止相关账户的使用权限。" },
    { title: "6. 私信功能", content: "平台提供私信功能用于当事方之间的沟通。私信内容在正常情况下仅对双方可见，但平台管理员在必要时有权查看私信内容以维护平台安全与合规。" },
    { title: "7. 服务变更", content: "本平台保留随时修改、暂停或终止部分或全部服务的权利。重大变更将提前在平台上公告。继续使用即表示接受变更后的服务条款。" },
    { title: "8. 争议解决", content: "本协议的解释及执行均适用中华人民共和国法律。如因本协议产生争议，双方应首先协商解决；协商不成的，提交平台所在地有管辖权的人民法院诉讼解决。" },
  ];

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1F2937]">
      <div className="max-w-[900px] mx-auto px-8 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] text-sm mb-12 transition">← 返回首页</Link>
        <div className="mb-14">
          <div className="text-[#2B6CB0] text-sm font-medium uppercase tracking-widest mb-3">法律文件</div>
          <h1 className="text-4xl font-bold text-[#0F2A44] mb-4 leading-tight">用户协议</h1>
          <p className="text-[#9CA3AF] text-sm">最后更新：{new Date().getFullYear()}年</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-8 py-6 mb-8">
          <p className="text-[#2B6CB0] text-sm leading-relaxed">请在使用本平台前仔细阅读以下协议。注册或使用本平台服务，即表示您已阅读、理解并同意遵守本协议的全部条款。</p>
        </div>
        <div className="space-y-4">
          {sections.map((s) => (
            <div key={s.title} className="bg-white border border-[#E5E7EB] rounded-2xl px-8 py-6 shadow-sm">
              <h2 className="text-base font-semibold text-[#0F2A44] mb-3">{s.title}</h2>
              <p className="text-[#6B7280] text-sm leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-[#E5E7EB] pt-10 mt-10 text-xs text-[#9CA3AF] leading-relaxed">
          如对本协议有任何疑问，请通过平台管理员渠道与我们联系。
        </div>
      </div>
    </main>
  );
}