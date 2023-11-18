import { createApp } from 'vue';
import Boot from './boot';
import App from './App.vue';

import '@quasar/extras/roboto-font/roboto-font.css';
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/dist/quasar.rtl.prod.css';

( async function () {
  const app = createApp( App );

  await Boot( { app } );

  app.mount( '#app' );
} )();
