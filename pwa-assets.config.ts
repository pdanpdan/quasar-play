import {
  combinePresetAndAppleSplashScreens,
  defineConfig,
  minimal2023Preset,
} from '@vite-pwa/assets-generator/config';

export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: combinePresetAndAppleSplashScreens(minimal2023Preset, {
    darkResizeOptions: { background: '#1f1f1f', fit: 'contain' },
  }, [
    'iPad Pro 12.9"',
    'iPad Pro 11"',
    'iPad Pro 10.5"',
    'iPad Pro 9.7"',
    'iPad mini 7.9"',
    'iPad Air 10.5"',
    'iPad Air 9.7"',
    'iPad 10.2"',
    'iPad 9.7"',
    'iPhone 14 Pro Max',
    'iPhone 14 Pro',
    'iPhone 14 Plus',
    'iPhone 14',
    'iPhone 13 Pro Max',
    'iPhone 13 Pro',
    'iPhone 13',
    'iPhone 13 mini',
    'iPhone 12 Pro Max',
    'iPhone 12 Pro',
    'iPhone 12',
    'iPhone 12 mini',
    'iPhone 11 Pro Max',
    'iPhone 11 Pro',
    'iPhone 11',
    'iPhone X',
    'iPhone 8 Plus',
    'iPhone 8',
    'iPhone SE 4"',
  ]),
  images: [ 'public/logo-light.svg' ],
});
