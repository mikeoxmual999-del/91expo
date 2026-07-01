import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { isAdminRequest } from "@/app/lib/adminAuth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get("caseId");
    const responderId = searchParams.get("responderId");
    const posterId = searchParams.get("posterId");
    const userId = searchParams.get("userId");
    const allThreads = searchParams.get("allThreads");

    // admin: get all threads across all cases
    if (allThreads === "true") {
      if (!isAdminRequest(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const [rows] = await pool.execute(
        `SELECT
          m.case_id as caseId,
          c.company as caseCompany,
          c.company as caseTitle,
          m.poster_id as posterId,
          m.responder_id as responderId,
          COUNT(*) as messageCount,
          (
            SELECT m2.text
            FROM messages m2
            WHERE m2.case_id = m.case_id
              AND m2.poster_id <=> m.poster_id
              AND m2.responder_id = m.responder_id
            ORDER BY m2.timestamp DESC
            LIMIT 1
          ) as latestMessageText,
          MAX(m.timestamp) as latestTimestamp
         FROM messages m
         LEFT JOIN cases c ON c.id = m.case_id
         GROUP BY m.case_id, m.poster_id, m.responder_id, c.company
         ORDER BY latestTimestamp DESC`
      );
      return NextResponse.json(rows);
    }

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

    // thread: get all messages for caseId + responderId, optionally narrowed by posterId
    if (posterId) {
      const [rows] = await pool.execute(
        "SELECT * FROM messages WHERE case_id = ? AND responder_id = ? AND poster_id = ? ORDER BY timestamp ASC",
        [caseId, responderId, posterId]
      );
      return NextResponse.json(rows);
    }

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
