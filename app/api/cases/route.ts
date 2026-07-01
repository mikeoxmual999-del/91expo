import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { checkCompliance, maskHardWords } from "@/app/lib/censor";
import { isAdminRequest } from "@/app/lib/adminAuth";

function maskFlaggedSpans(text: string, flaggedSpans: string[]) {
  return flaggedSpans
    .filter((span) => span.length > 0)
    .reduce((current, span) => current.split(span).join("***"), text);
}

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

    const all = searchParams.get("all");
    if (all === "true") {
      if (!isAdminRequest(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const [rows] = await pool.execute(
        "SELECT * FROM cases ORDER BY date DESC"
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
    const { id, company, amount, status, type, description, creator, paid, plan, duration, expires_at, timeline, forceContinue } = body;
    const adminOverride = body.adminOverride === true && isAdminRequest(req);
    const companyMask = maskHardWords(company || "");
    const descriptionMask = maskHardWords(description || "");
    let finalDescription = descriptionMask.cleaned;

    if (!adminOverride) {
      try {
        const compliance = await checkCompliance(description || "");
        if (!compliance.compliant) {
          if (!forceContinue) {
            return NextResponse.json(
              {
                error: "compliance",
                reasons: compliance.reasons,
                suggestion: compliance.suggestion,
                flaggedSpans: compliance.flaggedSpans,
              },
              { status: 422 }
            );
          }

          finalDescription = maskFlaggedSpans(descriptionMask.cleaned, compliance.flaggedSpans);
        }
      } catch (error) {
        console.error("AI compliance check failed; allowing Layer 1 result only:", error);
      }
    }

    await pool.execute(
      `INSERT INTO cases (id, company, amount, status, type, description, creator, paid, plan, duration, expires_at, timeline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        companyMask.cleaned,
        amount,
        status || "未回应",
        type || "未分类",
        finalDescription,
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
    if (!isAdminRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    await pool.execute("DELETE FROM cases WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DB error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
