export interface IPrescription {
  id: number;
  product_name: string;
  quantity: number;
  refills: number;
  schedule: string;
  status: string;
  unit: string;
  price: number;
  currency: string;
  dosage: string;
}
