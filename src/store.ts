import { computed, reactive, ref, shallowRef, watch, watchEffect } from 'vue';
import { strFromU8, strToU8, unzlibSync, zlibSync } from 'fflate';
import { File, compileFile } from '@vue/repl';
import { Dialog } from 'quasar';

import { getCdnUrl } from './utils/cdn';
import { locale } from './utils/locale';

import mainCode from './templates/main.ts?raw';
import bootCode from './templates/boot.ts?raw';
import appCode from './templates/App.vue?raw';
import settingsCode from './templates/QuasarSettings.vue?raw';
import tsconfigCode from './templates/tsconfig.json?raw';

import type { Store, StoreOptions, StoreState } from '@vue/repl';

type ReplOptions = Omit<StoreOptions, 'defaultVueRuntimeURL' | 'defaultVueServerRendererURL'> & {
  versions?: Record<string, string>;
};

type CompilerType = typeof import( 'vue/compiler-sfc' );

interface PathMeta {
  pkg: string,
  path: string;
}

interface ImportMap {
  imports?: Record<string, string>,
  scopes?: Record<string, string>;
}

// repl internal files
const IMPORT_MAP = 'import-map.json';
const TSCONFIG = 'tsconfig.json';

const mainFile = 'src/main.ts';
const bootFile = 'src/boot.ts';
const appFile = 'src/App.vue';
const settingsFile = 'src/QuasarSettings.vue';

const pkgPathMap: Record<string, string | PathMeta> = {
  vue: 'dist/vue.runtime.esm-browser.js',
  'vue/server-renderer': {
    pkg: '@vue/server-renderer',
    path: 'dist/server-renderer.esm-browser.js',
  },
  quasar: 'dist/quasar.esm.prod.js',
  '@quasar/extras/roboto-font/roboto-font.css': {
    pkg: '@quasar/extras',
    path: 'roboto-font/roboto-font.css',
  },
  '@quasar/extras/material-icons/material-icons.css': {
    pkg: '@quasar/extras',
    path: 'material-icons/material-icons.css',
  },
};

const internalFiles: Record<string, string> = {
  [ settingsFile ]: settingsCode,
};

function utoa( data: string ): string {
  const buffer = strToU8( data );
  const zipped = zlibSync( buffer, { level: 9 } );
  const binary = strFromU8( zipped, true );

  return btoa( binary );
}

function atou( base64: string ): string {
  const binary = atob( base64 );

  // zlib header (x78), level 9 (xDA)
  if ( binary.startsWith( '\x78\xDA' ) ) {
    const buffer = strToU8( binary, true );
    const unzipped = unzlibSync( buffer );

    return strFromU8( unzipped );
  }

  // old unicode hacks for backward compatibility
  // https://base64.guru/developers/javascript/examples/unicode-strings
  return decodeURIComponent( escape( binary ) );
}

export function useReplStore( options: ReplOptions = {} ) {
  options = {
    serializedState: '',
    showOutput: false,
    outputMode: 'preview',
    versions: {},
    ...options,
  };

  const versions = reactive( { ...options.versions } );
  const compiler = shallowRef<CompilerType>();

  const files: StoreState[ 'files' ] = {};

  if ( options.serializedState ) {
    const saved = JSON.parse( atou( options.serializedState ) );

    for ( const name of Object.keys( saved ) ) {
      const filename = normalizeFilename( name );

      files[ filename ] = new File( filename, saved[ name ] );
    }
  } else {
    files[ bootFile ] = new File( bootFile, bootCode );
    files[ appFile ] = new File( appFile, appCode );
  }

  for ( const name of Object.keys( internalFiles ) ) {
    const filename = normalizeFilename( name );

    files[ filename ] = new File( filename, internalFiles[ name ], true );
  }

  if ( !files[ IMPORT_MAP ] ) {
    files[ IMPORT_MAP ] = new File(
      IMPORT_MAP,
      JSON.stringify( {
        imports: {
          '@vue/devtools-api': 'https://unpkg.com/@vue/devtools-api@latest/lib/esm/index.js',
          '@intlify/shared': 'https://unpkg.com/@intlify/shared@latest/dist/shared.esm-bundler.js',
          '@intlify/core-base': 'https://unpkg.com/@intlify/core-base@latest/dist/core-base.esm-bundler.js',
          '@intlify/message-compiler': 'https://unpkg.com/@intlify/message-compiler@latest/dist/message-compiler.esm-bundler.js',
          'source-map-js': 'https://unpkg.com/source-map-js/source-map.js',
          'vue-i18n': 'https://unpkg.com/vue-i18n@latest/dist/vue-i18n.esm-bundler.js',
          pinia: 'https://unpkg.com/pinia@latest/dist/pinia.esm-browser.js',
          'vue-demi': 'https://unpkg.com/vue-demi@latest/lib/index.mjs',
          'vue-router': 'https://unpkg.com/vue-router@latest/dist/vue-router.esm-bundler.js',
        },
      }, undefined, 2 ) + '\n' );
  }

  if ( !files[ TSCONFIG ] ) {
    files[ TSCONFIG ] = new File( TSCONFIG, tsconfigCode );
  }

  const state: StoreState = reactive( {
    mainFile,
    files,
    activeFile: files[ appFile ],
    errors: [],
    resetFlip: false,
    vueRuntimeURL: '',
    vueServerRendererURL: '',
    typescriptLocale: undefined,
    typescriptVersion: computed( () => versions.typescript || 'latest' ),
  } );

  const customImports = computed( () => {
    const code = state.files[ IMPORT_MAP ]?.code.trim();
    let map: ImportMap = {};

    if ( !code ) return map;

    try {
      map = JSON.parse( code );
    } catch ( e ) {
      console.error( e );
    }

    return map;
  } );
  const internalImports = computed( () => buildImports( versions ) );
  const importMap = computed( () => {
    return <ImportMap>{
      imports: {
        ...internalImports.value,
        ...( customImports.value.imports || {} ),
      },
      scopes: customImports.value.scopes,
    };
  } );

  const store: Store = reactive( {
    state,
    compiler: compiler as unknown as CompilerType,
    initialShowOutput: !!options.showOutput,
    initialOutputMode: ( options.outputMode || 'preview' ) as Store[ 'initialOutputMode' ],
    init,
    setActive,
    addFile,
    deleteFile,
    renameFile,
    getImportMap,
    getTsConfig,
    reloadLanguageTools: undefined,
  } );

  watch(
    () => versions[ 'quasar' ],
    () => {
      state.files[ mainFile ] = new File(
        mainFile,
        mainCode.replace(
          '__QUASAR_UI_STYLE__',
          getCdnUrl( 'quasar', 'dist/quasar.rtl.prod.css', versions[ 'quasar' ] ),
        ),
        true,
      );

      compiler.value && compileFile( store, state.files[ mainFile ] );
    },
    { immediate: true, deep: true },
  );

  function normalizeFilename( origin: string ) {
    if ( origin === IMPORT_MAP || origin === TSCONFIG || origin.startsWith( 'src/' ) ) {
      return origin;
    }

    return `src/${ origin }`;
  }

  function buildImports( versions: Record<string, string> = {} ) {
    const imports: Record<string, string> = {};

    for ( const name of Object.keys( pkgPathMap ) ) {
      const meta = pkgPathMap[ name ];

      let pkg = '';
      let path = '';

      if ( typeof meta === 'string' ) {
        pkg = name;
        path = meta;
      } else {
        pkg = meta.pkg;
        path = meta.path;
      }

      if ( !pkg || !path ) continue;

      imports[ name ] = getCdnUrl( pkg, path, versions[ pkg ] || 'latest' );
    }

    return imports;
  }

  async function loadCompiler( version?: string ) {
    const compilerUrl = getCdnUrl( '@vue/compiler-sfc', 'dist/compiler-sfc.esm-browser.js', version );
    const runtimeDom = getCdnUrl( '@vue/runtime-dom', 'dist/runtime-dom.esm-browser.js', version );

    compiler.value = await import(/* @vite-ignore */ compilerUrl );
    state.vueRuntimeURL = runtimeDom;
  }

  async function init() {
    if ( !compiler.value ) {
      await loadCompiler();
      watchEffect( () => compileFile( store, state.activeFile ) );
    }

    for ( const file of Object.values( state.files ) ) {
      compileFile( store, file );
    }
  }

  function setActive( filename: string ) {
    if ( !internalFiles[ filename ] ) {
      state.activeFile = state.files[ filename ];
    }
  }

  function addFile( fileOrFilename: string | File ): void {
    const file = typeof fileOrFilename === 'string' ? new File( fileOrFilename ) : fileOrFilename;
    state.files[ file.filename ] = file;

    if ( !file.hidden ) setActive( file.filename );
  }

  function deleteFile( filename: string ) {
    Dialog.create( {
      title: locale.del,
      message: locale.doDelete.replace( '#{0}', filename ),
      ok: {
        flat: true,
        color: 'negative',
        label: locale.del,
      },
      cancel: {
        flat: true,
        color: '',
        label: locale.cancel,
      },
      focus: 'cancel',
    } ).onOk( () => {
      if ( state.activeFile.filename === filename ) {
        state.activeFile = state.files[ appFile ];
      }

      delete state.files[ filename ];
    } );
  }

  function renameFile( oldName: string, newName: string ) {
    const file = state.files[ oldName ];

    if (
      !file ||
      !newName ||
      oldName === newName ||
      file.hidden ||
      [ appFile ].includes( file.filename )
    ) {
      return;
    }

    file.filename = newName;

    const files = { ...state.files };

    delete files[ oldName ];
    files[ newName ] = file;
    state.files = files;

    compileFile( store, file );
  }

  function serialize() {
    return '#' + utoa( JSON.stringify( getFiles() ) );
  }

  function getFiles() {
    const exported: Record<string, string> = {};

    for ( const filename of Object.keys( state.files ) ) {
      if ( !internalFiles[ filename ] ) {
        exported[ filename ] = state.files[ filename ].code;
      }
    }

    return exported;
  }

  function getImportMap() {
    return importMap.value;
  }

  function getDependencies() {
    const imports = customImports.value.imports || {};
    const reVer = /@(^\/)+/;

    return Object.keys( imports ).map( ( name ) => {
      const matchVer = reVer.exec( imports[ name ] );

      return { name, version: ( matchVer !== null ? matchVer[ 1 ] : '' ) || 'latest' };
    } );
  }

  function getTsConfig() {
    try {
      return JSON.parse( state.files[ TSCONFIG ].code );
    } catch ( e ) {
      return {};
    }
  }

  async function setVersions( newVersions: Record<string, string> ) {
    Object.assign( versions, newVersions );
  }

  return {
    ...store,

    ssr: ref( false ),
    versions,
    init,
    serialize,
    getFiles,
    getDependencies,
    setVersions,
  };
}

export type ReplStore = ReturnType<typeof useReplStore>;
