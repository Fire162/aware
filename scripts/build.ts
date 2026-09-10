import { build } from 'vite';
import path from 'path';
import fs from 'fs';

async function runBuild() {
  const rootDir = process.cwd();
  const distDir = path.resolve(rootDir, 'dist');

  console.log('[Aware] Building extension...');

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // 1. Build popup
  console.log('[Aware] 1/4 Compiling popup...');
  await build({
    root: path.resolve(rootDir, 'src/popup'),
    base: './',
    build: {
      outDir: path.resolve(distDir, 'popup'),
      emptyOutDir: true,
      rollupOptions: {
        input: path.resolve(rootDir, 'src/popup/index.html'),
      },
    },
    configFile: false,
  });

  // 2. Build local standalone guard page
  console.log('[Aware] 2/4 Compiling local guard page...');
  await build({
    root: path.resolve(rootDir, 'src/guard'),
    base: './',
    build: {
      outDir: path.resolve(distDir, 'guard'),
      emptyOutDir: true,
      rollupOptions: {
        input: path.resolve(rootDir, 'src/guard/index.html'),
      },
    },
    configFile: false,
  });

  // 3. Build content script as a self-contained IIFE bundle
  console.log('[Aware] 3/4 Compiling content script (IIFE)...');
  await build({
    root: rootDir,
    build: {
      outDir: distDir,
      emptyOutDir: false,
      lib: {
        entry: path.resolve(rootDir, 'src/content/content.ts'),
        name: 'AwareContent',
        formats: ['iife'],
        fileName: () => 'content.js',
      },
    },
    configFile: false,
  });

  // 4. Build background service worker (ES module)
  console.log('[Aware] 4/4 Compiling background service worker (ES)...');
  await build({
    root: rootDir,
    build: {
      outDir: distDir,
      emptyOutDir: false,
      lib: {
        entry: path.resolve(rootDir, 'src/background/service-worker.ts'),
        formats: ['es'],
        fileName: () => 'background.js',
      },
    },
    configFile: false,
  });

  // 4. Copy manifest.json & icons
  console.log('[Aware] Copying manifest and icons...');
  fs.copyFileSync(
    path.resolve(rootDir, 'manifest.json'),
    path.resolve(distDir, 'manifest.json')
  );

  const iconsDist = path.resolve(distDir, 'icons');
  fs.mkdirSync(iconsDist, { recursive: true });
  const iconsSrc = path.resolve(rootDir, 'public/icons');
  if (fs.existsSync(iconsSrc)) {
    for (const file of fs.readdirSync(iconsSrc)) {
      fs.copyFileSync(path.join(iconsSrc, file), path.join(iconsDist, file));
    }
  }

  console.log('✓ [Aware] Build succeeded! Unpacked extension ready at dist/');
}

runBuild().catch((err) => {
  console.error('✗ [Aware] Build error:', err);
  process.exit(1);
});
