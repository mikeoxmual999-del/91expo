"use client";

import Link from "next/link";

export default function DisclaimerPage() {
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
            法律声明
          </div>
          <h1 className="text-4xl font-semibold mb-4 leading-tight">免责声明</h1>
          <p className="text-white/40 text-sm">最后更新：{new Date().getFullYear()}年</p>
        </div>

        {/* SECTIONS */}
        <div className="space-y-6">

          {[
            {
              title: "1. 平台性质",
              content:
                "91记录是一个中立的商业争议信息记录平台。本平台仅提供信息发布与展示服务，不代表任何一方的立场，亦不对任何争议作出法律裁定或道德评判。",
            },
            {
              title: "2. 内容真实性",
              content:
                "平台上发布的所有内容均由用户自行提交。本平台不对用户发布内容的真实性、完整性或准确性作出保证，亦不承担因用户发布虚假信息所引发的任何法律责任。",
            },
            {
              title: "3. 非法律意见",
              content:
                "本平台提供的任何信息均不构成法律意见或专业建议。如您面临法律纠纷，请咨询具有执业资格的律师或相关专业机构。",
            },
            {
              title: "4. 责任限制",
              content:
                "在法律允许的最大范围内，本平台对因使用或无法使用本平台服务所造成的任何直接、间接、附带或后果性损失，不承担任何责任。",
            },
            {
              title: "5. 第三方链接",
              content:
                "本平台可能包含指向第三方网站的链接。我们对第三方网站的内容、隐私政策或行为不承担任何责任，访问第三方网站的风险由用户自行承担。",
            },
            {
              title: "6. 内容删除",
              content:
                "若您认为平台上发布的内容侵犯了您的合法权益，您可以通过平台管理员渠道提交删除申请。我们将在核实后依据相关法律法规进行处理。",
            },
            {
              title: "7. 修改权利",
              content:
                "本平台保留随时修改本免责声明的权利，修改后的内容将在平台上公示。继续使用本平台即表示您接受更新后的声明内容。",
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
          如对本声明有任何疑问，请通过平台管理员渠道与我们联系。
        </div>

      </div>
    </main>
  );
}