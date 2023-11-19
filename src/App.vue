<template>
  <div class="play-container column no-wrap">
    <top-bar :store="store" :versions="versions" />

    <repl
      class="col"
      :theme="$q.dark.isActive ? 'dark' : 'light'"
      :editor="(editor as any)"
      :store="store"
      :ssr="ssr"
      :sfc-options="sfcOptions"
      :preview-options="previewOptions"

      @keydown="handleKeyDown"
    />
  </div>
</template>

<script setup lang="ts">
import { watchEffect, shallowRef } from 'vue';
import merge from 'deepmerge';

import { Repl } from '@vue/repl';
import TopBar from './components/TopBar.vue';

import { useReplStore } from './store';
import { prettierCode } from './utils/format';

function parseVersions() {
  const search = new URLSearchParams(location.search);
  const versions: Record<string, string> = {};

  for (const [name, value] of search.entries()) {
    versions[name] = value;
  }

  return versions;
}

async function handleKeyDown(event: KeyboardEvent) {
  const { code, ctrlKey, metaKey, altKey, shiftKey } = event;

  if ((ctrlKey || metaKey) && code === 'KeyS') {
    event.preventDefault();
  } else if ((ctrlKey || metaKey || altKey) && shiftKey && code === 'KeyF') {
    event.preventDefault();
    const file = store.state.activeFile;
    file.code = await prettierCode(file.filename, file.code);
  }
}

const urlSearch = new URLSearchParams( location.search );

const editor = shallowRef( {} );
const editorName = (urlSearch.get( 'editor' ) || 'monaco').toLowerCase();
import( editorName.includes( 'mir' ) ? '@vue/repl/codemirror-editor' : '@vue/repl/monaco-editor' ).then( ( component ) => {
  editor.value = component.default;
} );

// enable experimental features
let sfcOptions = {
  script: {
    // refTransform: true,
    // reactivityTransform: true
  },
};
try {
  const obj = JSON.parse( urlSearch.get( 'sfcOptions' ) || urlSearch.get( 'sfc-options' ) || 'null' );
  if ( obj === Object( obj ) ) {
    sfcOptions = merge( sfcOptions, obj );
  }
} catch ( e ) {
  // caught
}

let previewOptions = {
  headHTML: [
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons">',
  ].join('\n'),
};
try {
  const obj = JSON.parse( urlSearch.get( 'previewOptions' ) || urlSearch.get( 'preview-options' ) || 'null' );
  if ( obj === Object( obj ) ) {
    previewOptions = merge( previewOptions, obj );
  }
} catch ( e ) {
  // caught
}

const versions = parseVersions();

const store = useReplStore({
  serializedState: location.hash.slice( 1 ),
  versions,
  showOutput: [ '', 'true', 't', '1' ].includes( String( urlSearch.get( 'preview' ) ).toLowerCase() ),
  outputMode: ( urlSearch.get( 'previewMode' ) || urlSearch.get( 'preview-mode' ) || 'preview' ).toLowerCase(),
});

const { ssr } = store;

// persist state
watchEffect(() => history.replaceState({}, '', store.serialize()));

await store.init();
</script>

<style lang="sass">
@use 'sass:color'

:root
  --play-transition-duration: 250ms
  --play-transition-timing: ease
  --play-transition-base: var(--play-transition-duration) var(--play-transition-timing)
  --play-transition-color: color var(--play-transition-base)
  --play-transition-background: background-color var(--play-transition-base)
  --play-transition-border: border-color var(--play-transition-base)
  --play-transition-transform: transform var(--play-transition-base)

.body
  &--light
    --play-bg-color-base: #{$light}
    --play-fg-color-base: #{$dark}

    .vue-repl
      --bg: #fff
      --bg-soft: var(--play-bg-color-base)
      --border: #ddd
      --text-light: var(--play-fg-color-base)
      --color-branding: #{$primary}
      --color-branding-dark: #{color.scale($primary, $lightness: -30%)}

  &--dark
    --play-bg-color-base: #{$dark}
    --play-fg-color-base: #{$light}

    .vue-repl
      --bg: #1a1a1a
      --bg-soft: var(--play-bg-color-base)
      --border: #383838
      --text-light: var(--play-fg-color-base)
      --color-branding: #{$primary}
      --color-branding-dark: #{color.scale($primary, $lightness: 30%)}

body
  background: var(--play-bg-color-base) !important
  color: var(--play-fg-color-base) !important

.play-container
  height: 100dvh

.vue-repl,
.file-selector,
.tab-buttons,
.iframe-container
  transition: var(--play-transition-background), var(--play-transition-border)

.CodeMirror-gutters,
.split-pane .left
  transition: var(--play-transition-border)

.vue-repl
  .import-map-wrapper
    background: transparent !important
    position: static

  .file.active
    color: var(--play-fg-color-base)
    border-bottom-color: var(--color-branding-dark)

  .iframe-container
    background-color: var(--play-bg-color-base)

  .monaco-editor
    &-background,
    .margin
      transition: var(--play-transition-background)

</style>
