/**
 * Copies all .js files from src/ to lib/ as .mjs files,
 * rewriting relative import/export paths from .js to .mjs
 * (and adding .mjs to bare relative paths missing an extension).
 *
 * This ensures Node.js recognizes the ESM source files natively
 * (via .mjs extension) without needing "type": "module" in
 * package.json.
 */
import fs from 'fs'
import path from 'path'

const SRC_DIR = "src";
const LIB_DIR = "lib";

// Matches:  from './foo.js'   from "../bar.js"   from './baz'
// Does NOT match bare specifiers like: from "inherits-ex"
const IMPORT_RE = /(from\s+['"]|import\s+['"])(\.\.?\/[^'"]*?)(\.js)?(['"])/g;

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Recursively walk a directory and process all .js files.
 */
function walkDir(currentDir, relativeDir) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    const relativePath = relativeDir
      ? path.join(relativeDir, entry.name)
      : entry.name;

    if (entry.isDirectory()) {
      walkDir(fullPath, relativePath);
    } else if (entry.name.endsWith(".js")) {
      processFile(fullPath, relativePath);
    }
  }
}

/**
 * Read a .js source file, rewrite import paths, and write as .mjs.
 */
function processFile(srcPath, relativePath) {
  const content = fs.readFileSync(srcPath, "utf8");
  const mjsContent = content.replace(
    IMPORT_RE,
    (match, prefix, modulePath, dotJs, suffix) => {
      // prefix:  from "   or   from '
      // modulePath:  ./foo   or   ../bar/baz
      // dotJs:  .js  (if present)
      // suffix:  "   or   '
      return `${prefix}${modulePath}.mjs${suffix}`;
    },
  );

  const mjsName = entryNameToMjs(relativePath);
  const destPath = path.join(LIB_DIR, mjsName);

  ensureDir(path.dirname(destPath));
  fs.writeFileSync(destPath, mjsContent, "utf8");

  console.log(`  ✓ ${relativePath} → ${path.join("lib", mjsName)}`);
}

function entryNameToMjs(name) {
  return name.replace(/\.js$/, ".mjs");
}

// --- Main ---
console.log("Copying ESM files (.mjs) from src/ to lib/ ...");
ensureDir(LIB_DIR);
walkDir(SRC_DIR, "");
console.log("Done.");
