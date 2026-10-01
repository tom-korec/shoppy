import { clientIpKey } from './client-ip-key.js';

describe('clientIpKey', () => {
  it('keeps an IPv4 address', () => {
    expect(clientIpKey('203.0.113.7')).toBe('203.0.113.7');
  });

  it('unwraps an IPv4-mapped IPv6 address', () => {
    expect(clientIpKey('::ffff:203.0.113.7')).toBe('203.0.113.7');
  });

  it('groups IPv6 addresses by their /64 prefix', () => {
    expect(clientIpKey('2001:db8:aa:bb:1:2:3:4')).toBe(clientIpKey('2001:0db8:00aa:00bb::ffff'));
    expect(clientIpKey('2001:db8:aa:bb::1')).toBe('2001:db8:aa:bb::/64');
  });

  it('separates different /64 prefixes', () => {
    expect(clientIpKey('2001:db8:aa:bb::1')).not.toBe(clientIpKey('2001:db8:aa:bc::1'));
  });

  it('expands a compressed prefix', () => {
    expect(clientIpKey('2001:db8::1')).toBe('2001:db8:0:0::/64');
  });
});
