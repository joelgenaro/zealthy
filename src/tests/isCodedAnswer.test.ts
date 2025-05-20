import { isCodedAnswer } from '@/utils/isCodedAnswer';

describe('Answer Utils', () => {
  describe('isCodedAnswer function', () => {
    it('should return true if answer is CodedAnswer[]', () => {
      const codedAnswers = [
        { valueCoding: { code: '001', display: 'Positive' } },
      ];
      expect(isCodedAnswer(codedAnswers)).toBe(true);
    });

    it('should return false if answer is FreeTextAnswer[]', () => {
      const freeTextAnswers = [{ valueString: 'Positive' }];
      expect(isCodedAnswer(freeTextAnswers)).toBe(false);
    });
  });
});
