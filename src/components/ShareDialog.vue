<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section class="q-py-xs">
        <div class="text-h6">{{ locale.shareTitle }}</div>
      </q-card-section>

      <q-card-section class="q-py-xs">
        <q-option-group
          color="primary"
          v-model="settings.preview"
          :options="previewOptions"
          inline
        />
      </q-card-section>

      <q-separator inset />

      <q-card-section v-if="settings.preview === 'output'" class="q-py-xs">
        <q-option-group
          color="primary"
          v-model="settings.previewMode"
          :options="previewModeOptions"
          inline
        />
      </q-card-section>

      <q-separator inset />

      <q-card-section class="q-py-xs">
        <q-option-group
          color="primary"
          v-model="settings.editor"
          :options="editorOptions"
          inline
        />
      </q-card-section>

      <q-card-section class="q-py-xs q-px-sm">
        <vue-qrious class="fit" :value="shareUrl" level="L" :size="551" :padding="10" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat color="grey-6" :label="locale.cancel" @click="onDialogHide" />
        <q-btn autofocus flat color="primary" :label="canShare ? locale.share : locale.shareCopy" @click="onShare" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="sass" scoped>
.q-option-group :deep(> div)
  width: calc(50% - 8px)
</style>

<style lang="sass">
.q-dialog-plugin.q-card--dark
  box-shadow: none
  border: 1px solid #666
  filter: drop-shadow(0 0 2px #9999)
body.body--dark
  .q-dialog__backdrop
    background: rgba(0, 0, 0, 0.7)
</style>

<script lang="ts">
const canShare = ref<boolean | null>(null);
const settings = reactive({
  preview: 'output',
  previewMode: 'preview',
  editor: 'codemirror',
});

const previewOptions = [
  { value: 'code', label: locale.shareOptions.code },
  { value: 'output', label: locale.shareOptions.output },
];

const previewModeOptions = [
  { value: 'preview', label: locale.shareOptions.outputPreview },
  { value: 'js', label: locale.shareOptions.outputJs },
  { value: 'css', label: locale.shareOptions.outputCss },
  { value: 'ssr', label: locale.shareOptions.outputSSR },
];

const editorOptions = [
  { value: 'monaco', label: locale.shareOptions.editorMonaco },
  { value: 'codemirror', label: locale.shareOptions.editorMirror },
];

const urlSearch = new URLSearchParams(location.search);
settings.preview = [ '', 'true', 't', '1' ].includes(String(urlSearch.get('preview')).toLowerCase()) ? 'output' : 'code';
settings.previewMode = (urlSearch.get('previewMode') || urlSearch.get('preview-mode') || 'preview').toLowerCase();
settings.editor = (urlSearch.get('editor') || 'monaco').toLowerCase().includes('mir') ? 'codemirror' : 'monaco';
</script>

<script setup lang="ts">
import { ref, reactive, computed, onBeforeMount } from 'vue';
import { useDialogPluginComponent, copyToClipboard, Notify } from 'quasar';
import VueQrious from 'vue-qrious';

import { locale } from '../utils/locale';

onBeforeMount(() => {
  if (canShare.value === null) {
    try {
      canShare.value = navigator.canShare({
        title: 'Test',
        url: window.location.href,
      });
    } catch (err) {
      canShare.value = false;
    }
  }
});

defineEmits([
  ...useDialogPluginComponent.emits,
]);

const { dialogRef, onDialogHide } = useDialogPluginComponent();

const shareUrl = computed(() => {
  const url = new URL(location.href);

  url.searchParams.delete('preview');
  url.searchParams.delete('previewMode');
  url.searchParams.delete('preview-mode');
  url.searchParams.delete('editor');

  if (settings.preview === 'output') {
    url.searchParams.set('preview', 't');
    url.searchParams.set('previewMode', settings.previewMode);
  }

  url.searchParams.set('editor', settings.editor);

  console.log(String(url).length);
  return String(url);
});

async function onShare() {
  const url = shareUrl.value;

  if (canShare.value) {
    try {
      await navigator.share({ title: 'Quasar Play Project', url });
    } catch (err) {
      canShare.value = false;
      await copyToClipboard(url);
    }
  } else {
    await copyToClipboard(url);
  }

  Notify.create({
    type: 'positive',
    message: locale.doneShare,
  });

  onDialogHide();
}
</script>
