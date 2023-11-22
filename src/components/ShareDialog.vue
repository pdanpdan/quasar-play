<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">{{ locale.share }}</div>
      </q-card-section>

      <q-card-section>
        <q-option-group
          color="primary"
          v-model="settings.preview"
          :options="previewOptions"
        />
      </q-card-section>

      <q-separator inset />

      <q-card-section>
        <q-option-group
          color="primary"
          v-model="settings.previewMode"
          :options="previewModeOptions"
          :disable="settings.preview !== 'output'"
        />
      </q-card-section>

      <q-separator inset />

      <q-card-section>
        <q-option-group
          color="primary"
          v-model="settings.editor"
          :options="editorOptions"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat color="grey-8" :label="locale.cancel" @click="onDialogHide" />
        <q-btn autofocus flat color="primary" :label="canShare ? locale.share : locale.shareCopy" @click="onShare" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

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
import { ref, reactive, onBeforeMount } from 'vue';
import { useDialogPluginComponent, copyToClipboard, Notify } from 'quasar';
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

function getUrl() {
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

  return String(url);
}

async function onShare() {
  const url = getUrl();

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
