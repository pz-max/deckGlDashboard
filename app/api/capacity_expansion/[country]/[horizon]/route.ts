import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: Number(process.env.POSTGRES_PORT),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { country: string; horizon: string } },
) {
  const { country, horizon } = params;

  try {
    const result = await pool.query(
      `
        SELECT *
        FROM public.capacity_expansion
        WHERE country_code = $1 AND horizon = $2;
      `,
      [country, horizon],
    );

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch capacity expansion data" },
      { status: 500 },
    );
  }
}
