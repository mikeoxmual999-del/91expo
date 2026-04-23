import { NextRequest, NextResponse } from "next/server";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
const TWILIO_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;

// in-memory OTP store for email verification
const otpStore: Record<string, { code: string; expires: number }> = {};

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendViaTwilio(phone: string): Promise<boolean> {
  try {
    const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");
    const res = await fetch(`https://verify.twilio.com/v2/Services/${TWILIO_SERVICE_SID}/Verifications`, {
      method: "POST",
      headers: { "Authorization": `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ To: phone, Channel: "sms" }).toString(),
    });
    return res.ok;
  } catch { return false; }
}

async function verifyViaTwilio(phone: string, code: string): Promise<boolean> {
  try {
    const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");
    const res = await fetch(`https://verify.twilio.com/v2/Services/${TWILIO_SERVICE_SID}/VerificationCheck`, {
      method: "POST",
      headers: { "Authorization": `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ To: phone, Code: code }).toString(),
    });
    const data = await res.json();
    return data.status === "approved";
  } catch { return false; }
}

async function sendEmailOTP(email: string, code: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "分监录 <noreply@fenjianlu.com>",
        to: email,
        subject: "您的分监录验证码",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0F2A44;">分监录验证码</h2>
            <p style="color: #6B7280;">您的登录验证码为：</p>
            <div style="background: #F5F7FA; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 36px; font-weight: bold; color: #2B6CB0; letter-spacing: 8px;">${code}</span>
            </div>
            <p style="color: #9CA3AF; font-size: 12px;">验证码5分钟内有效，请勿分享给他人。</p>
            <p style="color: #9CA3AF; font-size: 12px;">如非本人操作，请忽略此邮件。</p>
          </div>
        `,
      }),
    });
    return res.ok;
  } catch { return false; }
}

export async function POST(req: NextRequest) {
  try {
    const { phone, email, code, type } = await req.json();

    // EMAIL OTP
    if (type === "email") {
      if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

      if (code) {
        // verify email OTP
        const stored = otpStore[email];
        if (!stored) return NextResponse.json({ error: "验证码已过期" }, { status: 400 });
        if (Date.now() > stored.expires) {
          delete otpStore[email];
          return NextResponse.json({ error: "验证码已过期" }, { status: 400 });
        }
        if (stored.code !== code) return NextResponse.json({ error: "验证码错误" }, { status: 400 });
        delete otpStore[email];
        return NextResponse.json({ success: true });
      }

      // send email OTP
      const newCode = generateCode();
      otpStore[email] = { code: newCode, expires: Date.now() + 5 * 60 * 1000 };
      const ok = await sendEmailOTP(email, newCode);
      if (ok) return NextResponse.json({ success: true });
      return NextResponse.json({ error: "发送失败，请重试" }, { status: 500 });
    }

    // PHONE OTP (Twilio for non-China)
    if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });

    if (code) {
      const ok = await verifyViaTwilio(phone, code);
      if (ok) return NextResponse.json({ success: true });
      return NextResponse.json({ error: "验证码错误" }, { status: 400 });
    }

    const ok = await sendViaTwilio(phone);
    if (ok) return NextResponse.json({ success: true });
    return NextResponse.json({ error: "发送失败，请重试" }, { status: 500 });

  } catch (error: any) {
    console.error("OTP error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}