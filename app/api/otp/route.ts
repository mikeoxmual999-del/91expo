import { NextRequest, NextResponse } from "next/server";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
const TWILIO_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID!;
const INFOBIP_API_KEY = process.env.INFOBIP_API_KEY!;
const INFOBIP_BASE_URL = process.env.INFOBIP_BASE_URL!;

// store codes temporarily in memory (per server instance)
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

async function sendViaInfobip(phone: string, code: string): Promise<boolean> {
  try {
    const res = await fetch(`https://${INFOBIP_BASE_URL}/sms/2/text/advanced`, {
      method: "POST",
      headers: {
        "Authorization": `App ${INFOBIP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{
          from: "fenjianlu",
          destinations: [{ to: phone }],
          text: `您的分监录验证码是：${code}，5分钟内有效。`,
        }]
      }),
    });
    return res.ok;
  } catch { return false; }
}

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();
    if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });

    const isChinaNumber = phone.startsWith("+86");

    if (code) {
      // VERIFY
      if (isChinaNumber) {
        // check our in-memory store for Infobip
        const stored = otpStore[phone];
        if (!stored) return NextResponse.json({ error: "验证码已过期" }, { status: 400 });
        if (Date.now() > stored.expires) {
          delete otpStore[phone];
          return NextResponse.json({ error: "验证码已过期" }, { status: 400 });
        }
        if (stored.code !== code) return NextResponse.json({ error: "验证码错误" }, { status: 400 });
        delete otpStore[phone];
        return NextResponse.json({ success: true });
      } else {
        // verify via Twilio
        const ok = await verifyViaTwilio(phone, code);
        if (ok) return NextResponse.json({ success: true });
        return NextResponse.json({ error: "验证码错误" }, { status: 400 });
      }
    }

    // SEND OTP
    if (isChinaNumber) {
      // use Infobip for China
      const newCode = generateCode();
      otpStore[phone] = { code: newCode, expires: Date.now() + 5 * 60 * 1000 };
      const ok = await sendViaInfobip(phone, newCode);
      if (ok) return NextResponse.json({ success: true });
      return NextResponse.json({ error: "发送失败，请重试" }, { status: 500 });
    } else {
      // use Twilio for everything else
      const ok = await sendViaTwilio(phone);
      if (ok) return NextResponse.json({ success: true });
      return NextResponse.json({ error: "发送失败，请重试" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("OTP error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}