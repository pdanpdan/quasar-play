<template>
  <template v-if="NO_SETTINGS === true">
    <main-app v-if="NO_SUSPENSE === true" class="repl-container" />

    <suspense v-else>
      <main-app class="repl-container" />
    </suspense>
  </template>

  <div v-else-if="NO_SUSPENSE === true" class="repl-container">
    <quasar-settings v-if="onSSR !== true" />
    <main-app class="col" v-if="onSSR !== true" />
  </div>

  <suspense v-else>
    <div class="repl-container">
      <quasar-settings v-if="onSSR !== true" />
      <main-app class="col" v-if="onSSR !== true" />
    </div>
  </suspense>
</template>

<script lang="ts">
export default {
  name: 'ReplWrapper',
};
</script>

<script setup lang="ts">
import { ref, getCurrentInstance, onMounted } from 'vue';
import MainApp from './App.vue';
import QuasarSettings from './QuasarSettings.vue';

import { NO_SETTINGS, NO_SUSPENSE } from './boot';

const currentInstance = getCurrentInstance();
const onSSR = ref(true);
if (currentInstance !== null) {
  onMounted(() => {
    onSSR.value = false;
  });
}
</script>
