import { reactive, ref, computed, watch } from 'vue';
import { ReplStore, File } from '@pdanpdan/vue-repl';
import { Dialog } from 'quasar';
import { compileString } from 'sass';

import { getCdnUrl } from './utils/cdn';
import { locale } from './utils/locale';

import SETTINGS_CODE from './templates/QuasarSettings.vue?raw';
import TS_CODE from './templates/tsconfig.json?raw';
import MAIN_CODE from './templates/main.vue?raw';

import FULL_APP_CODE from './templates/full/App.vue?raw';
import FULL_BOOT_CODE from './templates/full/boot.ts?raw';
import FULL_COUNTER_CODE from './templates/full/counter.ts?raw';

import CLEAN_APP_CODE from './templates/clean/App.vue?raw';
import CLEAN_BOOT_CODE from './templates/clean/boot.ts?raw';

import type { StoreOptions } from '@pdanpdan/vue-repl';

const MAIN_FILE = 'src/main.vue';
const APP_FILE = 'src/App.vue';
const IMPORT_FILE = 'import-map.json';
const TS_FILE = 'tsconfig.json';

const importMaps = {
  quasar: [ 'quasar', 'dist/quasar.esm.prod.js' ],
  '@vue/devtools-api': [ '@vue/devtools-api', 'lib/esm/index.js', '6.5.1' ],
  'vue-i18n': [ 'vue-i18n', 'dist/vue-i18n.esm-browser.js' ],
  pinia: [ 'pinia', 'dist/pinia.esm-browser.js' ],
  'vue-demi': [ 'vue-demi', 'lib/index.mjs', '0.13.11' ],
  'vue-router': [ 'vue-router', 'dist/vue-router.esm-browser.js' ],

  '@quasar/extras/roboto-font/roboto-font.css': [ '@quasar/extras', 'roboto-font/roboto-font.css' ],
  '@quasar/extras/material-icons/material-icons.css': [ '@quasar/extras', 'material-icons/material-icons.css' ],
} as Record<string, [ string, string, string?]>;

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

function patchTsConfig(code: string, versions: Record<string, string> = {}) {
  try {
    const tsConfig = JSON.parse(code);
    const moduleResolution = parseInt(versions.typescript.split('.')[ 0 ], 10) < 5 ? 'Node' : 'Bundler';
    tsConfig.compilerOptions.moduleResolution = moduleResolution;
    return JSON.stringify(tsConfig, null, 2);
  } catch (e) {
    // caught
  }
  return code;
}

const templateFilesFull = [
  { name: 'src/boot.ts', code: FULL_BOOT_CODE },
  { name: APP_FILE, code: FULL_APP_CODE },
  { name: 'src/counter.ts', code: FULL_COUNTER_CODE },
  { name: MAIN_FILE, code: MAIN_CODE, internal: true },
  { name: 'src/QuasarSettings.vue', code: SETTINGS_CODE, internal: true },
  { name: TS_FILE, code: TS_CODE },
];

const templateFilesClean = [
  { name: 'src/boot.ts', code: CLEAN_BOOT_CODE },
  { name: APP_FILE, code: CLEAN_APP_CODE },
  { name: MAIN_FILE, code: MAIN_CODE, internal: true },
  { name: 'src/QuasarSettings.vue', code: SETTINGS_CODE, internal: true },
  { name: TS_FILE, code: TS_CODE },
];

const url = new URL(location.href);
const templateFiles = [ '', 'true', 't', '1' ].includes(String(url.searchParams.get('clean')).toLowerCase()) ? templateFilesClean : templateFilesFull;
url.searchParams.delete('clean');
history.replaceState({}, '', url);

interface ReplOptionsType extends StoreOptions {
  versions?: Record<string, string>;
  ssr?: boolean;
  activeFile?: string;
}

const transformer: ReplOptionsType[ 'transformer' ] = async ({ code, filename }) => {
  const untransformed = { code, filename };

  if (filename.endsWith('.sass') || filename.endsWith('.scss')) {
    try {
      const newCode = compileString(code, { style: 'compressed', syntax: filename.endsWith('.sass') ? 'indented' : 'scss' });
      return { code: newCode.css, filename: `${ filename.split('.').slice(-1).join('.') }.css`, errors: [] };
    } catch (err) {
      return { code, filename, errors: [ String(err) ] };
    }
  }

  return untransformed;
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
    supportedLanguages: [ 'sass', 'scss', 'md' ],
    transformer,
  };

  const versions = reactive({ ...options.versions });
  const ssr = ref(options.ssr === true);
  const autoSave = ref(250);
  const productionMode = ref(options.productionMode === true);
  const quasarCSSUrl = computed(() => getCdnUrl('quasar', 'dist/quasar.rtl.prod.css', versions[ 'quasar' ]));

  const replStore = new ReplStore(options);
  replStore.addFile(new File(TS_FILE, patchTsConfig(replStore.state.files[ TS_FILE ].code, versions)));
  replStore.setTypeScriptVersion(versions.typescript);
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

  const activeFile = typeof options.activeFile === 'string' && options.activeFile.trim().length > 0 ? options.activeFile.trim() : APP_FILE;
  const fileNames = Object.keys(replStore.state.files);
  replStore.setActive(fileNames.includes(activeFile) === true ? activeFile : APP_FILE);

  watch(() => versions.quasar, () => {
    const { activeFile } = replStore.state;
    replStore.addFile(new File(IMPORT_FILE, JSON.stringify(buildImports(replStore.getImportMap(), versions), null, 2)));
    if (activeFile) {
      replStore.setActive(activeFile.filename);
    }
  });

  watch(() => versions.vue, () => {
    replStore.setVueVersion(versions.vue);
  });

  watch(() => versions.typescript, () => {
    const { activeFile } = replStore.state;
    replStore.addFile(new File(TS_FILE, patchTsConfig(replStore.state.files[ TS_FILE ].code, versions)));
    replStore.setTypeScriptVersion(versions.typescript);
    if (activeFile) {
      replStore.setActive(activeFile.filename);
    }
  });

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
    autoSave,
    productionMode,
    quasarCSSUrl,
    versions,
    activeFile: computed(() => (replStore.state.activeFile.filename)),

    setVersions(newVersions: Record<string, string>) {
      Object.assign(versions, newVersions);
    },
  };
}

export type ReplStoreType = Awaited<ReturnType<typeof useRepl>>;
