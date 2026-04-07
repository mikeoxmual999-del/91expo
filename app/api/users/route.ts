import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

// POST - login or register user
export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone required" }, { status: 400 });
    }

    // check if user exists
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE phone = ?",
      [phone]
    );

    const users = rows as any[];

    if (users.length === 0) {
      // register new user
      await pool.execute(
        "INSERT INTO users (phone) VALUES (?)",
        [phone]
      );
    }

    // return user
    const [newRows] = await pool.execute(
      "SELECT * FROM users WHERE phone = ?",
      [phone]
    );

    return NextResponse.json((newRows as any[])[0]);
  } catch (error: any) {
    console.error("DB error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}