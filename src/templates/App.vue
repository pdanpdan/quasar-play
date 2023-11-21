<template>
  <div class="column no-wrap">
    <q-toolbar class="bg-primary text-white">
      <q-toolbar-title>Quasar Play</q-toolbar-title>

      <q-tabs>
        <q-route-tab to="/" label="Home" />
        <q-route-tab to="/about" label="About" />
      </q-tabs>
    </q-toolbar>

    <div class="col q-pa-md flex flex-center">
      <div class="column items-center q-gutter-md">
        <q-option-group
          :model-value="locale"
          :options="langOptions"
          inline
          dense
          @update:model-value="locale = $event"
        />
        <div>{{ t('message.hello') }}</div>

        <q-btn
          unelevated
          color="accent"
          :label="`Click here${
            counterStore.count > 0 ? ` - you already did it ${counterStore.count} times` : ''
          }`"
          @click="counterStore.count += 1"
        />

        <div>Double that is {{ counterStore.doubleCount }}</div>

        <div>You are viewing this page</div>
        <router-view class="q-pa-lg" style="border: 2px solid #999" />
      </div>
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
import { useI18n } from 'vue-i18n';

import { useCounterStore } from './counter';

const { locale, t } = useI18n();
const counterStore = useCounterStore();

const langOptions = [
  { label: 'English', value: 'en' },
  { label: 'Japanese', value: 'jp' },
];
</script>
