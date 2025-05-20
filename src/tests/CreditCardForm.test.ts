import { paymentVerify } from '@/components/shared/CreditCardForm/CreditCardForm';

describe('paymentVerify', () => {
  it('should return false if paymentInfo is null', () => {
    expect(paymentVerify(null)).toBe(false);
  });

  it('should return false if any required field is missing', () => {
    const incompletePaymentInfo = {
      cardHolderName: 'John Doe',
      cardNumber: '1234567890123456',
      cvv: '123',
      expiration: '',
      zip: '12345',
    };
    expect(paymentVerify(incompletePaymentInfo)).toBe(false);
  });

  it('should return true if all required fields are provided', () => {
    const completePaymentInfo = {
      cardHolderName: 'John Doe',
      cardNumber: '1234567890123456',
      cvv: '123',
      expiration: '12/23',
      zip: '12345',
    };
    expect(paymentVerify(completePaymentInfo)).toBe(true);
  });
});
