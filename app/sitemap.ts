import type { MetadataRoute } from "next";
import type { RowDataPacket } from "mysql2";
import pool from "./lib/db";

const baseUrl = "https://51jilu.com";

type CaseRow = RowDataPacket & {
  id: string | number;
};

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cases] = await pool.query<CaseRow[]>(
    `SELECT id
     FROM cases
     WHERE paid = TRUE
       AND (expires_at IS NULL OR expires_at > NOW())`,
  );

  return [
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    ...cases.map(({ id }) => ({
      url: `${baseUrl}/case/${encodeURIComponent(String(id))}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
