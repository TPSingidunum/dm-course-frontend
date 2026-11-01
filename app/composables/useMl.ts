// dm-ml calls through the Nitro proxy /ml/** -> :3001. Graceful fallback: error -> null (the page never crashes).
import type { Product, Rec } from '~/types/Product'

export async function mlGet<T = unknown>(path: string): Promise<T | null> {
    try {
        return await $fetch<T>("/ml" + path)
    } catch (e) {
        console.warn("dm-ml unavailable:", path, e)
        return null
    }
}

export async function mlPost<T = unknown>(path: string, body: Record<string, unknown> = {}): Promise<{ data: T | null, error: string | null }> {
    try {
        const url: string = "/ml" + path
        const data = await $fetch<T>(url, { method: "POST", body }) as T
        return { data, error: null }
    } catch (e: unknown) {
        const detail = (e as { data?: { detail?: unknown } } | null)?.data?.detail
        return { data: null, error: detail ? JSON.stringify(detail) : errorMessage(e) }
    }
}

// Catalog from the local database (slug, image, price) — enriches recommendations that only return product_id/name.
const catalog = ref<Record<number, Product>>({})
export async function useCatalog() {
    if (!Object.keys(catalog.value).length) {
        try {
            const rows = await $fetch<Product[]>("/api/shop")
            catalog.value = Object.fromEntries(rows.map(p => [p.product_id, p]))
        } catch { /* no catalog: recommendations are shown with their name only */ }
    }
    return catalog
}

export function enrich(recs: Rec[] | undefined, cat: Record<number, Product>): Rec[] {
    return (recs || []).map(r => ({ ...cat[r.product_id], ...r, slug: r.slug || cat[r.product_id]?.slug,
        img_url: r.img_url || cat[r.product_id]?.img_url, price: r.price ?? cat[r.product_id]?.price ?? null }))
}

export function formatPrice(p: number | null | undefined) {
    return p == null ? "—" : `€${Number(p).toFixed(2)}`
}

// Human-readable message from any thrown value.
export function errorMessage(e: unknown): string {
    return e instanceof Error ? (e.message || String(e)) : String(e)
}
