export function getClinicianAlias(id: number | null | undefined) {
  if (!id) return '';
  const aliases = ['Kelsey A.', 'Maria D.', 'Matt R.'];
  return aliases[id % 3] || '';
}

export function getClinicianAliasInitials(id: number | null | undefined) {
  if (!id) return '';
  const aliases = ['KA', 'MD', 'MR'];
  return aliases[id % 3] || '';
}
