import { PharmacyInfo } from '@/types/pharmacy';

const pharmacies: PharmacyInfo[] = [
  {
    name: 'VH Pharmacy - Miami Pharmacy',
    address: {
      street: '1000 SW 1st St',
      city: 'Miami',
      state: 'FL',
      zip: '33130',
    },
    phone: '+1 305-324-8777',
  },
  {
    name: 'Walgreens Pharmacy',
    address: {
      street: '200 SW 13th St',
      city: 'Miami',
      state: 'FL',
      zip: '33130',
    },
    phone: '+1 305-854-6340',
  },
  {
    name: 'Midtown Pharmacy of Miami Beach',
    address: {
      street: '753 Arthur Godfrey Rd',
      city: 'Miami Beach',
      state: 'FL',
      zip: '33140',
    },
    phone: '+1 305-531-5816',
  },
  {
    name: 'CVS Pharmacy',
    address: {
      street: '555 Washington Ave',
      city: 'Miami Beach',
      state: 'FL',
      zip: '33139',
    },
    phone: '+1 305-673-4149',
  },
  {
    name: 'Pure Pharmacy',
    address: {
      street: '959 West Ave',
      unit: '#7',
      city: 'Miami Beach',
      state: 'FL',
      zip: '33139',
    },
    phone: '+1 305-532-1300',
  },
];

export default pharmacies;
