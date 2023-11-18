<template>
  <div class="col column no-wrap">
    <q-toolbar class="bg-primary text-white">
      <q-toolbar-title>Quasar Play</q-toolbar-title>
    </q-toolbar>

    <div class="col q-pa-md flex flex-center">
      <q-btn
        unelevated
        color="accent"
        :label="`Click here${ count > 0 ? ` - you already did it ${ count } times` : ''}`"
        @click="count += 1"
      />
    </div>
  </div>
</template>

<style>
#app > div {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
}
</style>

<script setup lang="ts">
import { ref } from 'vue';

const count = ref(0);
</script>
