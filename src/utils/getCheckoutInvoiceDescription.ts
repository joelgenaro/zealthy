export const getCheckoutInvoiceDescription = (
  care: string,
  potentialInsurance: string,
  medicationName: string = '',
  coachName: string = ''
) => {
  switch (care) {
    case 'Weight loss':
      switch (potentialInsurance) {
        case 'Medicaid Access Florida':
          return 'First Month Medicaid Florida Weight Loss Membership';
        case 'Medicare Access Florida':
          return 'First Month Medicare Florida Weight Loss Membership';
        case 'TX':
          return 'First Month Texas Weight Loss Membership';
        case 'Semaglutide Bundled':
          return 'First Month Semaglutide Membership';
        case 'Tirzepatide Bundled':
          return 'First Month Tirzepatide + Doctor Membership';

        case 'Zealthy 3-Month Weight Loss':
          return 'Zealthy 3-Month Weight Loss';

        case 'Zealthy 6-Month Weight Loss':
          return 'Zealthy 6-Month Weight Loss';

        case 'Zealthy 12-Month Weight Loss':
          return 'Zealthy 12-Month Weight Loss';

        default:
          return 'First Month Weight Loss Membership';
      }
    case 'Weight Loss Free Consult':
      switch (coachName) {
        case 'Zealthy Weight Loss Membership':
          return 'First Month Free Consult Membership';
      }
      switch (medicationName) {
        case '3 Month Semaglutide Jumpstart':
          return '3 Month Semaglutide Jumpstart';
        case '3 Month Tirzepatide Jumpstart':
          return '3 Month Tirzepatide Jumpstart';
        default:
          return 'Free Consult First Month Membership';
      }
    case 'Anxiety or depression':
      return 'First Month Personalized Psychiatry Membership';
    case 'Hair loss':
      return 'First Month Hair Loss Membership';
    case 'Erectile dysfunction':
      return 'First Month Erectile Dysfunction Membership';
    case 'Birth control':
      return 'First Month Birth Control Membership';
    case 'Primary care':
      return 'Primary Care Zealthy Access Fee';
    case 'Enclomiphene':
      return 'Enclomiphene Lab Kit';
    case 'Prep':
      return '30 day Truvada Prescription';
    case 'Menopause':
      return 'Menopause Consult';
    default:
      return 'First Month Membership';
  }
};

export const getCheckoutInvoiceProduct = (
  care: string,
  potentialInsurance: string
) => {
  switch (care) {
    case 'Weight loss':
      switch (potentialInsurance) {
        case 'Medicaid Access Florida':
          return 'Weight Loss Medicaid Access Florida';
        case 'Medicare Access Florida':
          return 'Weight Loss Medicare Access Florida';
        case 'TX':
          return 'Weight Loss Texas';
        case 'Semaglutide Bundled':
          return 'Weight Loss Semaglutide Bundled';
        case 'Semaglutide Bundled Oral Pills':
          return 'Weight Loss Oral Semaglutide Bundled Pill';
        case 'Tirzepatide Bundled':
          return 'Weight Loss Tirzepatide Bundled';
        default:
          return 'Weight Loss';
      }
    case 'Anxiety or depression':
      return 'Personalized Psychiatry';
    case 'Hair loss':
      return 'Hair Loss Quarterly Medication';
    case 'Menopause':
      return 'Menopause';
    case 'Erectile dysfunction':
      return 'Erectile Dysfunction Quarterly Medication';
    case 'Birth control':
      return 'Birth Control Subscription';
    case 'Primary care':
      if (potentialInsurance) {
        return 'Primary Care Insurance Accepted';
      }
      return 'Primary Care';
    case 'Enclomiphene':
      return 'Enclomiphene';
    case 'Prep':
      return 'Truvada';
    default:
      return 'Zealthy Product';
  }
};
