import { isPOBox } from '@/utils/isPOBox';

describe('isPOBox', () => {
  it('returns true for a standard PO Box format', () => {
    expect(isPOBox('PO Box 123')).toBe(true);
  });

  it('returns true for variations of spaces and periods in PO Box', () => {
    expect(isPOBox('P. O. Box 234')).toBe(true);
    expect(isPOBox('P.O.Box 345')).toBe(true);
    expect(isPOBox('P O Box 456')).toBe(true);
  });

  it('returns true for "Post Office Box" format', () => {
    expect(isPOBox('Post Office Box 567')).toBe(true);
  });

  it('returns false for addresses that do not contain PO Box', () => {
    expect(isPOBox('123 Main St')).toBe(false);
    expect(isPOBox('Box 123')).toBe(false);
    expect(isPOBox('Office Box 789')).toBe(false);
  });

  it('ignores case in matching', () => {
    expect(isPOBox('po box 789')).toBe(true);
    expect(isPOBox('POST OFFICE BOX 890')).toBe(true);
  });
});
