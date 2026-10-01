const BROWSERS: [RegExp, string][] = [
  [/EdgA?\//, 'Edge'],
  [/SamsungBrowser\//, 'Samsung Internet'],
  [/Firefox\/|FxiOS\//, 'Firefox'],
  [/Chrome\/|CriOS\//, 'Chrome'],
  [/Safari\//, 'Safari'],
];

const SYSTEMS: [RegExp, string][] = [
  [/iPhone/, 'iPhone'],
  [/iPad/, 'iPad'],
  [/Android/, 'Android'],
  [/Mac OS X|Macintosh/, 'macOS'],
  [/Windows/, 'Windows'],
  [/Linux/, 'Linux'],
];

const match = (rules: [RegExp, string][], userAgent: string) =>
  rules.find(([pattern]) => pattern.test(userAgent))?.[1];

export function describeUserAgent(userAgent: string | null): string {
  if (!userAgent) return 'Unknown device';

  const browser = match(BROWSERS, userAgent);
  const system = match(SYSTEMS, userAgent);
  if (browser && system) return `${browser} on ${system}`;
  return browser ?? system ?? 'Unknown device';
}
