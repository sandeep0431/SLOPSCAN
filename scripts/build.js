import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

async function runBuild() {
  console.log('--- [1/3] Building Popup UI ---');
  await build({
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          popup: resolve('index.html'),
        },
      },
    },
  });

  console.log('--- [2/3] Building Content Script (IIFE) ---');
  await build({
    configFile: false,
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      lib: {
        entry: resolve('src/content/index.ts'),
        name: 'SlopScanContent',
        formats: ['iife'],
        fileName: () => 'content.js',
      },
    },
  });

  console.log('--- [3/3] Building Background Service Worker ---');
  await build({
    configFile: false,
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      lib: {
        entry: resolve('src/background/index.ts'),
        name: 'SlopScanBackground',
        formats: ['iife'],
        fileName: () => 'background.js',
      },
    },
  });

  console.log('--- Copying Manifest & Assets ---');
  if (fs.existsSync('public/manifest.json')) {
    fs.copyFileSync('public/manifest.json', 'dist/manifest.json');
  }

  // Ensure icons are copied
  const iconsDist = resolve('dist/icons');
  if (!fs.existsSync(iconsDist)) {
    fs.mkdirSync(iconsDist, { recursive: true });
  }

  const iconFiles = fs.readdirSync('public/icons');
  for (const file of iconFiles) {
    fs.copyFileSync(`public/icons/${file}`, `dist/icons/${file}`);
  }

  console.log('✅ SlopScan Chrome Extension build complete in /dist');
}

runBuild().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
