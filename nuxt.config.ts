// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  nitro: {
    preset: "bun",
    devServer: {
      watch: ["server/**/*"]
    }
  },
  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxt/ui'],

  // Base URL of the dm-ml API. Overridden at runtime by the NUXT_ML_API_URL env variable.
  // All /ml/** traffic goes through server/routes/ml/[...path].ts (proxy).
  runtimeConfig: {
    mlApiUrl: "http://127.0.0.1:3001",
  },
})
