import type { App } from 'vue';
import { Quasar } from 'quasar';

// CHECK FULL DEMO for more examples - open another tab and rest to FULL EXAMPLE

// function is awaited before continue
export default function ({ app }: { app: App; }) {
  app.use(Quasar, {
    plugins: {
    },

    config: {
      dark: 'auto',
    },
  });
}

// set to `true` to not show the top Qusar Settings bar
// mult be set to `true` if you do not use or load quasar in `boot.ts`
export const NO_SETTINGS = false;

// set to `true` if you do not want your code to be wrapped in `Suspense` component
// your component must not be async
export const NO_SUSPENSE = false;
