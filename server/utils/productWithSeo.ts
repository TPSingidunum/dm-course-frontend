import { eq, type SQL } from "drizzle-orm";
import { db } from "~~/server/database/connection";
import { product } from "~~/server/database/schemas/product.schema";
import { seo } from "~~/server/database/schemas/seo.schema";

// Explicit LEFT JOIN instead of db.query...with (the relational query uses a LATERAL JOIN, which MariaDB does not support;
// this works on both MySQL 8 and MariaDB).
export async function productWithSeo(where: SQL) {
    const rows = await db.select({ product, seo }).from(product).leftJoin(seo, eq(product.seo_id, seo.seo_id))
        .where(where).limit(1)
    const row = rows[0]
    if (!row) return null
    const { product: p, seo: s } = row
    const kw = typeof s?.key_words === "string" ? JSON.parse(s.key_words) : s?.key_words
    return { ...p, seo: s ? { ...s, key_words: kw } : null }
}
