import { createApp, h } from 'vue';
import Boot from './boot';
import App from './App.vue';
import QuasarSettings from './QuasarSettings.vue';

declare global {
  interface Window { __app__: unknown; }
}

const Repl = {
  name: 'Repl',
  setup() {
    return () => h( 'div', [ h( QuasarSettings ), h( App ) ] );
  },
};

const mount = async () => {
  const app = ( window.__app__ = createApp( Repl ) );

  app.config.errorHandler = ( e ) => console.error( e );

  await Boot( { app } );

  app.mount( '#app' );
};

new Promise<void>( ( resolve, reject ) => {
  const id = '__quasar_style__';
  const old = document.querySelector( `#${ id }` ) as HTMLLinkElement | null;
  const href = '__QUASAR_UI_STYLE__';

  if ( old && old.href === href ) {
    resolve();
    return;
  }

  const link = old || document.createElement( 'link' );

  link.id = '__quasar_style__';
  link.rel = 'stylesheet';
  link.href = href;

  link.onload = () => resolve();
  link.onerror = reject;

  document.head.insertBefore( link, document.head.firstChild );
} ).then( mount );
