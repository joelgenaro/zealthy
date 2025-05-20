export type LookUpResponse = {
  data: {
    lookup: [
      {
        id: number;
        insuranceName: string;
        payerId: string;
        weight: number;
        isNirvanaSupported: boolean;
        isCoverageSupported: boolean;
        isAssignmentOfBenefitsSupported: boolean;
        updatedAt: number;
        createdAt: number;
      }
    ];
  };
  code: number;
  error: Error | null;
};

export const floridaBlue: LookUpResponse = {
  data: {
    lookup: [
      {
        id: 569,
        insuranceName: 'Florida Blue',
        payerId: '62308',
        weight: -25,
        isNirvanaSupported: true,
        isCoverageSupported: true,
        isAssignmentOfBenefitsSupported: false,
        updatedAt: 1660164644000,
        createdAt: 1660164644000,
      },
    ],
  },
  code: 200,
  error: null,
};

export const empire: LookUpResponse = {
  data: {
    lookup: [
      {
        id: 819,
        insuranceName: 'Blue Cross Blue Shield of New York (Empire)',
        payerId: '62308',
        weight: -43,
        isNirvanaSupported: true,
        isCoverageSupported: true,
        isAssignmentOfBenefitsSupported: false,
        updatedAt: 1664379760000,
        createdAt: 1664379760000,
      },
    ],
  },
  code: 200,
  error: null,
};

export const anthemNevada: LookUpResponse = {
  data: {
    lookup: [
      {
        id: 815,
        insuranceName: 'Anthem of Nevada',
        payerId: '87726',
        weight: -16,
        isNirvanaSupported: true,
        isCoverageSupported: true,
        isAssignmentOfBenefitsSupported: false,
        updatedAt: 1644267916000,
        createdAt: 1644267916000,
      },
    ],
  },
  code: 200,
  error: null,
};
