import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";

export const db = drizzle(process.env.DATABASE_URL);

export async function testNow() {
	const result = await db.execute(sql`select now() as now`);
	return result.rows[0].now;
}
