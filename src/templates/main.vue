<template>
  <suspense>
    <div>
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

import boot from './boot';

if (!boot) {
  console.error('Boot file not compiled');
}

const currentInstance = getCurrentInstance();
const onSSR = ref(true);
if (currentInstance !== null) {
  onMounted(() => {
    onSSR.value = false;
  });
}
</script>
