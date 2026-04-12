import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

// GET all coordination requests
export async function GET(req: NextRequest) {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM coordination_requests ORDER BY date DESC"
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("DB error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create coordination request
export async function POST(req: NextRequest) {
  try {
    const { caseId, amount, desc, contact, submittedBy } = await req.json();
    if (!caseId || !contact) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    await pool.execute(
      "INSERT INTO coordination_requests (case_id, amount, description, contact, submitted_by) VALUES (?, ?, ?, ?, ?)",
      [caseId, amount || null, desc || null, contact, submittedBy || null]
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DB error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE coordination request
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await pool.execute("DELETE FROM coordination_requests WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DB error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}