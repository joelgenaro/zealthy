export const getOrderInvoiceDescription = (
  care: string,
  medication: string,
  refillCount: number,
  dispenseQuantity: number
) => {
  switch (care) {
    case 'Hair loss':
      return medication + ' Hair loss medication';
    case 'Erectile dysfunction':
      return medication + ' Quarterly ED medication';
    case 'Birth control':
      if (dispenseQuantity === 12) {
        return 'Annual Birth Control Subscription';
      } else if (dispenseQuantity === 6) {
        return `${
          refillCount === 0 ? 'First' : refillCount === 1 ? 'Second' : 'Third'
        } Semi-annual Birth Control Subscription`;
      } else if (dispenseQuantity === 3) {
        return `${
          refillCount === 0
            ? 'First'
            : refillCount === 1
            ? 'Second'
            : refillCount === 2
            ? 'Third'
            : refillCount === 3
            ? 'Fourth'
            : refillCount === 4
            ? 'Fifth'
            : 'Sixth'
        } Quarter Birth Control Subscription`;
      } else {
        return 'First Quarter Birth Control Subscription';
      }
    default:
      return 'Payment for ' + (medication || 'medication');
  }
};

export const getOrderInvoiceProduct = (
  care: string,
  dispenseQuantity: number
) => {
  switch (care) {
    case 'Hair loss':
      return 'Hair Loss Quarterly Medication';
    case 'Erectile dysfunction':
      return 'Erectile Dysfunction Quarterly Medication';
    case 'Menopause':
      return 'Menopause Quarterly Medication Subscription';
    case 'Birth control':
      if (dispenseQuantity === 12) {
        return 'Birth Control Annual Subscription';
      } else if (dispenseQuantity === 6) {
        return 'Birth Control Semi-annual Subscription';
      } else if (dispenseQuantity === 3) {
        return 'Birth Control Quarterly Subscription';
      } else {
        return 'Birth Control Subscription';
      }
    case 'Enclomiphene':
      if (dispenseQuantity === 12) {
        return 'Enclomiphene Annual Subscription';
      } else if (dispenseQuantity === 3) {
        return 'Enclomiphene Quarterly Subscription';
      } else {
        return 'Enclomiphene Subscription';
      }
    default:
      return 'Zealthy Product';
  }
};
