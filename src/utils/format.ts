import { Notify } from 'quasar';
import { getCdnUrl } from './cdn';
import { locale } from './locale';

import type { BuiltInParserName, Plugin } from 'prettier';

function load( path: string ) {
  return import(/* @vite-ignore */ getCdnUrl( 'prettier', path ) );
}

let format: typeof import( 'prettier' ).format | undefined;
let plugins: Plugin[];

const parsers: Record<string, BuiltInParserName> = {
  vue: 'vue',
  js: 'babel',
  ts: 'typescript',
  json: 'json',
};

export async function prettierCode( name: string, code: string ) {
  if ( !format ) {
    const close = Notify.create( {
      type: 'info',
      message: locale.loading.replace( '#{0}', 'Prettier' ),
    } );

    [ format, ...plugins ] = await Promise.all( [
      load( 'standalone.mjs' ).then( ( m ) => m.default.format ),
      load( 'plugins/estree.mjs' ).then( ( m ) => m.default ),
      load( 'plugins/html.mjs' ).then( ( m ) => m.default ),
      load( 'plugins/typescript.mjs' ).then( ( m ) => m.default ),
      load( 'plugins/babel.mjs' ).then( ( m ) => m.default ),
      load( 'plugins/postcss.mjs' ).then( ( m ) => m.default ),
    ] );

    setTimeout( close, 500 );
  }

  let parser: BuiltInParserName | undefined;

  for ( const ext of Object.keys( parsers ) ) {
    if ( name.endsWith( `.${ ext }` ) ) {
      parser = parsers[ ext ];
      break;
    }
  }

  if ( !parser ) return code;

  return format!( code, {
    parser,
    plugins,
    semi: true,
    quoteProps: 'as-needed',
    bracketSpacing: true,
    arrowParens: 'always',
    singleQuote: true,
    trailingComma: 'all',
    tabWidth: 2,
    useTabs: false,
    vueIndentScriptAndStyle: false,
  } );
}
