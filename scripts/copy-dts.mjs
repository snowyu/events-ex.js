/**
 * Copies `src/event-emitter.d.ts` to `lib/` (if the source exists),
 * then recursively finds all `.d.ts` files under `lib/` and creates
 * corresponding `.d.mts` copies so that Node.js ESM consumers can
 * resolve type declarations via the `.mjs` extension.
 */
import fs from 'fs'
import path from 'path'

const SRC_DIR  = 'src'
const LIB_DIR  = 'lib'

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

/**
 * Recursively walk a directory and process all .d.ts files.
 */
function walkDir(currentDir) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name)
    if (entry.isDirectory()) {
      walkDir(fullPath)
    } else if (entry.name.endsWith('.d.ts')) {
      const dtsPath  = fullPath
      const mtsPath  = fullPath.replace(/\.d\.ts$/, '.d.mts')
      fs.copyFileSync(dtsPath, mtsPath)
      console.log(`  ✓ ${path.relative(LIB_DIR, dtsPath)} → ${path.relative(LIB_DIR, mtsPath)}`)
    }
  }
}

// --- Main ---
console.log('Copying event-emitter.d.ts from src/ to lib/ ...')
const srcDts = path.join(SRC_DIR, 'event-emitter.d.ts')
const dstDts = path.join(LIB_DIR, 'event-emitter.d.ts')
if (fs.existsSync(srcDts)) {
  ensureDir(LIB_DIR)
  fs.copyFileSync(srcDts, dstDts)
  console.log(`  ✓ event-emitter.d.ts`)
} else {
  console.log(`  - source not found, skipped`)
}

console.log('Generating .d.mts declarations in lib/ ...')
if (fs.existsSync(LIB_DIR)) {
  walkDir(LIB_DIR)
}
console.log('Done.')
