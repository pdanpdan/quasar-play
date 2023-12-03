# Quasar Playground

Quasar Playground is a Vue SFC playground based on `@pdanpdan/vue-repl`.

You can test Quasar components online and export the final project.

Can be used with Quasar components and with VueRouter, VueI18n and Pinia.

Supports JS/TS.

[Play online here.](https://pdanpdan.github.io/quasar-play/)

## URL query params

There are some aspects of the REPL that can be configured from the URL (more than the Quasar/Vue/Typescript versions which are set from the interface):

- `preview` with no value or with a lower case converted value of `''`, `'true'`, `'t'`, or `'1'` will start the REPL with the `output` area as default when the size is small
- `previewMode` or `preview-mode` will select the preview tab displayed (one of `preview`, `js`, `css`, or `ssr`) - defaults to `preview`
- `editor` with a value of `codemirror` or `mirror` will use CodeMirror editor instead of Monaco (lighter on resources)
- `sfcOptions` or `sfc-options` with a JSON stringified object will be used as [`sfcOptions` for @pdanpdan/vue-repl](https://github.com/search?q=repo%3Avuejs%2Frepl%20sfcOptions&type=code)
- `previewOptions` or `preview-options` with a JSON stringified object will be used as [`previewOptions` for @pdanpdan/vue-repl](https://github.com/search?q=repo%3Avuejs%2Frepl+previewOptions&type=code)
- `prod` with no value or with a lower case converted value of `''`, `'true'`, `'t'`, or `'1'` will start the REPL with Vue in PROD mode
- `ssr` with no value or with a lower case converted value of `''`, `'true'`, `'t'`, or `'1'` will start the REPL with Vue in SSR mode
- `file` will set a specific file active
