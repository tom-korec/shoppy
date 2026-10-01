import {
  createAppleSplashScreens,
  defineConfig,
  minimal2023Preset,
} from '@vite-pwa/assets-generator/config';

const BRAND = '#059669';

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: BRAND } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: BRAND } },
    appleSplashScreens: createAppleSplashScreens(
      {
        padding: 0.4,
        resizeOptions: { background: BRAND },
        linkMediaOptions: { log: false, addMediaScreen: true, basePath: '/', xhtml: false },
        // The default name differs between generated files and <link> tags (`-light-` suffix); keep one scheme.
        name: (landscape, size) =>
          `apple-splash-${landscape ? 'landscape' : 'portrait'}-${size.width}x${size.height}.png`,
      },
      ['iPhone 6', 'iPhone X', 'iPhone 14 Pro', 'iPhone 16 Pro Max'],
    ),
  },
  images: ['public/logo.svg'],
});
