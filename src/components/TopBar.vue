<template>
  <div class="row items-center no-wrap q-px-sm q-py-xs play__top-bar">
    <q-btn
      class="play__quasar-logo"
      flat
      padding="xs sm"
      size="18px"
      no-caps
      :label="$q.screen.gt.md ? 'Quasar' : undefined"
      aria-label="Quasar Docs"
      :icon="`img:${ $q.dark.isActive ? LogoDark : LogoLight }`"
      target="_blank"
      href="//quasar.dev"
    />

    <div v-if="$q.screen.gt.md" class="text-caption text-grey-7 q-ml-sm q-mr-md">
      <div v-for="ver in playVersions" :key="ver" style="line-height: 1.3">{{ ver }}</div>
    </div>

    <q-btn
      v-if="$q.screen.lt.lg"
      flat
      round
      padding="sm"
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
      <div v-if="$q.screen.lt.lg" class="row justify-between text-caption text-grey-7">
        <div v-for="ver in playVersions" :key="ver">{{ ver }}</div>
      </div>

      <q-select
        v-for="(meta, pkg) in repoOptions"
        :key="pkg"
        outlined
        dense
        :model-value="meta.active"
        :options="meta.versions"
        popup-content-class="q-select__options-list"
        @filter="(_, doneFn) => initRepoOptions(meta, doneFn)"
        @update:model-value="onChangeVersion(pkg, $event)"
      >
        <template #prepend>
          <div class="text-body1">{{ meta.name }}</div>
        </template>
      </q-select>

      <q-select
        outlined
        dense
        :model-value="cdn"
        :options="cdnOptions"
        popup-content-class="q-select__options-list"
        @update:model-value="setCdn"
      >
        <template #prepend>
          <div class="text-body1">{{ locale.cdn }}</div>
        </template>
      </q-select>

      <q-space />

      <div class="row q-gutter-x-sm">
        <q-btn-group flat>
          <q-btn
            style="min-width: 7ch"
            flat
            :color="productionMode === true ? 'primary' : ''"
            padding="sm"
            :label="productionMode === true ? 'PROD' : 'DEV'"
            :aria-label="productionMode === true ? locale.prod.on : locale.prod.off"
            :title="productionMode === true ? locale.prod.on : locale.prod.off"
            @click="onToggleProductionMode"
          />

          <q-btn
            style="min-width: 9ch"
            flat
            :color="ssr === true ? 'primary' : ''"
            padding="sm"
            :label="`SSR ${ ssr === true ? 'ON' : 'OFF' }`"
            :aria-label="ssr === true ? locale.ssr.on : locale.ssr.off"
            :title="ssr === true ? locale.ssr.on : locale.ssr.off"
            @click="onToggleSSR"
          />
        </q-btn-group>

        <q-space v-if="$q.screen.lt.lg" class="q-px-lg" />

        <q-btn
          flat
          round
          padding="sm"
          color="negative"
          :icon="symOutlinedDeleteForever"
          :aria-label="locale.reset"
          :title="locale.reset"
          @click="onReset"
        />
      </div>

      <q-btn
        v-if="$q.screen.lt.lg"
        flat
        :icon="symOutlinedExpandLess"
        :aria-label="locale.close"
        :title="locale.close"
        @click="overlayVisible = overlayVisible !== true"
      />
    </div>

    <q-space />

    <div class="row q-gutter-sm q-pl-sm">
      <q-btn
        flat
        round
        padding="sm"
        :icon="symOutlinedShare"
        :aria-label="locale.share"
        :title="locale.share"
        @click="onShare"
      />

      <q-btn
        flat
        round
        padding="sm"
        :icon="symOutlinedDownload"
        :aria-label="locale.download"
        :title="locale.download"
        @click="onDownload"
      />

      <q-btn
        flat
        round
        padding="sm"
        :icon="symOutlinedFormatAlignLeft"
        :aria-label="locale.format"
        :title="locale.format"
        @click="onFormatFiles"
      />

      <q-btn
        flat
        round
        padding="sm"
        :icon="$q.dark.isActive === true ? symOutlinedDarkMode : symOutlinedLightMode"
        :aria-label="$q.dark.isActive === true ? locale.theme.dark : locale.theme.light"
        :title="$q.dark.isActive === true ? locale.theme.dark : locale.theme.light"
        @click="$q.dark.set($q.dark.isActive !== true)"
      />

      <q-btn
        flat
        round
        padding="sm"
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
  type PropType,
} from 'vue';
import { Dialog } from 'quasar';

import {
  symOutlinedTune,
  symOutlinedDarkMode,
  symOutlinedLightMode,
  symOutlinedShare,
  symOutlinedDownload,
  symOutlinedFormatAlignLeft,
  symOutlinedDeleteForever,
  symOutlinedExpandLess,
} from '@quasar/extras/material-symbols-outlined';
import {
  mdiGithub,
} from '@quasar/extras/mdi-v7';
import LogoDark from '../assets/logo-dark.svg?url';
import LogoLight from '../assets/logo-light.svg?url';

import ShareDialog from './ShareDialog.vue';

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
});

const overlayVisible = ref(false);

type RepoMetaType = {
  owner: string,
  repo: string,
  name: string,
  versions: string[],
  active: string,
  loaded: boolean,
};

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

const { ssr, productionMode } = props.store;

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
  Dialog.create({
    title: locale.reset,
    message: locale.doReset,
    ok: {
      flat: true,
      color: 'negative',
      label: locale.reset,
    },
    cancel: {
      flat: true,
      color: '',
      label: locale.cancel,
    },
    focus: 'cancel',
  }).onOk(() => {
    const url = new URL(location.href);
    url.hash = '';
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

  &__settings-overlay
    z-index: -1
    background-color: var(--play-bg-color-base)
    position: absolute
    inset: 100% auto auto 0
    max-width: unset !important
    padding: 16px 16px 8px
    transition: var(--play-transition-transform)
    filter: drop-shadow(2px 2px 4px #6666)

    &--closed
      transform: translate3d(0, -100%, -1px)
      pointer-events: none

    &--opened
      transform: translate3d(0, 0, -1px)

.play__quasar-logo
  img
    transform: rotate(0)
    transition: transform .8s ease-in-out
  &:hover img
    transform: rotate(-360deg)
</style>
