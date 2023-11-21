import type { App } from 'vue';
import { Quasar } from 'quasar';

/*
Add imports as needed to `Import Map`

Pinia:
{
  "imports": {
    "@vue/devtools-api": "https://unpkg.com/@vue/devtools-api@latest/lib/esm/index.js",
    "pinia": "https://unpkg.com/pinia@latest/dist/pinia.esm-browser.js",
    "vue-demi": "https://unpkg.com/vue-demi@latest/lib/index.mjs"
  }
}

VueRouter:
{
  "imports": {
    "@vue/devtools-api": "https://unpkg.com/@vue/devtools-api@latest/lib/esm/index.js",
    "vue-router": "https://unpkg.com/vue-router@latest/dist/vue-router.esm-bundler.js"
  }
}

VueI18n:
{
  "imports": {
    "@vue/devtools-api": "https://unpkg.com/@vue/devtools-api@latest/lib/esm/index.js",
    "@intlify/shared": "https://unpkg.com/@intlify/shared@latest/dist/shared.esm-bundler.js",
    "@intlify/core-base": "https://unpkg.com/@intlify/core-base@latest/dist/core-base.esm-bundler.js",
    "@intlify/message-compiler": "https://unpkg.com/@intlify/message-compiler@latest/dist/message-compiler.esm-bundler.js",
    "source-map-js": "https://unpkg.com/source-map-js/source-map.js",
    "vue-i18n": "https://unpkg.com/vue-i18n@latest/dist/vue-i18n.esm-bundler.js"
  }
}
*/

import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { createRouter, createMemoryHistory } from 'vue-router';
import { h } from 'vue';

// function is awaited before continue
export default function ({ app }: { app: App; }) {
  app.use(createPinia());

  app.use(createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { render() { return h('div', [ 'Home' ]); } } },
      { path: '/about', component: { render() { return h('div', [ 'About' ]); } } },
    ],
  }));

  app.use(createI18n({
    legacy: false,
    locale: 'jp',
    fallbackLocale: 'en',
    messages: {
      en: {
        message: {
          hello: 'hello world',
        },
      },
      jp: {
        message: {
          hello: 'こんにちは、世界',
        },
      },
    },
  }));

  app.use(Quasar, {
    plugins: {
      // Notify,
      // Dialog,
    },

    config: {
      dark: 'auto',
    },
  });
}
