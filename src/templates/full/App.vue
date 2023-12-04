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

        <q-input type="number" v-model.number="counterStore.count" outlined dense />

        <div>Double that is {{ counterStore.doubleCount }}</div>

        <div>You are viewing this page, styled using SASS</div>
        <router-view class="q-pa-lg styled-with-sass" style="border: 2px solid #999" />

        <q-color v-model="bgColor" />
      </div>
    </div>
  </div>
</template>

<style lang="sass">
#app > .repl-container
  min-height: 100dvh
  display: flex
  flex-direction: column
  flex-wrap: nowrap

.styled-with-sass
  color: v-bind(color)
  background-color: v-bind(bgColor)
</style>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { colors } from 'quasar';

import { useCounterStore } from './counter';

const { locale, t } = useI18n();
const counterStore = useCounterStore();
const { luminosity } = colors;

const bgColor = ref('#b80ba1');
const color = computed(() => luminosity(bgColor.value) > .25 ? '#000' : '#fff');

const langOptions = [
  { label: 'English', value: 'en' },
  { label: 'Japanese', value: 'jp' },
];
</script>
