// defineDbHandler = defineEventHandler + graceful degradation when the local MariaDB is not running.
// Instead of a generic 500 it returns 503 "Database unavailable" with instructions (see README → Database).
import type { EventHandler, EventHandlerRequest } from "h3"

const DB_CODES = ["ECONNREFUSED", "ER_ACCESS_DENIED_ERROR", "ER_BAD_DB_ERROR", "ENOTFOUND", "ETIMEDOUT", "PROTOCOL_CONNECTION_LOST", "ER_NO_SUCH_TABLE"]

interface ErrorWithCode { code?: unknown, cause?: unknown }

function dbCode(e: unknown): string | undefined {
    let c: unknown = e
    for (let i = 0; c && typeof c === "object" && i < 5; i++) {
        const err = c as ErrorWithCode
        if (err.code) return String(err.code)
        c = err.cause
    }
}

export function defineDbHandler<T extends EventHandlerRequest, D>(handler: EventHandler<T, D>): EventHandler<T, D> {
    return defineEventHandler<T>(async (event) => {
        try {
            return await handler(event)
        } catch (e: unknown) {
            const code = dbCode(e)
            if (code && DB_CODES.includes(code)) {
                throw createError({
                    statusCode: 503, statusMessage: "Database unavailable",
                    message: `The local MariaDB is unavailable (${code}). Start it (README → Database) or set DB_* in .env.`,
                })
            }
            throw e
        }
    }) as EventHandler<T, D>
}
