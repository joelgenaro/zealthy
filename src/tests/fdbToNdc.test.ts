import { fdbToNdx } from '@/utils/fdbToNdc';

describe('fdbToNdx function', () => {
  it('should return the correct NDC for a given FDB code', () => {
    expect(fdbToNdx('474324')).toBe('31722077690');
    expect(fdbToNdx('205275')).toBe('31722070930');
    expect(fdbToNdx('170033')).toBe('31722071001');
    expect(fdbToNdx('207454')).toBe('31722071101');
  });

  it('should return undefined for an FDB code not present in the map', () => {
    expect(fdbToNdx('nonexistentcode')).toBeUndefined();
  });
});
