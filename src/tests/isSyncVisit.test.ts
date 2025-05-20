import { isSyncVisit } from '@/utils/isSyncVisit';
import { ReasonForVisit } from '../context/AppContext/reducers/types/visit';

describe('isSyncVisit', () => {
  it('returns true if any careSelection is synchronous', () => {
    const careSelections = [
      { synchronous: false },
      { synchronous: true },
    ] as unknown as ReasonForVisit[];
    expect(isSyncVisit(careSelections)).toBe(true);
  });

  it('returns false if no careSelections are synchronous', () => {
    const careSelections = [
      { synchronous: false },
      { synchronous: false },
    ] as unknown as ReasonForVisit[];
    expect(isSyncVisit(careSelections)).toBe(false);
  });

  it('returns false for an empty array', () => {
    expect(isSyncVisit([])).toBe(false);
  });
});
