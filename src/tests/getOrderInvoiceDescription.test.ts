import {
  getOrderInvoiceDescription,
  getOrderInvoiceProduct,
} from '@/utils/getOrderInvoiceDescription';

describe('getOrderInvoiceDescription', () => {
  it('should return description for Hair loss medication', () => {
    expect(getOrderInvoiceDescription('Hair loss', 'Generic', 0, 1)).toEqual(
      'Generic Hair loss medication'
    );
  });

  it('should return description for Erectile dysfunction medication', () => {
    expect(
      getOrderInvoiceDescription('Erectile dysfunction', 'Generic', 0, 3)
    ).toEqual('Generic Quarterly ED medication');
  });

  it('should provide different Birth control subscription descriptions based on the dispense quantity', () => {
    expect(getOrderInvoiceDescription('Birth control', 'Pill', 0, 12)).toEqual(
      'Annual Birth Control Subscription'
    );
    expect(getOrderInvoiceDescription('Birth control', 'Pill', 0, 6)).toEqual(
      'First Semi-annual Birth Control Subscription'
    );
    expect(getOrderInvoiceDescription('Birth control', 'Pill', 2, 3)).toEqual(
      'Third Quarter Birth Control Subscription'
    );
    expect(getOrderInvoiceDescription('Birth control', 'Pill', 6, 1)).toEqual(
      'First Quarter Birth Control Subscription'
    );
  });

  it('should handle default case', () => {
    expect(getOrderInvoiceDescription('Skin care', 'Lotion', 0, 1)).toEqual(
      'Payment for Lotion'
    );
    expect(getOrderInvoiceDescription('Skin care', '', 0, 1)).toEqual(
      'Payment for medication'
    );
  });
});

describe('getOrderInvoiceProduct', () => {
  it('should return product for Hair loss', () => {
    expect(getOrderInvoiceProduct('Hair loss', 1)).toEqual(
      'Hair Loss Quarterly Medication'
    );
  });

  it('should return product for Erectile dysfunction', () => {
    expect(getOrderInvoiceProduct('Erectile dysfunction', 3)).toEqual(
      'Erectile Dysfunction Quarterly Medication'
    );
  });

  it('should give correct product description for Birth control based on dispense quantity', () => {
    expect(getOrderInvoiceProduct('Birth control', 12)).toEqual(
      'Birth Control Annual Subscription'
    );
    expect(getOrderInvoiceProduct('Birth control', 6)).toEqual(
      'Birth Control Semi-annual Subscription'
    );
    expect(getOrderInvoiceProduct('Birth control', 3)).toEqual(
      'Birth Control Quarterly Subscription'
    );
    expect(getOrderInvoiceProduct('Birth control', 1)).toEqual(
      'Birth Control Subscription'
    );
  });

  it('should handle default case', () => {
    expect(getOrderInvoiceProduct('General', 1)).toEqual('Zealthy Product');
  });
});
