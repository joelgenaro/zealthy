import getPostCheckoutLinks from './getPostCheckoutLinks';

describe.skip('postCheckoutLinks', () => {
  it('should only return links without condition', () => {
    const links = getPostCheckoutLinks({});

    expect(links).equal([
      '/checkout/success',
      '/post-checkout/identity-verification',
      '/patient-portal',
    ]);
  });

  describe('sync visit, scheduled appointment, cash', () => {
    const props = {
      visit: {
        isSync: true,
      },
      appointment: {
        isScheduled: true,
        isConfirmed: true,
      },
      paymentMethod: {
        isCash: true,
      },
    };
    it('should return all link for sync visit', () => {
      const links = getPostCheckoutLinks({ ...props });

      expect(links).equal([
        '/checkout/success',
        '/post-checkout/select-visit-type',
        '/post-checkout/visit-confirmation',
        '/post-checkout/select-pharmacy',
        '/post-checkout/medical-history',
        '/post-checkout/concerning-symptoms',
        '/post-checkout/intakes',
        '/post-checkout/identity-verification',
        '/post-checkout/delivery-address',
        '/post-checkout/addon',
        '/post-checkout/schedule-coach',
        '/patient-portal',
      ]);
    });
    it('should not return visit select type link, for insurance visits', () => {
      const links = getPostCheckoutLinks({
        ...props,
        paymentMethod: {
          isINInsurance: true,
        },
      });

      const selectVisitTypeLink = links.find(
        link => link === '/post-checkout/select-visit-type'
      );

      expect(selectVisitTypeLink).equal(undefined);
    });
    it('should return schedule visit link, for rejected appointments', () => {
      const links = getPostCheckoutLinks({
        ...props,
        appointment: {
          isRejected: true,
        },
      });

      const selectVisitTypeLink = links.find(
        link => link === '/post-checkout/schedule-visit'
      );

      expect(selectVisitTypeLink).equal('/post-checkout/schedule-visit');
    });
  });
});
