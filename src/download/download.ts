import { saveAs } from 'file-saver';

import indexFile from './template/index.html?raw';
import mainFile from './template/main.ts?raw';
import packageFile from './template/package.json';
import readmeFile from './template/README.md?raw';
import viteConfigFile from './template/vite.config.js?raw';
import vueDtsFile from './template/vue.d.ts?raw';
import LogoDark from '../assets/logo-dark.svg?raw';
import LogoLight from '../assets/logo-light.svg?raw';

import type { ReplStoreType } from '../store';

const internalImports = [
  '@vue/devtools-api',
  '@intlify/shared',
  '@intlify/core-base',
  '@intlify/message-compiler',
  'source-map-js',
  'vue-demi',
  '@quasar/extras/roboto-font/roboto-font.css',
  '@quasar/extras/material-icons/material-icons.css',
  'vue/server-renderer',
];

export async function downloadProject(store: ReplStoreType) {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const versions: Record<string, string> = {
    vue: __VUE_VERSION__,
    quasar: __QUASAR_VERSION__,
    typescript: __TS_VERSION__,
    ...store.versions,
  };

  const { imports } = store.replStore.getImportMap();
  const reVer = /@(^\/)+/;
  Object.keys(imports).map((name) => {
    const matchVer = reVer.exec(imports[ name ]);
    const version = (matchVer !== null ? matchVer[ 1 ] : '') || 'latest';

    if (internalImports.includes(name) === false && packageFile.dependencies && !(packageFile.dependencies as Record<string, string>)[ name ]) {
      (packageFile.dependencies as Record<string, string>)[ name ] = `${ version }`;
    }
  });

  if (packageFile.dependencies) {
    for (const name of Object.keys(packageFile.dependencies)) {
      if (versions[ name ]) {
        (packageFile.dependencies as Record<string, string>)[ name ] = `${ versions[ name ] }`;
      }
    }
  }

  if (packageFile.devDependencies) {
    for (const name of Object.keys(packageFile.devDependencies)) {
      if (versions[ name ]) {
        (packageFile.devDependencies as Record<string, string>)[ name ] = `${ versions[ name ] }`;
      }
    }
  }

  const files = store.replStore.getFiles();

  const ignoredFiles = [
    'import-map.json',
    'main.vue',
    'QuasarSettings.vue',
  ];

  for (const file in files) {
    if (ignoredFiles.includes(file)) {
      continue;
    }

    zip.file(`${ file === 'tsconfig.json' || file.indexOf('src/') === 0 ? '' : 'src/' }${ file }`, files[ file ]);
  }

  // basic structure
  zip.file('index.html', indexFile);
  zip.file('package.json', JSON.stringify(packageFile, null, 2) + '\n');
  zip.file('vite.config.js', viteConfigFile);
  zip.file('README.md', readmeFile);

  zip.file('public/logo-dark.svg', LogoDark);
  zip.file('public/logo-light.svg', LogoLight);

  zip.file('src/main.ts', mainFile);
  zip.file('src/vue.d.ts', vueDtsFile);

  const blob = await zip.generateAsync({ type: 'blob' });

  saveAs(blob, 'quasar_play_project.zip');
}
