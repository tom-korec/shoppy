import { isIPv6 } from 'node:net';

const IPV4_MAPPED_PREFIX = '::ffff:';
const IPV6_PREFIX_GROUPS = 4;

// Anyone with IPv6 controls a whole /64, so limiting single addresses would be trivial to dodge.
export function clientIpKey(ip: string): string {
  if (ip.toLowerCase().startsWith(IPV4_MAPPED_PREFIX) && ip.includes('.')) {
    return ip.slice(IPV4_MAPPED_PREFIX.length);
  }
  if (!isIPv6(ip)) return ip;
  return `${expandIPv6(ip).slice(0, IPV6_PREFIX_GROUPS).join(':')}::/64`;
}

function expandIPv6(ip: string): string[] {
  const [head = '', tail] = ip.toLowerCase().split('::');
  const headGroups = head ? head.split(':') : [];
  const tailGroups = tail ? tail.split(':') : [];
  const missing = 8 - headGroups.length - tailGroups.length;
  return [...headGroups, ...Array<string>(missing).fill('0'), ...tailGroups].map((group) =>
    group.replace(/^0+(?=.)/, ''),
  );
}
