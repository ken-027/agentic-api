import { Pool } from "pg";
import { DB_URL } from "./env";
import { drizzle } from "drizzle-orm/node-postgres";

export const pool = new Pool({
    connectionString: DB_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

const db = drizzle({ client: pool });

export default db;
