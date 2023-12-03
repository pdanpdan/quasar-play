const config = {
  en: {
    cancel: 'Cancel',
    close: 'Close settings panel',
    doDelete: 'Are you sure you want to delete #{0}?',
    del: 'Delete',
    doDownload: 'Download project files?',
    download: 'Download project',
    reset: 'Reset (delete) project',
    doReset: 'Reset (delete) all files in project?',
    resetOptions: {
      clean: 'Clean template',
      full: 'Full demo',
    },
    doneShare: 'Sharable URL has been copied to clipboard',
    share: 'Share project',
    shareTitle: 'Share settings',
    shareCopy: 'Copy to clipboard',
    shareOptions: {
      output: 'Output',
      code: 'Code',
      outputPreview: 'Preview',
      outputJs: 'JS',
      outputCss: 'CSS',
      outputSSR: 'SSR',
      editorMonaco: 'Monaco',
      editorMirror: 'CodeMirror',
    },
    cdn: 'CDN',
    other: 'Other',
    loading: 'Loading #{0}...',
    format: 'Format code',
    theme: {
      dark: 'Use light mode',
      light: 'Use dark mode',
    },
    ssr: {
      on: 'Use Client mode',
      off: 'Use SSR mode',
    },
    prod: {
      on: 'Use DEV mode',
      off: 'Use PROD mode',
    },
    editor: {
      label: 'Editor',
      codemirror: 'CodeMirror',
      monaco: 'Monaco',
    },

    autoSave: {
      on: 'Auto save/update',
      off: 'Manual save/update (CTRL/META+S)',
    },
  },
};

type LanguageType = keyof typeof config;

let defaultLanguage = (
  typeof navigator !== 'undefined' ? navigator.language.split('-')[ 0 ] : 'en'
) as LanguageType;

if (!config[ defaultLanguage ]) {
  defaultLanguage = 'en';
}

export const locale = config[ defaultLanguage ];
