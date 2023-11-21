import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import autoprefixer from 'autoprefixer';
import { VitePWA } from 'vite-plugin-pwa';
import MkCert from 'vite-plugin-mkcert';
import { compression } from 'vite-plugin-compression2';

const playPkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));
const quasarPkg = JSON.parse(readFileSync(resolve(__dirname, 'node_modules/quasar/package.json'), 'utf-8'));
const getVersion = (name: string) => {
  const [ dep ] = [ playPkg, quasarPkg ]
    .map((p) => (p.dependencies && p.dependencies[ name ]) || (p.devDependencies && p.devDependencies[ name ]))
    .filter(Boolean);

  return dep && (/^\d/.test(dep) ? dep : dep.slice(1));
};

export default defineConfig(() => ({
  base: '/quasar-play/',
  define: {
    __QUASAR_VERSION__: JSON.stringify(quasarPkg.version),
    __VUE_VERSION__: JSON.stringify(getVersion('vue')),
    __TS_VERSION__: JSON.stringify(getVersion('typescript')),
    __PLAY_VERSION__: JSON.stringify(playPkg.version),
    __REPL_VERSION__: JSON.stringify(getVersion('@vue/repl')),
    __VUE_PROD_DEVTOOLS__: JSON.stringify(true),
  },

  resolve: {
    dedupe: [ 'vue' ],
  },

  esbuild: {
    drop: [ 'debugger' ],
    pure: [ 'console.log' ],
  },

  server: {
    port: 6012,
  },

  build: {
    chunkSizeWarningLimit: 10 * 1024,
  },

  optimizeDeps: {
    force: true,
    exclude: [ '@vue/repl', 'vue/server-renderer' ],
  },

  preview: {
    port: 6012,
  },

  css: {
    postcss: {
      plugins: [ autoprefixer ],
    },
  },

  plugins: [
    vue({
      template: { transformAssetUrls },
    }),

    quasar({
      sassVariables: 'src/styles/variables.sass',
    }),

    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        sourcemap: true,
      },
      manifest: {
        name: 'Quasar Play',
        short_name: 'QuasarPlay',
        description: 'Quasar Play REPL',
        theme_color: '#fff',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),

    MkCert(),

    compression({
      threshold: 1500,
      algorithm: 'brotliCompress',
      skipIfLargerOrEqual: true,
      exclude: [ 'ssr-manifest.json' ],
    }),

    {
      name: 'provide-meta',
      apply: 'build',
      transformIndexHtml() {
        const metaAttrs = [
          { 'http-equiv': 'Expires', content: '0' },
          { 'http-equiv': 'Pragma', content: 'no-cache' },
          { 'http-equiv': 'Cache', content: 'no-cache' },
          { 'http-equiv': 'Cache-control', content: 'no-store,no-cache,must-revalidate' },
        ];

        return metaAttrs.map((attrs) => ({ tag: 'meta', attrs }));
      },
    },
  ],
}));
