<template>
  <q-bar :dark="$q.dark.isActive">
    <div class="text-subtitle2">
      Quasar settings
    </div>

    <q-space />

    <q-btn
      flat
      dense
      icon="refresh"
      @click="onReload"
    />

    <q-btn
      flat
      dense
      :icon="$q.dark.isActive ? 'dark_mode' : 'light_mode'"
      @click="$q.dark.set($q.dark.isActive !== true)"
    />

    <q-btn
      flat
      dense
      :icon="$q.lang.rtl === true ? 'format_textdirection_r_to_l' : 'format_textdirection_l_to_r'"
      @click="$q.lang.set({ ...$q.lang, rtl: $q.lang.rtl !== true })"
    />
  </q-bar>
</template>

<script setup lang="ts">
function onReload() {
  location.reload();
}
</script>
