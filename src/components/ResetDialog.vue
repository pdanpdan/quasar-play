<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section class="q-py-xs">
        <div class="text-h6">{{ locale.doReset }}</div>
      </q-card-section>

      <q-card-section class="q-py-xs">
        <q-option-group
          color="primary"
          v-model="type"
          :options="typeOptions"
          inline
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat color="negative" :label="locale.reset" @click="onReset" />
        <q-btn autofocus flat color="primary" :label="locale.cancel" @click="onDialogHide" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="sass" scoped>
.q-option-group :deep(> div)
  width: calc(50% - 8px)
</style>

<script lang="ts">
const typeOptions = [
  { value: 'clean', label: locale.resetOptions.clean },
  { value: 'full', label: locale.resetOptions.full },
];
</script>

<script setup lang="ts">
import { ref } from 'vue';
import { useDialogPluginComponent } from 'quasar';

import { locale } from '../utils/locale';

const type = ref('clean');

defineEmits([
  ...useDialogPluginComponent.emits,
]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();

async function onReset() {
  onDialogOK({ type: type.value });
}
</script>
