<template>
  <template v-if="NO_SETTINGS === true">
    <template v-if="NO_SUSPENSE === true">
      <main-app v-if="onSSR !== true" />
    </template>

    <suspense v-else>
      <main-app v-if="onSSR !== true" />
    </suspense>
  </template>

  <template v-else>
    <div v-if="NO_SUSPENSE === true">
      <quasar-settings v-if="onSSR !== true" />
      <main-app class="col" v-if="onSSR !== true" />
    </div>

    <suspense v-else>
      <div>
        <quasar-settings v-if="onSSR !== true" />
        <main-app class="col" v-if="onSSR !== true" />
      </div>
    </suspense>
  </template>
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
