import {
  ICareSelection,
  CareSelectionType,
  CareSelectionCategory,
} from '@/types/careSelection';

export const maleSelections: ICareSelection[] = [
  {
    id: 1,
    name: 'Primary care',
    price: 50,
    type: CareSelectionType.PRIMARY_CARE,
    categories: [CareSelectionCategory.VISIT],
  },
  {
    id: 2,
    name: 'Cold or flu-like symptoms',
    price: 50,
    type: CareSelectionType.PRIMARY_CARE,
    categories: [CareSelectionCategory.VISIT],
  },
  {
    id: 5,
    name: 'Hair loss',
    price: 30,
    type: CareSelectionType.HAIR_LOSS,
    categories: [CareSelectionCategory.PRODUCT],
  },
  {
    id: 6,
    name: 'Erectile dysfunction',
    price: 100,
    type: CareSelectionType.ERECTILE_DYSFUNCTION,
    categories: [CareSelectionCategory.PRODUCT],
  },
  {
    id: 8,
    name: 'Weight loss',
    price: 70,
    type: CareSelectionType.NUTRITION,
    categories: [CareSelectionCategory.PRODUCT],
  },
  {
    id: 9,
    name: 'Anxiety or depression',
    price: 50,
    type: CareSelectionType.PRIMARY_CARE,
    categories: [CareSelectionCategory.VISIT],
  },
  {
    id: 10,
    name: "I'm not sure",
    price: 50,
    type: CareSelectionType.PRIMARY_CARE,
    categories: [CareSelectionCategory.VISIT],
  },
  {
    id: 11,
    name: 'Other',
    price: 50,
    type: CareSelectionType.PRIMARY_CARE,
    categories: [CareSelectionCategory.VISIT],
  },
];

export const femaleSelections: ICareSelection[] = [
  {
    id: 1,
    name: 'Primary care',
    price: 50,
    type: CareSelectionType.PRIMARY_CARE,
    categories: [CareSelectionCategory.VISIT],
  },
  {
    id: 2,
    name: 'Cold or flu-like symptoms',
    price: 50,
    type: CareSelectionType.PRIMARY_CARE,
    categories: [CareSelectionCategory.VISIT],
  },
  {
    id: 7,
    name: 'Birth control',
    price: 60,
    type: CareSelectionType.BIRTH_CONTROL,
    categories: [CareSelectionCategory.PRODUCT],
  },
  {
    id: 8,
    name: 'Weight loss',
    price: 70,
    type: CareSelectionType.NUTRITION,
    categories: [CareSelectionCategory.PRODUCT],
  },
  {
    id: 9,
    name: 'Anxiety or depression',
    price: 50,
    type: CareSelectionType.PRIMARY_CARE,
    categories: [CareSelectionCategory.VISIT],
  },
  {
    id: 10,
    name: "I'm not sure",
    price: 50,
    type: CareSelectionType.PRIMARY_CARE,
    categories: [CareSelectionCategory.VISIT],
  },
  {
    id: 11,
    name: 'Other',
    price: 50,
    type: CareSelectionType.PRIMARY_CARE,
    categories: [CareSelectionCategory.VISIT],
  },
];
