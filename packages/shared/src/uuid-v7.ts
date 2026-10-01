let lastTimestamp = 0;

// RFC 9562 UUIDv7: ids sort by creation time, so entries added quickly in a row keep their order
// even when the requests reach the server out of order. Each id gets a later millisecond than the
// previous one from this device.
export function uuidV7(now = Date.now()): string {
  const timestamp = Math.max(now, lastTimestamp + 1);
  lastTimestamp = timestamp;

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  for (let index = 0; index < 6; index += 1) {
    bytes[index] = Math.floor(timestamp / 2 ** (8 * (5 - index))) & 0xff;
  }
  bytes[6] = 0x70 | ((bytes[6] ?? 0) & 0x0f);
  bytes[8] = 0x80 | ((bytes[8] ?? 0) & 0x3f);

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
