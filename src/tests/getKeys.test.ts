import { getKeys } from '@/utils/getKeys';

describe('getKeys', () => {
  it('returns an array of keys for the given object', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const expectedKeys = ['a', 'b', 'c'];
    expect(getKeys(obj)).toEqual(expectedKeys);
  });

  it('returns an empty array for an empty object', () => {
    const obj = {};
    expect(getKeys(obj)).toEqual([]);
  });

  it('works with objects that have various types of values', () => {
    const obj = { a: 1, b: 'string', c: true, d: null };
    const expectedKeys = ['a', 'b', 'c', 'd'];
    expect(getKeys(obj)).toEqual(expectedKeys);
  });

  it('does not include keys from the prototype chain', () => {
    const proto = { a: 1 };
    const obj = Object.create(proto);
    obj.b = 2;
    obj.c = 3;
    expect(getKeys(obj)).toEqual(['b', 'c']);
  });
});
