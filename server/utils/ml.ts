// Server-side ML API call (best-effort). Base URL: runtimeConfig.mlApiUrl (env NUXT_ML_API_URL).
export function mlApiUrl(): string {
    return String(useRuntimeConfig().mlApiUrl || "http://127.0.0.1:3001").replace(/\/$/, "")
}

export async function forwardToMl(path: string, body: unknown): Promise<{ ok: boolean, status?: number, error?: string }> {
    try {
        const r = await fetch(mlApiUrl() + path, {
            method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
            signal: AbortSignal.timeout(3000),
        })
        return { ok: r.ok, status: r.status }
    } catch (e: unknown) {
        return { ok: false, error: e instanceof Error ? (e.message || String(e)) : String(e) }
    }
}
