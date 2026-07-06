import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, '..', 'src');
const libDir = join(__dirname, '..', 'lib');

// Ensure lib directory exists
mkdirSync(libDir, { recursive: true });

// Get all .js files in src
const files = readdirSync(srcDir).filter(f => f.endsWith('.js'));
let count = 0;

for (const file of files) {
  const srcPath = join(srcDir, file);
  const mjsFile = file.replace(/\.js$/, '.mjs');
  const destPath = join(libDir, mjsFile);

  let content = readFileSync(srcPath, 'utf-8');

  // Rewrite relative import/export paths:
  //   from './path.js' -> from './path.mjs'
  //   from './path'    -> from './path.mjs'
  content = content.replace(
    /(from\s+['"])(\.\/[^'"]*?)(?:\.js)?(['"])/g,
    (_match, prefix, path, quote) => {
      const cleanPath = path.replace(/\.js$/, '');
      return `${prefix}${cleanPath}.mjs${quote}`;
    },
  );

  writeFileSync(destPath, content, 'utf-8');
  count++;
}

console.log(`Copied ${count} files from src/ to lib/ with .mjs extension, paths rewritten`);
