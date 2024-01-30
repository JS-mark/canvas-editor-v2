import { resolve, dirname } from 'node:path'
import url from 'node:url'
import { defineBuildConfig } from 'unbuild'
import licensePlugin from './rollupLicensePlugin'

const __dirname = dirname(url.fileURLToPath(import.meta.url))

export default defineBuildConfig({
  entries: ['src/index'],
  clean: true,
  rollup: {
    inlineDependencies: true,
    esbuild: {
      target: 'node18',
      minify: true,
    },
  },
  alias: {
    // we can always use non-transpiled code since we support node 18+
    prompts: 'prompts/lib/index.js',
  },
  hooks: {
    'rollup:options'(ctx, options) {
      options.plugins = [
        options.plugins,
        // @ts-expect-error
        licensePlugin(
          resolve(__dirname, './LICENSE'),
          'create-plugin license',
          'create-plugin',
        ),
      ]
    },
  },
})
