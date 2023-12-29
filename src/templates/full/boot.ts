import type { App } from 'vue';
import { Quasar } from 'quasar';

/*
Add imports as needed to `Import Map`

Pinia:
{
  "imports": {
    "@vue/devtools-api": "https://unpkg.com/@vue/devtools-api@6.5.1/dist/index.mjs",
    "pinia": "https://unpkg.com/pinia/dist/pinia.esm-browser.js",
    "vue-demi": "https://unpkg.com/vue-demi/lib/index.mjs"
  }
}

VueRouter:
{
  "imports": {
    "@vue/devtools-api": "https://unpkg.com/@vue/devtools-api@6.5.1/dist/index.mjs",
    "vue-router": "https://unpkg.com/vue-router/dist/vue-router.esm-browser.js"
  }
}

VueI18n:
{
  "imports": {
    "@vue/devtools-api": "https://unpkg.com/@vue/devtools-api@6.5.1/dist/index.mjs",
    "vue-i18n": "https://unpkg.com/vue-i18n/dist/vue-i18n.esm-browser.js"
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
    // globalInjection: true,
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

// set to `true` to not show the top Quasar Settings bar
// if you do not load or use Quasar in `boot.ts` you must set this to `true`
export const NO_SETTINGS = false;

// set to `true` if you do not want your code to be wrapped in `Suspense` component
// your component must not be async
export const NO_SUSPENSE = false;
