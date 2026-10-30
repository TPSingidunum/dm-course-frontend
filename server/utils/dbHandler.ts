// defineDbHandler = defineEventHandler + graceful degradation when the local MariaDB is not running.
// Instead of a generic 500 it returns 503 "Database unavailable" with instructions (see README → Database).
import type { EventHandler, EventHandlerRequest } from "h3"

const DB_CODES = ["ECONNREFUSED", "ER_ACCESS_DENIED_ERROR", "ER_BAD_DB_ERROR", "ENOTFOUND", "ETIMEDOUT", "PROTOCOL_CONNECTION_LOST", "ER_NO_SUCH_TABLE"]

function dbCode(e: any): string | undefined {
    for (let c = e, i = 0; c && i < 5; c = c.cause, i++) if (c.code) return c.code
}

export function defineDbHandler<T extends EventHandlerRequest, D>(handler: EventHandler<T, D>): EventHandler<T, D> {
    return defineEventHandler<T>(async (event) => {
        try {
            return await handler(event)
        } catch (e: any) {
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
