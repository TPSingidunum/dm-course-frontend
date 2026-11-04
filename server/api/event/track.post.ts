import { z } from "zod";
import { db } from "~~/server/database/connection";
import { DEFAULT_SOURCE, EVENT_TYPES, PRODUCT_EVENT_TYPES, event } from "~~/server/database/schemas/event.schema";
import { eq } from "drizzle-orm";

// Day 1: accepts the full event set, validates it, stores it in the local database and returns the saved event.
// A copy is also sent to ML API (POST /events) so session recommendations (Day 9) see the live session.
const EventIn = z.object({
    event_type: z.enum(EVENT_TYPES),
    user_id: z.number().int().positive().nullish(),
    user_session: z.string().min(1).max(255),
    product_id: z.number().int().positive().nullish(),
    category_id: z.number().int().positive().nullish(),
    price: z.number().nonnegative().nullish(),
    quantity: z.number().int().min(1).default(1),
    source: z.string().max(32).nullish(),
    recommendation_source: z.string().max(32).nullish(),
    recommendation_position: z.number().int().min(1).nullish(),
}).refine(e => !(PRODUCT_EVENT_TYPES as readonly string[]).includes(e.event_type) || e.product_id != null,
    { message: "product_id is required for product events", path: ["product_id"] })

function nowLocal(): string {
    // normalized "YYYY-MM-DD HH:MM:SS" (no zone, no milliseconds) — same as Day 1 create_event
    return new Date().toISOString().slice(0, 19).replace("T", " ")
}

export default defineDbHandler(async (h) => {
    const parsed = EventIn.safeParse(await readBody(h))
    if (!parsed.success) {
        throw createError({ statusCode: 422, statusMessage: "invalid_event", data: parsed.error.issues })
    }
    const e = parsed.data
    const row = {
        event_type: e.event_type, user_id: e.user_id ?? null, user_session: e.user_session,
        product_id: e.product_id ?? null, category_id: e.category_id ?? null, price: e.price ?? null,
        quantity: e.quantity, source: e.source || DEFAULT_SOURCE[e.event_type] || "product_page",
        timestamp: nowLocal(), recommendation_source: e.recommendation_source ?? null,
        recommendation_position: e.recommendation_position ?? null,
    }
    let insertId: number
    try {
        const [res] = await db.insert(event).values(row)
        insertId = res.insertId
    } catch (err: unknown) {
        throw createError({ statusCode: 503, statusMessage: "db_unavailable", data: err instanceof Error ? (err.message || String(err)) : String(err) })
    }
    const saved = (await db.select().from(event).where(eq(event.event_id, insertId)))[0]
    const path = e.event_type.startsWith("recommendation_") ? "/recommendations/events" : "/events"
    const ml = await forwardToMl(path, Object.fromEntries(Object.entries(row).filter(([, v]) => v !== null)))
    setResponseStatus(h, 201)
    return { ...saved, forwarded_to_ml: ml.ok }
})
