/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-pwa/vue" />

declare const __QUASAR_VERSION__: string;
declare const __VUE_VERSION__: string;
declare const __TS_VERSION__: string;
declare const __PLAY_VERSION__: string;
declare const __REPL_VERSION__: string;

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}

declare module '@pdanpdan/vue-repl/monaco-editor';
