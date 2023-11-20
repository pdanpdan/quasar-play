<template>
  <div>
    <template v-if="stylesLoaded">
      <quasar-settings />
      <app class="col" />
    </template>

    <div v-else class="play__loading-message">
      Loading, please wait...
    </div>
  </div>
</template>

<style>
.play__loading-message {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3vmin;
}
</style>

<script lang="ts">
export default {
  name: 'ReplWrapper',
};
</script>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue';

import App from './App.vue';
import QuasarSettings from './QuasarSettings.vue';

import boot from './boot';

if (!boot) {
  console.error('Boot file not compiled');
}

const stylesLoaded = ref(false);

const setStyleFn = () => {
  const id = '__quasar_style__';
  const old = document.querySelector(`#${ id }`) as HTMLLinkElement | null;
  const href = '__QUASAR_UI_STYLE__';

  if (old && old.href === href) {
    stylesLoaded.value = true;
    return;
  }

  const link = old || document.createElement('link');

  link.id = '__quasar_style__';
  link.rel = 'stylesheet';
  link.href = href;

  link.onload = () => {
    stylesLoaded.value = true;
  };
  link.onerror = (err) => {
    console.error('Error loading Quasar styles', err);
    stylesLoaded.value = true;
  };

  document.head.insertBefore(link, document.head.firstChild);
};

if (getCurrentInstance()) {
  onMounted(setStyleFn);
}
</script>
