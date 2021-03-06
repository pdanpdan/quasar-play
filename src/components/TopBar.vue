<template>
  <div class="row items-center no-wrap q-px-sm q-py-xs play__top-bar">
    <q-btn
      class="play__quasar-logo q-mr-sm"
      flat
      :round="$q.screen.lt.lg"
      :padding="$q.screen.gt.md ? 'xs sm' : 'none'"
      :size="$q.screen.gt.md ? '16px' : ($q.platform.is.mobile ? '23.33px' : '20px')"
      no-caps
      :label="$q.screen.gt.md ? 'Quasar' : undefined"
      aria-label="Quasar Docs"
      :icon="`img:${ $q.dark.isActive ? LogoDark : LogoLight }`"
      target="_blank"
      href="//quasar.dev"
    />

    <div v-if="$q.screen.gt.md" class="text-caption text-grey-7 q-mr-md">
      <div v-for="ver in playVersions" :key="ver" style="line-height: 1.3">{{ ver }}</div>
    </div>

    <q-btn
      v-if="$q.screen.lt.lg"
      v-bind="iconBtnProps"
      :icon="symOutlinedTune"
      @click="overlayVisible = overlayVisible !== true"
    />

    <div
      :class="
        $q.screen.gt.md
          ? 'row items-center q-gutter-x-sm'
          : `column items-stretch q-gutter-y-sm play__settings-overlay play__settings-overlay--${ overlayVisible === true ? 'opened' : 'closed' }`
      "
      class="col"
    >
      <div v-if="$q.screen.lt.lg" class="row items-center justify-between text-caption text-grey-7">
        <q-btn
          v-bind="iconBtnProps"
          :icon="mdiGithub"
          aria-label="GitHub"
          title="GitHub"
          target="_blank"
          href="//github.com/pdanpdan/quasar-play/"
        />

        <div class="row items-center q-gutter-x-sm">
          <div v-for="ver in playVersions" :key="ver">{{ ver }}</div>
        </div>
      </div>

      <q-select
        v-for="(meta, pkg) in repoOptions"
        :key="pkg"
        outlined
        dense
        behavior="menu"
        :model-value="meta.active"
        :options="meta.versions"
        popup-content-class="q-select__options-list"
        @filter="(_, doneFn) => initRepoOptions(meta, doneFn)"
        @update:model-value="onChangeVersion(pkg, $event)"
      >
        <template #prepend>
          <div class="text-body2">{{ meta.name }}</div>
        </template>
      </q-select>

      <q-select
        outlined
        dense
        behavior="menu"
        :model-value="cdn"
        :options="cdnOptions"
        popup-content-class="q-select__options-list"
        @update:model-value="setCdn"
      >
        <template #prepend>
          <div class="text-body2">{{ locale.cdn }}</div>
        </template>
      </q-select>

      <q-select
        outlined
        dense
        behavior="menu"
        :model-value="editor"
        :options="editorOptions"
        map-options
        emit-value
        popup-content-class="q-select__options-list"
        @update:model-value="onChangeEditor"
      >
        <template #prepend>
          <div class="text-body2">{{ locale.editor.label }}</div>
        </template>
      </q-select>

      <q-space />

      <div class="row items-center q-gutter-x-sm">
        <q-btn-group flat>
          <q-btn
            style="min-width: 7ch"
            flat
            padding="xs sm"
            :color="productionMode === true ? 'primary' : ''"
            :label="productionMode === true ? 'PROD' : 'DEV'"
            :aria-label="productionMode === true ? locale.prod.on : locale.prod.off"
            :title="productionMode === true ? locale.prod.on : locale.prod.off"
            @click="onToggleProductionMode"
          />

          <q-btn
            style="min-width: 9ch"
            flat
            padding="xs sm"
            :color="ssr === true ? 'primary' : ''"
            :label="`SSR ${ ssr === true ? 'ON' : 'OFF' }`"
            :aria-label="ssr === true ? locale.ssr.on : locale.ssr.off"
            :title="ssr === true ? locale.ssr.on : locale.ssr.off"
            @click="onToggleSSR"
          />
        </q-btn-group>

        <q-space v-if="$q.screen.lt.lg" class="q-px-lg" />

        <q-btn
          color="negative"
          v-bind="iconBtnProps"
          :icon="symOutlinedDeleteForever"
          :aria-label="locale.reset"
          :title="locale.reset"
          @click="onReset"
        />
      </div>

      <q-btn
        v-if="$q.screen.lt.lg"
        flat
        padding="xs"
        size="12px"
        :icon="symOutlinedExpandLess"
        :aria-label="locale.close"
        :title="locale.close"
        @click="overlayVisible = overlayVisible !== true"
      />
    </div>

    <q-space />

    <div class="row items-center q-gutter-sm q-pl-sm">
      <q-btn
        v-bind="iconBtnProps"
        :icon="symOutlinedShare"
        :aria-label="locale.share"
        :title="locale.share"
        @click="onShare"
      />

      <q-btn
        v-bind="iconBtnProps"
        :icon="symOutlinedDownload"
        :aria-label="locale.download"
        :title="locale.download"
        @click="onDownload"
      />

      <q-btn
        v-bind="iconBtnProps"
        :color="autoSave === 0 ? 'negative' : 'positive'"
        :icon="symOutlinedSaveAs"
        :aria-label="autoSave === 0 ? locale.autoSave.off : locale.autoSave.on"
        :title="autoSave === 0 ? locale.autoSave.off : locale.autoSave.on"
        @click="onToggleAutoSave"
      />

      <q-btn
        v-bind="iconBtnProps"
        :icon="symOutlinedFormatAlignLeft"
        :aria-label="locale.format"
        :title="locale.format"
        @click="onFormatFiles"
      />

      <q-btn
        v-bind="iconBtnProps"
        :icon="$q.dark.isActive === true ? symOutlinedDarkMode : symOutlinedLightMode"
        :aria-label="$q.dark.isActive === true ? locale.theme.dark : locale.theme.light"
        :title="$q.dark.isActive === true ? locale.theme.dark : locale.theme.light"
        @click="$q.dark.set($q.dark.isActive !== true)"
      />

      <q-btn
        v-if="$q.screen.gt.md"
        v-bind="iconBtnProps"
        :icon="mdiGithub"
        aria-label="GitHub"
        title="GitHub"
        target="_blank"
        href="//github.com/pdanpdan/quasar-play/"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  onBeforeMount,
  onBeforeUnmount,
  ref,
  reactive,
  watch,
  type PropType,
} from 'vue';
import { Dialog, useQuasar } from 'quasar';

import {
  symOutlinedTune,
  symOutlinedDarkMode,
  symOutlinedLightMode,
  symOutlinedShare,
  symOutlinedDownload,
  symOutlinedFormatAlignLeft,
  symOutlinedDeleteForever,
  symOutlinedExpandLess,
  symOutlinedSaveAs,
} from '@quasar/extras/material-symbols-outlined';
import {
  mdiGithub,
} from '@quasar/extras/mdi-v7';
import LogoDark from '../assets/logo-dark.svg?url';
import LogoLight from '../assets/logo-light.svg?url';

import ShareDialog from './ShareDialog.vue';
import ResetDialog from './ResetDialog.vue';

import {
  cdnTemplates,
  cdn,
  setCdn,
} from '../utils/cdn';
import { locale } from '../utils/locale';
import { downloadProject } from '../download/download';
import { prettierCode } from '../utils/format';
import type { ReplStoreType } from '../store';

const props = defineProps({
  store: {
    type: Object as PropType<ReplStoreType>,
    required: true,
  },
  editor: {
    type: String,
    required: true,
  },
});

const emit = defineEmits([ 'update:editor' ]);

const overlayVisible = ref(false);
const { platform } = useQuasar();

const iconBtnProps = platform.is.mobile === true
  ? {
    flat: true,
    round: true,
    padding: '8px',
    size: '14px',
  }
  : {
    flat: true,
    round: true,
    padding: '6.87px',
    size: '12px',
  };

interface RepoMetaType {
  owner: string;
  repo: string;
  name: string;
  versions: string[];
  active: string;
  loaded: boolean;
}

const repoOptions: Record<string, RepoMetaType> = reactive({
  quasar: {
    owner: 'quasarframework',
    repo: 'quasar',
    name: 'Quasar',
    versions: [props.store.versions['quasar'] || __QUASAR_VERSION__],
    active: props.store.versions['quasar'] || __QUASAR_VERSION__,
    loaded: false,
  },
  vue: {
    owner: 'vuejs',
    repo: 'core',
    name: 'Vue',
    versions: [props.store.versions.vue || __VUE_VERSION__],
    active: props.store.versions.vue || __VUE_VERSION__,
    loaded: false,
  },
  typescript: {
    owner: 'microsoft',
    repo: 'TypeScript',
    name: 'TypeScript',
    versions: [props.store.versions.typescript || __TS_VERSION__],
    active: props.store.versions.typescript || __TS_VERSION__,
    loaded: false,
  },
});

async function fetchVersions(owner: string, repo: string, maxCount = 30) {
  const response = await fetch(`//api.github.com/repos/${ owner }/${ repo }/releases?per_page=200`);
  const releases = (await response.json()) as Record<string, string>[];
  return releases
    .map((r) => r.tag_name.replace(/^quasar-/, ''))
    .map((tagName) => (/^v/.test(tagName) ? tagName.slice(1) : tagName))
    .filter((tagName) => tagName.includes('-') === false)
    .filter((tagName) => repo !== 'quasar' || tagName[0] > '1')
    .slice(0, maxCount);
}

async function initRepoOptions(meta: RepoMetaType, doneFn: (callBackFn: () => void) => void) {
  if (meta.loaded === true) {
    doneFn(() => {});
  }

  const versions = await fetchVersions(meta.owner, meta.repo);

  doneFn(() => {
    if (meta.loaded !== true) {
      meta.versions = versions;
      meta.loaded = true;
    }
  });
}

const playVersions = [`play@${ __PLAY_VERSION__ }`,`repl@${ __REPL_VERSION__ }`];

const cdnOptions = Object.keys(cdnTemplates);

const editorOptions = [
  { value: 'codemirror', label: locale.editor.codemirror },
  { value: 'monaco', label: locale.editor.monaco },
];

function handleWindowBlur() {
  if (document.activeElement?.tagName === 'IFRAME') {
    document.dispatchEvent(new MouseEvent('click'));
  }
}

onBeforeMount(() => {
  window.addEventListener('blur', handleWindowBlur);
});

onBeforeUnmount(() => {
  window.removeEventListener('blur', handleWindowBlur);
});

const { autoSave, productionMode, ssr } = props.store;

function onShare() {
  Dialog.create({ component: ShareDialog });
}

function onDownload() {
  Dialog.create({
    title: locale.download,
    message: locale.doDownload,
    ok: {
      flat: true,
      color: 'primary',
      label: locale.download,
    },
    cancel: {
      flat: true,
      color: '',
      label: locale.cancel,
    },
    focus: 'ok',
  }).onOk(() => downloadProject(props.store));
}

function onReset() {
  Dialog.create({ component: ResetDialog }).onOk(({ type }) => {
    const url = new URL(location.href);
    url.hash = '';
    if (type === 'clean') {
      url.searchParams.set('clean', '');
    }
    location.href = String(url);
  });
}

function onChangeVersion(pkg: string, version: string) {
  const versionsMap: Record<string, string> = {};
  const url = new URL(location.href);

  repoOptions[ pkg ].active = version;

  for (const key of Object.keys(repoOptions)) {
    versionsMap[ key ] = repoOptions[ key ].active;
    url.searchParams.set(key, versionsMap[ key ]);
  }

  props.store.setVersions(versionsMap);
  history.replaceState({}, '', String(url));
}

function onChangeEditor(editorName: string) {
  emit('update:editor', editorName);

  const url = new URL(location.href);
  url.searchParams.set('editor', editorName);

  history.replaceState({}, '', String(url));
}

function onToggleProductionMode() {
  productionMode.value = productionMode.value !== true;

  const url = new URL(location.href);
  if (productionMode.value === true) {
    url.searchParams.set('prod', '');
  } else {
    url.searchParams.delete('prod');
  }

  history.replaceState({}, '', String(url));
}

function onToggleSSR() {
  ssr.value = ssr.value !== true;

  const url = new URL(location.href);
  if (ssr.value === true) {
    url.searchParams.set('ssr', '');
  } else {
    url.searchParams.delete('ssr');
  }

  history.replaceState({}, '', String(url));
}

function onToggleAutoSave() {
  autoSave.value = autoSave.value === 0 ? 250 : 0;
}

watch(props.store.activeFile, (fileName: string) => {
  const url = new URL(location.href);
  url.searchParams.set('file', fileName);
  history.replaceState({}, '', String(url));
});

async function onFormatFiles() {
  const files = props.store.replStore.state.files;

  for (const file of Object.values(files)) {
    if (!file.hidden) {
      file.code = await prettierCode(file.filename, file.code);
    }
  }
}
</script>

<style lang="sass">
body.desktop .q-select__options-list
  scrollbar-color: var(--play-bg-color-base) var(--play-fg-color-base)
  scrollbar-width: thin
  box-shadow: none
  border: 2px solid rgba(128, 128, 128, .2)

  &::-webkit-scrollbar
    width: 14px

  &::-webkit-scrollbar-track
    background-color: rgba(128, 128, 128, .2)
    border-radius: 2px

  &::-webkit-scrollbar-thumb
    background-color: var(--q-primary)
    border-radius: 4px
    border: 3px solid transparent
    background-clip: content-box

.play
  &__top-bar
    z-index: 20
    position: relative
    background: var(--play-bg-color-base)
    transform-style: preserve-3d

    .q-select.q-field--outlined.q-field--dense
      .q-field__control,
      .q-field__native
        min-height: 30px
      .q-field__marginal
        height: 30px

    body.mobile &
      .q-select.q-field--outlined.q-field--dense
        .q-field__control,
        .q-field__native
          min-height: 40px
        .q-field__marginal
          height: 40px

  &__settings-overlay
    z-index: -1
    background-color: var(--play-bg-color-base)
    position: absolute
    inset: 100% auto auto 0
    max-width: unset !important
    padding: 16px 16px 8px
    transition: var(--play-transition-transform)
    filter: drop-shadow(1px 1px 2px #9999)

    &--closed
      transform: translate3d(0, -100%, -1px)
      pointer-events: none
      opacity: 0

    &--opened
      transform: translate3d(0, 0, -1px)

    .q-select .q-field__native
      justify-content: flex-end

.play__quasar-logo
  img
    transform: rotate(0)
    transition: transform .8s ease-in-out
  &:hover img
    transform: rotate(-360deg)
</style>
