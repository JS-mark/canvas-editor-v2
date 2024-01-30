// eslint.config.js
import tm2js from '@tm2js/eslint-config'

export default await tm2js(
  {
    // Enable stylistic formatting rules
    // stylistic: true,

    // Or customize the stylistic rules
    stylistic: {
      indent: 2, // 4, or 'tab'
      quotes: 'single', // or 'double'
    },

    // TypeScript and Vue are auto-detected, you can also explicitly enable them:
    typescript: true,
    // 开启 vue
    vue: true,
    jsonc: true,
    yaml: true,

    // `.eslintignore` is no longer supported in Flat config, use `ignores` instead
    ignores: [
    ],
  },
  {
    // Remember to specify the file glob here, otherwise it might cause the vue plugin to handle non-vue files
    files: ['**/*.vue'],
    rules: {
      'vue/block-order': 'off',
      'vue/attribute-hyphenation': 'off',
      'vue/component-tags-order': 'off',
      'vue/prop-name-casing': 'off',
      'vue/no-useless-v-bind': 'off',
      'vue/space-infix-ops': 'off',
      'vue/no-unused-refs': 'off',
      'vue/v-slot-style': 'off',
      'vue/v-on-event-hyphenation': 'off',
      'vue/html-self-closing': 'off',
      'vue/eqeqeq': 'off',
      'vue/quote-props': 'warn',
      'vue/custom-event-name-casing': 'off',
      'vue/component-name-in-template-casing': 'off',
      'vue/operator-linebreak': ['error', 'before'],
      'vue/prefer-separate-static-class': 'off',
    },
  },
  {
    // Remember to specify the file glob here, otherwise it might cause the vue plugin to handle non-vue files
    files: ['**/*.ts'],
    rules: {
      'ts/no-unsafe-argument': 'off',
      'ts/no-namespace': 'off',
    },
  },
  {
    // Without `files`, they are general rules for all files
    rules: {
      'prefer-const': 'off',
      'node/handle-callback-err': 'off',
      'no-case-declarations': 'off',
      'prefer-template': 'off',
      'unicorn/prefer-number-properties': 'off',
      'sort-imports': 'off',
      'ts/no-use-before-define': 'warn',
      'tm2js/top-level-function': 'off',
      'eqeqeq': 'off',
      'curly': 'off',
      'no-console': 'off',
      'style/semi': ['error', 'never'],
      'semi': ['error', 'never'],
      'unicorn/no-new-array': 'off',
      'prefer-promise-reject-errors': 'off',
      'import/first': 'off',
      'array-callback-return': 'off',
      'import/order': 'off',
      'import/no-duplicates': 'warn',
      'ts/ban-ts-comment': 'off',
      'no-restricted-syntax': 'off',
      'unused-imports/no-unused-vars': 'warn',
      'symbol-description': 'off',
      'n/prefer-global/process': 'never',
    },
  },
)
