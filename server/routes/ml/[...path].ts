// Proxy /ml/** -> dm-ml API (NUXT_ML_API_URL, podrazumevano http://127.0.0.1:3001).
// Ako API nije dostupan vraća 502 (503 je rezervisan za dm-ml "model nije treniran"), a composable useMl() to tretira kao "ML nedostupan".
export default defineEventHandler(async (event) => {
  const base = String(useRuntimeConfig(event).mlApiUrl || "http://127.0.0.1:3001").replace(/\/$/, "")
  const path = event.path.replace(/^\/ml/, "") || "/"
  try {
    return await proxyRequest(event, base + path)
  } catch (e: any) {
    throw createError({ statusCode: 502, statusMessage: "dm-ml API unavailable" })
  }
})
