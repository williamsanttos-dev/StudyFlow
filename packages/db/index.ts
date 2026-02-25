import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { sql } from "drizzle-orm";

import * as schema from "./schema/index.js"

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
})

export const db = drizzle(pool, { schema })

export async function testNow() {
	const result = await db.execute(sql`select now() as now`);
	return result.rows[0].now;
}
