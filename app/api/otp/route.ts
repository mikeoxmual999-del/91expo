import { NextRequest, NextResponse } from "next/server";

const SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID!;
const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;

async function twilioRequest(path: string, body: Record<string, string>) {
  const url = `https://verify.twilio.com/v2${path}`;
  const credentials = Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString("base64");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body).toString(),
  });
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();
    if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });

    if (code) {
      // verify OTP
      const data = await twilioRequest(
        `/Services/${SERVICE_SID}/VerificationCheck`,
        { To: phone, Code: code }
      );
      if (data.status === "approved") return NextResponse.json({ success: true });
      return NextResponse.json({ error: "验证码错误" }, { status: 400 });
    }

    // send OTP
    await twilioRequest(
      `/Services/${SERVICE_SID}/Verifications`,
      { To: phone, Channel: "sms" }
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("OTP error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}