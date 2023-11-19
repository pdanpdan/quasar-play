const config = {
  en: {
    cancel: 'Cancel',
    close: 'Close settings panel',
    doDelete: 'Are you sure you want to delete #{0}?',
    del: 'Delete',
    doDownload: 'Download project files?',
    download: 'Download project',
    doReset: 'Reset (delete) all files in project?',
    reset: 'Reset (delete) project',
    doneShare: 'Sharable URL has been copied to clipboard',
    share: 'Copy link',
    cdn: 'Change CDN',
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
  },
};

type Language = keyof typeof config;

let defaultLanguage = (
  typeof navigator !== 'undefined' ? navigator.language.split( '-' )[ 0 ] : 'en'
) as Language;

if ( !config[ defaultLanguage ] ) {
  defaultLanguage = 'en';
}

export const locale = config[ defaultLanguage ];
