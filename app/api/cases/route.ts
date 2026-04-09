import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

// GET all paid cases or single case by id
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const [rows] = await pool.execute(
        "SELECT * FROM cases WHERE id = ?",
        [id]
      );
      const cases = rows as any[];
      if (cases.length === 0) return NextResponse.json(null);
      return NextResponse.json(cases[0]);
    }

    const creator = searchParams.get("creator");
    if (creator) {
      const [rows] = await pool.execute(
        "SELECT * FROM cases WHERE creator = ? ORDER BY date DESC",
        [creator]
      );
      return NextResponse.json(rows);
    }

    const [rows] = await pool.execute(
      "SELECT * FROM cases WHERE paid = TRUE ORDER BY date DESC"
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("DB error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create a new case
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, company, amount, status, type, description, creator, paid, plan, duration, expires_at, timeline } = body;

    await pool.execute(
      `INSERT INTO cases (id, company, amount, status, type, description, creator, paid, plan, duration, expires_at, timeline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        company,
        amount,
        status || "未回应",
        type || "未分类",
        description || "",
        creator || null,
        paid || false,
        plan || null,
        duration || null,
        expires_at || null,
        JSON.stringify(timeline || []),
      ]
    );

    const [rows] = await pool.execute("SELECT * FROM cases WHERE id = ?", [id]);
    return NextResponse.json((rows as any[])[0]);
  } catch (error: any) {
    console.error("DB error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH update a case
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...fields } = body;

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const updates = Object.keys(fields)
      .map((key) => `${key} = ?`)
      .join(", ");

    const values = Object.values(fields).map((v) => {
      if (typeof v === "object" && v !== null && !Array.isArray(v)) return JSON.stringify(v);
      if (Array.isArray(v)) return JSON.stringify(v);
      // convert ISO datetime to MySQL format
      if (typeof v === "string" && v.includes("T") && v.includes("Z")) {
        return v.replace("T", " ").replace("Z", "").split(".")[0];
      }
      return v;
    });

    await pool.execute(
      `UPDATE cases SET ${updates} WHERE id = ?`,
      [...values, id]
    );

    const [rows] = await pool.execute("SELECT * FROM cases WHERE id = ?", [id]);
    return NextResponse.json((rows as any[])[0]);
  } catch (error: any) {
    console.error("DB error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE a case
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await pool.execute("DELETE FROM cases WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DB error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}