import { Database } from '@/lib/database.types';
import { handleFirstPaidInvoiceForBirthControl } from './handleFirstPaidInvoiceForBirthControl';
import { handleFirstPaidInvoiceForED } from './handleFirstPaidInvoiceForED';
import { handleFirstPaidInvoiceForInsomnia } from './handleFirstPaidInvoiceForInsomnia';
import { handleFirstPaidInvoiceForFemaleHairLoss } from './handleFirstPaidInvoiceForFemaleHairLoss';
import { handleFirstPaidInvoiceForEnclomiphene } from '@/pages/api/supabase/invoice/_utils/handleFirstPaidInvoiceForEnclomiphene';
import { handleFirstPaidInvoiceForSexHair } from './handleFirstPaidInvoiceForSexHair';
import { handleFirstPaidInvoiceForMenopause } from './handleFirstPaidInvoiceForMenopause';
import { handleFirstPaidInvoiceForPrimaryCare } from '@/pages/api/supabase/invoice/_utils/handleFirstPaidInvoiceForPrimaryCare';
type Invoice = Database['public']['Tables']['invoice']['Row'];

export const handleFirstPaidInvoice = async (invoice: Invoice) => {
  await Promise.all([
    handleFirstPaidInvoiceForBirthControl(invoice),
    handleFirstPaidInvoiceForED(invoice),
    handleFirstPaidInvoiceForInsomnia(invoice),
    handleFirstPaidInvoiceForFemaleHairLoss(invoice),
    handleFirstPaidInvoiceForSexHair(invoice),
    handleFirstPaidInvoiceForEnclomiphene(invoice),
    handleFirstPaidInvoiceForMenopause(invoice),
    handleFirstPaidInvoiceForPrimaryCare(invoice),
  ]);
};
