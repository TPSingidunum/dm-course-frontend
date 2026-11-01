// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // Vue 3 supports multi-root templates (fragments); this rule only applies to Vue 2.
    'vue/no-multiple-template-root': 'off',
  },
})
