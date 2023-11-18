import '@vue/repl/style.css';
import '@quasar/extras/roboto-font/roboto-font.css';
import 'quasar/src/css/index.sass';

import { createApp, h, Suspense, watchEffect } from 'vue';
import { Quasar, useQuasar, Screen, Dialog, Notify, QSpinnerGrid } from 'quasar';
import iconSet from 'quasar/icon-set/svg-material-symbols-outlined';

import App from './App.vue';

// @ts-expect-error Custom window property
window.VUE_DEVTOOLS_CONFIG = {
  defaultSelectedAppId: 'id:repl',
};

Screen.setSizes( { sm: 721 } );

const app = createApp( {
  setup() {
    const $q = useQuasar();
    const savedDarkMode = localStorage.getItem( 'quasar-play-prefer-dark' );

    if ( savedDarkMode !== undefined ) {
      $q.dark.set( savedDarkMode === 'true' );
    } else {
      $q.dark.set( window.matchMedia && window.matchMedia( 'prefers-color-scheme: dark' ).matches );
    }

    watchEffect( () => {
      localStorage.setItem( 'quasar-play-prefer-dark', String( $q.dark.isActive ) );
    } );

    return () => h( Suspense, null, {
      default: () => h( App ),
      fallback: () => h( QSpinnerGrid, {
        class: 'absolute-center',
        size: '10vmin',
        color: 'accent',
      } ),
    } );
  },
} );

app.use( Quasar, {
  plugins: {
    Notify,
    Dialog,
  },

  config: {
    dark: 'auto',
  },

  iconSet,
} );

app.mount( '#app' );
