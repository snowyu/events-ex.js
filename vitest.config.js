import { defineConfig } from 'vitest/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// util-ex has an exports field that only exposes "." and blocks deep
// imports like 'util-ex/lib/defineProperty'. Dependencies like
// custom-ability also import many util-ex/lib/ subpaths via bare
// specifiers (e.g., 'util-ex/lib/is/type/array').
//
// Vite's resolver strictly enforces the exports field, so we need
// to intercept resolution at a low level. We do this by having a
// Vite plugin that patches the util-ex package.json at config
// resolution time, adding wildcard exports for the lib directory.

export default defineConfig({
  plugins: [
    {
      name: 'fix-util-ex-resolution',
      configResolved() {
        const pkgPath = path.resolve(__dirname, 'node_modules/util-ex/package.json')
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
        if (!pkg._patched) {
          pkg.exports = {
            '.': pkg.exports['.'],
            './lib/*': {
              import: './lib/*.mjs',
              require: './lib/*.js',
            },
          }
          pkg._patched = true
          fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
        }
      },
    },
  ],
  test: {
    globals: true,
    include: ['test/**/*-test.js'],
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'html', 'lcov', 'clover'],
      include: ['src/**'],
      exclude: [
        'src/index.js',
        'src/event-emitter.d.ts',
        'src/util/**',
      ],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  },
})
