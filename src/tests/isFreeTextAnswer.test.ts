import { isFreeTextAnswer } from '@/utils/isFreeTextAnswer';

describe('isFreeTextAnswer', () => {
  test('should return true if answer is a FreeTextAnswer array', () => {
    const answers = [{ valueString: 'Test' }];
    expect(isFreeTextAnswer(answers)).toBeTruthy();
  });

  test('should return false if answer is a CodedAnswer array', () => {
    const answers = [
      {
        valueCoding: {
          display: 'Yes',
          code: '123',
        },
      },
    ];
    expect(isFreeTextAnswer(answers)).toBeFalsy();
  });
});
