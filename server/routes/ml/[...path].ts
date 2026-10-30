// Proxy /ml/** -> dm-ml API (NUXT_ML_API_URL, default http://127.0.0.1:3001).
// If the API is unreachable it returns 502 (503 is reserved for dm-ml "model not trained"); the useMl() composable treats it as "ML unavailable".
export default defineEventHandler(async (event) => {
  const base = String(useRuntimeConfig(event).mlApiUrl || "http://127.0.0.1:3001").replace(/\/$/, "")
  const path = event.path.replace(/^\/ml/, "") || "/"
  try {
    return await proxyRequest(event, base + path)
  } catch (e: any) {
    throw createError({ statusCode: 502, statusMessage: "dm-ml API unavailable" })
  }
})
