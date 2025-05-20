export type MedicationPayload = {
  medication_dosage:
    | {
        medication_quantity:
          | {
              price: number;
              id: number;
            }[]
          | null;
      }[]
    | null;
} | null;
