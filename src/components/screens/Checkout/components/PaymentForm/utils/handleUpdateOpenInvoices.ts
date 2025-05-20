export const handleUpdateOpenInvoices = async (
  supabase: any,
  patientId: number
) => {
  try {
    const { data, error } = await supabase
      .from('invoice')
      .update({ status: 'void' })
      .eq('amount_due', 39)
      .eq('status', 'open')
      .eq('patient_id', patientId);

    if (error) {
      throw new Error(error.message);
    }
    return data;
  } catch (err) {
    throw new Error('Error updating open invoices', err || '');
  }
};
