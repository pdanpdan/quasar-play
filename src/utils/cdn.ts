import { ref } from 'vue';

const cdnStoreKey = 'quasar-play-prefer-cdn';
export const cdn = ref(localStorage.getItem(cdnStoreKey) || 'unpkg');

export const cdnTemplates: Record<string, string> = {
  unpkg: 'https://unpkg.com/{pkg}{version}/{path}',
  jsdelivr: 'https://fastly.jsdelivr.net/npm/{pkg}{version}/{path}',
  elemecdn: 'https://npm.elemecdn.com/{pkg}{version}/{path}',
};

export function setCdn(name: string) {
  cdn.value = name;
  localStorage.setItem(cdnStoreKey, cdn.value);
}

export function getCdnUrl(pkg: string, path: string, version?: string) {
  const template = cdnTemplates[ cdn.value ];

  return template.replace('{pkg}', pkg).replace('{version}', typeof version === 'string' && version.trim().length > 0 ? `@${ version.trim() }` : '').replace('{path}', path);
}
