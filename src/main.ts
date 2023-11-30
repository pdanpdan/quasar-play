import '@quasar/extras/roboto-font/roboto-font.css';
import 'quasar/src/css/index.sass';

import { registerSW } from 'virtual:pwa-register';

import { createApp, h, Suspense, watchEffect, onBeforeMount } from 'vue';
import { Quasar, useQuasar, Screen, Dialog, Notify, QSpinnerGrid } from 'quasar';
import iconSet from 'quasar/icon-set/svg-material-symbols-outlined';

import App from './App.vue';

const intervalMS = 60 * 60 * 1000;
registerSW({
  onRegisteredSW(swUrl, r) {
    r && setInterval(async () => {
      if (
        r.installing
        || !navigator
        || (('connection' in navigator) && !navigator.onLine)
      ) {
        return;
      }

      const resp = await fetch(swUrl, {
        cache: 'no-store',
        headers: {
          cache: 'no-store',
          'cache-control': 'no-cache',
        },
      });

      if (resp?.status === 200) {
        await r.update();
      }
    }, intervalMS);
  },
});

// @ts-expect-error Custom window property
window.VUE_DEVTOOLS_CONFIG = {
  defaultSelectedAppId: 'id:repl',
};

Screen.setSizes({ sm: 721 });

const app = createApp({
  setup() {
    const $q = useQuasar();

    onBeforeMount(() => {
      const savedDarkMode = localStorage.getItem('quasar-play-prefer-dark');

      if ([ 'true', 'false' ].includes(String(savedDarkMode))) {
        $q.dark.set(savedDarkMode === 'true');
      } else {
        $q.dark.set(window.matchMedia && window.matchMedia('screen and (prefers-color-scheme: dark)').matches);
      }

      watchEffect(() => {
        localStorage.setItem('quasar-play-prefer-dark', String($q.dark.isActive));
      });
    });

    return () => h(Suspense, null, {
      default: () => h(App),
      fallback: () => h(QSpinnerGrid, {
        class: 'absolute-center',
        size: '10vmin',
        color: 'accent',
      }),
    });
  },
});

app.use(Quasar, {
  plugins: {
    Notify,
    Dialog,
  },

  config: {
    dark: 'auto',
  },

  iconSet,
});

app.mount('#app');
