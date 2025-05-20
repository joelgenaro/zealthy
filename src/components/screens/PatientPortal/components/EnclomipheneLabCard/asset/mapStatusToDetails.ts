type StatusDetails = {
  header: string;
  subheader: string;
  details: string[];
};

export const mapStatusToDetails: { [key: string]: StatusDetails } = {
  ORDERED: {
    header: 'Lab Kit Processing',
    subheader:
      'Your lab kit is processing! Below you can find instructions for how to complete your lab kit once it arrives.',
    details: [
      "Make sure to follow the instructions on the package, register your kit and ship it. The instructions will tell you to complete your labs and then ship it by scheduling pickup online or by phone with UPS, which you will be able to do from a QR code that you'll receive in your kit. The box should have the pre-printed label for UPS shipping.",
      'Results are typically available within 5 to 7 business days of the lab processing your sample. Your provider will review your results and be able to move forward, if appropriate, with a treatment plan. This will be after your lab results have been reviewed by a medical provider.',
    ],
  },
  inTransitToPatient: {
    header: 'Lab Kit Shipped',
    subheader:
      'Your lab kit has shipped! Below you can find instructions for how to complete your lab kit once it arrives.',
    details: [
      "Make sure to follow the instructions on the package, register your kit and ship it. The instructions will tell you to complete your labs and then ship it by scheduling pickup online or by phone with UPS, which you will be able to do from a QR code that you'll receive in your kit. The box should have the pre-printed label for UPS shipping.",
      'Results are typically available within 5 to 7 business days of the lab processing your sample. Your provider will review your results and be able to move forward, if appropriate, with a treatment plan. This will be after your lab results have been reviewed by a medical provider.',
    ],
  },
  IN_TRANSIT: {
    header: 'Lab Kit Shipped',
    subheader:
      'Your lab kit has shipped! Below you can find instructions for how to complete your lab kit once it arrives.',
    details: [
      "Make sure to follow the instructions on the package, register your kit and ship it. The instructions will tell you to complete your labs and then ship it by scheduling pickup online or by phone with UPS, which you will be able to do from a QR code that you'll receive in your kit. The box should have the pre-printed label for UPS shipping.",
      'Results are typically available within 5 to 7 business days of the lab processing your sample. Your provider will review your results and be able to move forward, if appropriate, with a treatment plan. This will be after your lab results have been reviewed by a medical provider.',
    ],
  },
  OUT_FOR_DELIVERY: {
    header: 'Lab Kit Shipped',
    subheader:
      'Your lab kit has shipped! Below you can find instructions for how to complete your lab kit once it arrives.',
    details: [
      "Make sure to follow the instructions on the package, register your kit and ship it. The instructions will tell you to complete your labs and then ship it by scheduling pickup online or by phone with UPS, which you will be able to do from a QR code that you'll receive in your kit. The box should have the pre-printed label for UPS shipping.",
      'Results are typically available within 5 to 7 business days of the lab processing your sample. Your provider will review your results and be able to move forward, if appropriate, with a treatment plan. This will be after your lab results have been reviewed by a medical provider.',
    ],
  },
  DELIVERED: {
    header: 'Lab Kit Delivered',
    subheader:
      'Your lab kit has arrived! Below you can find instructions for how to complete your lab kit.',
    details: [
      "Make sure to follow the instructions on the package, register your kit and ship it. The instructions will tell you to complete your labs and then ship it by scheduling pickup online or by phone with UPS, which you will be able to do from a QR code that you'll receive in your kit. The box should have the pre-printed label for UPS shipping.",
      'Results are typically available within 5 to 7 business days of the lab processing your sample. Your provider will review your results and be able to move forward, if appropriate, with a treatment plan. This will be after your lab results have been reviewed by a medical provider.',
    ],
  },
};
