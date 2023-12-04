<template>
  <q-bar :dark="$q.dark.isActive">
    <div class="text-subtitle2">
      Quasar settings
    </div>

    <q-space />

    <q-btn
      class="q-mx-md"
      flat
      dense
      icon="refresh"
      @click="onReload"
    />

    <q-btn
      class="q-mx-md"
      flat
      dense
      :icon="$q.dark.isActive ? 'dark_mode' : 'light_mode'"
      @click="$q.dark.set($q.dark.isActive !== true)"
    />

    <q-btn
      class="q-ml-md"
      flat
      dense
      :icon="$q.lang.rtl === true ? 'format_textdirection_r_to_l' : 'format_textdirection_l_to_r'"
      @click="$q.lang.set({ ...$q.lang, rtl: $q.lang.rtl !== true })"
    />
  </q-bar>
</template>

<style scoped lang="sass">
.q-bar
  position: sticky
  top: 0
  z-index: 1
  background-color: #cfcfcf

  &--dark
    background-color: #3f3f3f
</style>

<script setup lang="ts">
function onReload() {
  location.reload();
}
</script>
