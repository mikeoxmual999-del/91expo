import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get("caseId");
    const responderId = searchParams.get("responderId");
    const userId = searchParams.get("userId");

    // get all threads for a user across all cases
    if (caseId === "all" && userId) {
      const [rows] = await pool.execute(
        `SELECT m.case_id, c.company, m.responder_id, m.poster_id,
          (SELECT text FROM messages m2 WHERE m2.case_id = m.case_id AND m2.responder_id = m.responder_id ORDER BY timestamp DESC LIMIT 1) as last_message,
          (SELECT timestamp FROM messages m2 WHERE m2.case_id = m.case_id AND m2.responder_id = m.responder_id ORDER BY timestamp DESC LIMIT 1) as last_timestamp,
          COUNT(*) as message_count
         FROM messages m
         LEFT JOIN cases c ON c.id = m.case_id
         WHERE m.poster_id = ? OR m.responder_id = ?
         GROUP BY m.case_id, m.responder_id, m.poster_id, c.company
         ORDER BY last_timestamp DESC`,
        [userId, userId]
      );
      return NextResponse.json(rows);
    }

    if (!caseId) return NextResponse.json({ error: "Missing caseId" }, { status: 400 });

    // inbox: get all threads for a case
    if (!responderId) {
      const [rows] = await pool.execute(
        `SELECT responder_id, poster_id,
          (SELECT text FROM messages m2 WHERE m2.case_id = m.case_id AND m2.responder_id = m.responder_id ORDER BY timestamp DESC LIMIT 1) as last_message,
          (SELECT timestamp FROM messages m2 WHERE m2.case_id = m.case_id AND m2.responder_id = m.responder_id ORDER BY timestamp DESC LIMIT 1) as last_timestamp,
          COUNT(*) as message_count
         FROM messages m WHERE case_id = ? GROUP BY responder_id, poster_id ORDER BY last_timestamp DESC`,
        [caseId]
      );
      return NextResponse.json(rows);
    }

    // thread: get all messages for caseId + responderId
    const [rows] = await pool.execute(
      "SELECT * FROM messages WHERE case_id = ? AND responder_id = ? ORDER BY timestamp ASC",
      [caseId, responderId]
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Messages DB error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { caseId, posterId, responderId, sender, text } = await req.json();
    if (!caseId || !responderId || !sender || !text) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    await pool.execute(
      "INSERT INTO messages (case_id, poster_id, responder_id, sender, text) VALUES (?, ?, ?, ?, ?)",
      [caseId, posterId || null, responderId, sender, text]
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Messages DB error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}