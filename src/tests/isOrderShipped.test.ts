jest.mock('date-fns', () => {
  const actual = jest.requireActual('date-fns');
  return {
    ...actual,
    isAfter: jest.fn(),
  };
});

import { plus10days, isOrderShipped } from '@/utils/isOrderShipped';
import { isAfter } from 'date-fns';
import { OrderPrescriptionProps } from '../components/hooks/data';

const isAfterMock = isAfter as jest.Mock;

describe('plus10days', () => {
  it('should add 10 days to the given date', () => {
    const expectedDate = new Date('2020-01-11');
    const actualDate = plus10days('2020-01-01');
    expect(actualDate).toEqual(expectedDate);
  });
});

describe('isOrderShipped', () => {
  let mockDateNow: jest.SpyInstance<number, []>;

  beforeAll(() => {
    // Fix the current date to January 15, 2020
    mockDateNow = jest
      .spyOn(global.Date, 'now')
      .mockReturnValue(new Date('2020-01-15').valueOf());
  });

  afterEach(() => {
    jest.resetAllMocks();

    mockDateNow.mockReturnValue(new Date('2020-01-15').valueOf());
  });

  afterAll(() => {
    mockDateNow.mockRestore();
  });

  it('should return false if pharmacy is in Hallandale but order is not 10 days past created date', () => {
    const order = {
      created_at: '2020-01-10',
      prescription: {
        pharmacy: 'Hallandale',
      },
    } as unknown as OrderPrescriptionProps;
    isAfterMock.mockReturnValue(false);
    expect(isOrderShipped(order)).toBeFalsy();
  });

  it('should return true if pharmacy is in Hallandale and order is more than 10 days past created date', () => {
    mockDateNow.mockReturnValue(new Date('2020-01-25').valueOf());
    const order = {
      created_at: '2020-01-01',
      prescription: {
        pharmacy: 'Hallandale',
      },
    } as unknown as OrderPrescriptionProps;
    isAfterMock.mockReturnValue(true);
    expect(isOrderShipped(order)).toBeTruthy();
  });

  it('should return false if no tracking number and pharmacy is not specified or eligible', () => {
    const order = {
      created_at: '2020-01-01',
      prescription: {},
    } as unknown as OrderPrescriptionProps;
    expect(isOrderShipped(order)).toBeFalsy();
  });
});
