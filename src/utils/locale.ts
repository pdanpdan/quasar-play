const config = {
  en: {
    cancel: 'Cancel',
    doDelete: 'Are you sure you want to delete #{0}?',
    del: 'Delete',
    doDownload: 'Download project files?',
    download: 'Download project',
    doReset: 'Reset (delete) all files?',
    reset: 'Reset',
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
