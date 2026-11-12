// A short tick on Android; iOS Safari has no Vibration API, so it does nothing there.
export function haptic(): void {
  navigator.vibrate?.(10);
}
