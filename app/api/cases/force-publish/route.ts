import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { isAdminRequest } from "@/app/lib/adminAuth";

export async function POST(req: NextRequest) {
  try {
    if (!isAdminRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing case id" }, { status: 400 });
    }

    const [rows] = await pool.execute("SELECT * FROM cases WHERE id = ?", [id]);
    const cases = rows as any[];
    if (cases.length === 0) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const existingCase = cases[0];
    const plan = existingCase.plan || "basic";
    const duration = existingCase.duration || "permanent";
    const expiresAt =
      duration === "permanent"
        ? null
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (!existingCase.plan || !existingCase.duration) {
      await pool.execute(
        "UPDATE cases SET status = ?, paid = ?, plan = ?, duration = ?, expires_at = ? WHERE id = ?",
        ["未回应", true, plan, duration, expiresAt, id]
      );
    } else {
      await pool.execute(
        "UPDATE cases SET status = ?, paid = ?, expires_at = ? WHERE id = ?",
        ["未回应", true, expiresAt, id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Force publish case error:", error);
    return NextResponse.json(
      { success: false, error: `Force publish failed: ${error.message}` },
      { status: 500 }
    );
  }
}
