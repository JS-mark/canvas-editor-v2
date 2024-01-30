import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import Dts from 'vite-plugin-dts'
import type { UserConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig((config: UserConfig) => {
  console.warn("配置项：", config)
  return {
    plugins: [
      Dts({
        rollupTypes: true
      })
    ],
    build: {
      commonjsOptions: {
        esmExternals: ['vue']
      },
      cssCodeSplit: true,
      sourcemap: true,
      lib: {
      // Could also be a dictionary or array of multiple entry points
        entry: resolve(__dirname, './index.ts'),
        name: 'canvas-editor',
        formats: ['es', 'umd'],
        fileName: (format, entryName) => `${format}.${entryName}`
      },
      rollupOptions: {
        output: [
          {
            format: 'es',
            dir: 'dist/es',
            entryFileNames: 'index.js',
          },
          {
            format: 'umd',
            dir: 'dist/umd',
            name: "CanvasEditor",
            entryFileNames: 'index.js',
          },
          {
            format: 'cjs',
            entryFileNames: "index.js",
            dir: 'dist/cjs'
          }
        ]
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@utils': resolve(__dirname, 'src/utils'),
      },
    },
  }
})
