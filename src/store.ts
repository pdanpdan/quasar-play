import { reactive, ref, watch } from 'vue';
import { ReplStore, File, compileFile } from '@vue/repl';
import { Dialog } from 'quasar';

import { getCdnUrl } from './utils/cdn';
import { locale } from './utils/locale';

import type { StoreOptions } from '@vue/repl';

const MAIN_FILE = 'src/main.vue';
const MAIN_CODE = await import('./templates/main.vue?raw').then((o) => o.default);
const APP_FILE = 'src/App.vue';

const importMaps = {
  quasar: [ 'quasar', 'dist/quasar.esm.prod.js' ],
  '@vue/devtools-api': [ '@vue/devtools-api', 'lib/esm/index.js' ],
  '@intlify/shared': [ '@intlify/shared', 'dist/shared.esm-bundler.js' ],
  '@intlify/core-base': [ '@intlify/core-base', 'dist/core-base.esm-bundler.js' ],
  '@intlify/message-compiler': [ '@intlify/message-compiler', 'dist/message-compiler.esm-bundler.js' ],
  'source-map-js': [ 'source-map-js', 'source-map.js' ],
  'vue-i18n': [ 'vue-i18n', 'dist/vue-i18n.esm-bundler.js' ],
  pinia: [ 'pinia', 'dist/pinia.esm-browser.js' ],
  'vue-demi': [ 'vue-demi', 'lib/index.mjs' ],
  'vue-router': [ 'vue-router', 'dist/vue-router.esm-bundler.js' ],

  '@quasar/extras/roboto-font/roboto-font.css': [ '@quasar/extras', 'roboto-font/roboto-font.css' ],
  '@quasar/extras/material-icons/material-icons.css': [ '@quasar/extras', 'material-icons/material-icons.css' ],
} as Record<string, [ string, string ]>;

function buildImports(currentImportMap: Record<string, Record<string, string>>, versions: Record<string, string> = {}) {
  const imports: Record<string, string> = currentImportMap.imports || {};

  for (const name of Object.keys(importMaps)) {
    const [ pkg, path ] = importMaps[ name ];

    imports[ name ] = getCdnUrl(pkg, path, versions[ pkg ] || 'latest');
  }

  return {
    ...currentImportMap,
    imports,
  };
}

const templateFiles = [
  { name: MAIN_FILE, code: MAIN_CODE, internal: true },
  { name: 'src/QuasarSettings.vue', code: await import('./templates/QuasarSettings.vue?raw').then((o) => o.default), internal: true },
  { name: 'src/boot.ts', code: await import('./templates/boot.ts?raw').then((o) => o.default) },
  { name: APP_FILE, code: await import('./templates/App.vue?raw').then((o) => o.default) },
  { name: 'src/counter.ts', code: await import('./templates/counter.ts?raw').then((o) => o.default) },
  { name: 'tsconfig.json', code: await import('./templates/tsconfig.json?raw').then((o) => o.default) },
];


type ReplOptionsType = StoreOptions & {
  versions?: Record<string, string>;
};

export function useRepl(options: ReplOptionsType = {}) {
  options = {
    showOutput: false,
    outputMode: 'preview',
    productionMode: false,
    ...options,
    serializedState: typeof options.serializedState === 'string' && options.serializedState.trim().length > 0
      ? options.serializedState
      : '',
    versions: {
      vue: __VUE_VERSION__,
      typescript: __TS_VERSION__,
      quasar: __QUASAR_VERSION__,
      ...options.versions,
    },
  };

  const versions = reactive({ ...options.versions });
  const ssr = ref(false);
  const productionMode = ref(false);
  const compiling = ref(true);
  let replLoadPromise = Promise.resolve();

  const replStore = new ReplStore(options);
  replStore.state.mainFile = MAIN_FILE;

  const addAllFiles = options.serializedState!.length === 0;
  templateFiles.forEach((file) => {
    if (addAllFiles === true || file.internal === true) {
      replStore.addFile(new File(file.name, file.code, file.internal === true));
    }
  });
  replStore.setActive(APP_FILE);
  replStore.state.mainFile = MAIN_FILE;

  watch(() => versions.typescript, () => {
    replStore.setTypeScriptVersion(versions.typescript);
  }, { immediate: true });

  watch(() => String([ versions.quasar, versions.vue ]), () => {
    compiling.value = true;
    const { activeFile } = replStore.state;
    replStore.setImportMap(buildImports(replStore.getImportMap(), versions));
    replStore.addFile(new File(
      MAIN_FILE,
      MAIN_CODE.replace('__QUASAR_UI_STYLE__', getCdnUrl('quasar', 'dist/quasar.rtl.prod.css', versions[ 'quasar' ])),
      true,
    ));
    replStore.state.mainFile = MAIN_FILE;
    replLoadPromise = replStore.setVueVersion(versions.vue)
      .then(() => replStore.compiler)
      .then(async () => {
        await compileFile(replStore, replStore.state.activeFile);
        await compileFile(replStore, replStore.state.files[ MAIN_FILE ]);
      })
      .then(() => {
        compiling.value = false;
      });

    replStore.setActive(activeFile.filename);
  }, { immediate: true });

  watch(productionMode, () => {
    if (replStore.productionMode !== productionMode.value) {
      replStore.toggleProduction();
    }
  }, { immediate: true });

  replStore.deleteFile = (filename: string) => {
    Dialog.create({
      title: locale.del,
      message: locale.doDelete.replace('#{0}', filename),
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
    }).onOk(() => {
      if (replStore.state.activeFile.filename === filename) {
        replStore.state.activeFile = replStore.state.files[ replStore.state.mainFile ];
      }
      delete replStore.state.files[ filename ];
    });
  };


  return {
    replStore,

    ssr,
    productionMode,
    versions,

    setVersions(newVersions: Record<string, string>) {
      Object.assign(versions, newVersions);
    },

    compiling,
    replLoadPromise,
  };
}

export type ReplStoreType = ReturnType<typeof useRepl>;
