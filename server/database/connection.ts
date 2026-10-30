import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as productSchema from "../database/schemas/product.schema"
import * as seoSchema from "../database/schemas/seo.schema"
import * as eventSchema from "../database/schemas/event.schema"
import * as categorySchema from "../database/schemas/category.schema"

// Defaults to the LOCAL MariaDB from docker-compose.yml (port 3307).
// No real database is used; the DB_* variables can point it at another local database.
const connection = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3307),
    user: process.env.DB_USER || "dm_local",
    password: process.env.DB_PASSWORD || "dm_local",
    database: process.env.DB_NAME || "dm_local",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true,
})

export const db = drizzle(connection, {
    schema: {
        ...productSchema,
        ...seoSchema,
        ...eventSchema,
        ...categorySchema,
    },
    mode: "default"
});
