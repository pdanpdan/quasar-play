// only for TS checking
// will be replaced by the real file on download
import type { App } from 'vue';

export default function ( { app }: { app: App; } ) {
  // function is awaited before continue
  if ( app ) {
    // use app before mount
  }
}
