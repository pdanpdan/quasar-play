<template>
  <div class="column q-pa-md">
    <div class="self-center">It's working</div>
  </div>
</template>

<style lang="sass">
body
  background-color: var(--play-bg-color-base)
  color: var(--play-fg-color-base)

.body
  &--light
    --play-bg-color-base: #f9f9f9
    --play-fg-color-base: #111

  &--dark
    --play-bg-color-base: #111
    --play-fg-color-base: #f9f9f9

#app > .repl-container
  min-height: 100dvh
  display: flex
  flex-direction: column
  flex-wrap: nowrap
</style>

<script setup lang="ts">
</script>
