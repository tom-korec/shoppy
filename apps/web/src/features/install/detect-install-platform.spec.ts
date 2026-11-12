import { detectInstallPlatform } from './detect-install-platform';

function fakeWindow(userAgent: string, { isStandalone = false, maxTouchPoints = 0 } = {}): Window {
  return {
    matchMedia: () => ({ matches: isStandalone }),
    navigator: { userAgent, maxTouchPoints },
  } as unknown as Window;
}

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15';
const IPAD = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15';
const ANDROID = 'Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36 Chrome/140.0';

describe('detectInstallPlatform', () => {
  it('detects an iPhone', () => {
    expect(detectInstallPlatform(fakeWindow(IPHONE))).toBe('ios');
  });

  it('detects an iPad that reports itself as a Mac', () => {
    expect(detectInstallPlatform(fakeWindow(IPAD, { maxTouchPoints: 5 }))).toBe('ios');
  });

  it('treats a Mac without touch as another platform', () => {
    expect(detectInstallPlatform(fakeWindow(IPAD))).toBe('other');
  });

  it('treats Android as another platform', () => {
    expect(detectInstallPlatform(fakeWindow(ANDROID))).toBe('other');
  });

  it('knows when the app already runs installed', () => {
    expect(detectInstallPlatform(fakeWindow(IPHONE, { isStandalone: true }))).toBe('installed');
  });
});
