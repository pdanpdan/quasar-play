import { reactive, ref, computed, watch } from 'vue';
import { ReplStore, File } from '@vue/repl';
import { Dialog } from 'quasar';

import { getCdnUrl } from './utils/cdn';
import { locale } from './utils/locale';

import MAIN_CODE from './templates/main.vue?raw';
import SETTINGS_CODE from './templates/QuasarSettings.vue?raw';
import BOOT_CODE from './templates/boot.ts?raw';
import APP_CODE from './templates/App.vue?raw';
import COUNTER_CODE from './templates/counter.ts?raw';
import TS_CODE from './templates/tsconfig.json?raw';

import type { StoreOptions } from '@vue/repl';

const MAIN_FILE = 'src/main.vue';
const APP_FILE = 'src/App.vue';
const IMPORT_FILE = 'import-map.json';
const TS_FILE = 'tsconfig.json';

const importMaps = {
  quasar: [ 'quasar', 'dist/quasar.esm.prod.js' ],
  '@vue/devtools-api': [ '@vue/devtools-api', 'lib/esm/index.js' ],
  'vue-i18n': [ 'vue-i18n', 'dist/vue-i18n.esm-browser.js' ],
  pinia: [ 'pinia', 'dist/pinia.esm-browser.js' ],
  'vue-demi': [ 'vue-demi', 'lib/index.mjs', '0.13.11' ],
  'vue-router': [ 'vue-router', 'dist/vue-router.esm-browser.js' ],

  '@quasar/extras/roboto-font/roboto-font.css': [ '@quasar/extras', 'roboto-font/roboto-font.css' ],
  '@quasar/extras/material-icons/material-icons.css': [ '@quasar/extras', 'material-icons/material-icons.css' ],
} as Record<string, [ string, string, string? ]>;

function buildImports(currentImportMap: Record<string, Record<string, string>>, versions: Record<string, string> = {}) {
  const imports: Record<string, string> = currentImportMap.imports || {};

  for (const name of Object.keys(importMaps)) {
    const [ pkg, path, ver ] = importMaps[ name ];

    imports[ name ] = getCdnUrl(pkg, path, versions[ pkg ] || ver);
  }

  return {
    ...currentImportMap,
    imports,
  };
}

const templateFiles = [
  { name: 'src/boot.ts', code: BOOT_CODE },
  { name: APP_FILE, code: APP_CODE },
  { name: 'src/counter.ts', code: COUNTER_CODE },
  { name: MAIN_FILE, code: MAIN_CODE, internal: true },
  { name: 'src/QuasarSettings.vue', code: SETTINGS_CODE, internal: true },
  { name: TS_FILE, code: TS_CODE },
];


type ReplOptionsType = StoreOptions & {
  versions?: Record<string, string>;
  ssr?: boolean;
};

export async function useRepl(options: ReplOptionsType = {}) {
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
  const ssr = ref(options.ssr === true);
  const productionMode = ref(options.productionMode === true);
  const quasarCSSUrl = computed(() => getCdnUrl('quasar', 'dist/quasar.rtl.prod.css', versions[ 'quasar' ]));

  const replStore = new ReplStore(options);
  replStore.setVueVersion(versions.vue);

  const addAllFiles = options.serializedState!.length === 0;
  const files = {} as Record<string, string>;
  files[ IMPORT_FILE ] = JSON.stringify(buildImports(replStore.getImportMap(), versions), null, 2);
  if (addAllFiles === true) {
    templateFiles.filter((file) => file.internal !== true).forEach((file) => {
      files[ file.name ] = file.code;
    });
  } else {
    Object.keys(replStore.state.files).forEach((fileName) => {
      files[ fileName ] = replStore.state.files[ fileName ].code;
    });
  }
  templateFiles.filter((file) => file.internal === true).forEach((file) => {
    files[ file.name ] = file.code;
  });
  await replStore.setFiles(files, MAIN_FILE);
  templateFiles.filter((file) => file.internal === true).forEach((file) => {
    replStore.state.files[ file.name ].hidden = true;
  });
  replStore.setActive(APP_FILE);

  watch(() => versions.quasar, () => {
    replStore.addFile(new File(IMPORT_FILE, JSON.stringify(buildImports(replStore.getImportMap(), versions), null, 2)));
  });

  watch(() => versions.vue, () => {
    replStore.setVueVersion(versions.vue);
  });

  watch(() => versions.typescript, () => {
    try {
      const tsConfig = JSON.parse(TS_CODE);
      const moduleResolution = parseInt(versions.typescript.split('.')[ 0 ], 10) < 5 ? 'Node' : 'Bundler';
      tsConfig.compilerOptions.moduleResolution = moduleResolution;
      replStore.addFile(new File(TS_FILE, JSON.stringify(tsConfig, null, 2)));
    } catch (e) {
      // caught
    }
    replStore.setTypeScriptVersion(versions.typescript);
  }, { immediate: true });

  watch(productionMode, () => {
    if (replStore.productionMode !== productionMode.value) {
      replStore.toggleProduction();
    }
  });

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
      if (!replStore.state.activeFile || replStore.state.activeFile.filename === filename) {
        replStore.state.activeFile = replStore.state.files[ replStore.state.mainFile ];
      }
      delete replStore.state.files[ filename ];
    });
  };

  return {
    replStore,

    ssr,
    productionMode,
    quasarCSSUrl,
    versions,

    setVersions(newVersions: Record<string, string>) {
      Object.assign(versions, newVersions);
    },
  };
}

export type ReplStoreType = Awaited<ReturnType<typeof useRepl>>;
