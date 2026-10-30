// defineDbHandler = defineEventHandler + "graceful degrade" kada lokalna MariaDB nije pokrenuta.
// Umesto generičkog 500 vraća 503 "Database unavailable" sa uputstvom (vidi README → Baza podataka).
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
                    message: `Lokalna MariaDB nije dostupna (${code}). Pokreni je (README → Baza podataka) ili podesi DB_* u .env.`,
                })
            }
            throw e
        }
    }) as EventHandler<T, D>
}
