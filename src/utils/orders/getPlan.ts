export function getPlan(
  medRequested: string | null,
  currentPeriodLength: number,
  semBundle: boolean,
  tirzBundle: boolean
) {
  if (medRequested && (semBundle || tirzBundle)) {
    if (currentPeriodLength >= 2) {
      return medRequested === 'Semaglutide'
        ? 'semaglutide_multi_month'
        : 'tirzepatide_multi_month';
    }
    if (currentPeriodLength < 2) {
      return medRequested === 'Semaglutide'
        ? 'semaglutide_monthly'
        : 'tirzepatide_monthly';
    }
  }
  if (semBundle && currentPeriodLength >= 2) {
    return 'semaglutide_multi_month';
  }
  if (semBundle && currentPeriodLength < 2) {
    return 'semaglutide_monthly';
  }
  if (tirzBundle && currentPeriodLength >= 2) {
    return 'tirzepatide_multi_month';
  }
  if (tirzBundle && currentPeriodLength < 2) {
    return 'tirzepatide_monthly';
  }

  if (
    !semBundle &&
    !tirzBundle &&
    medRequested === 'Semaglutide' &&
    currentPeriodLength >= 2
  ) {
    return 'semaglutide_multi_month';
  }
  if (
    !semBundle &&
    !tirzBundle &&
    medRequested === 'Semaglutide' &&
    currentPeriodLength < 2
  ) {
    return 'semaglutide_monthly';
  }
  if (
    !semBundle &&
    !tirzBundle &&
    medRequested === 'Tirzepatide' &&
    currentPeriodLength >= 2
  ) {
    return 'tirzepatide_multi_month';
  }
  if (
    !semBundle &&
    !tirzBundle &&
    medRequested === 'Tirzepatide' &&
    currentPeriodLength < 2
  ) {
    return 'tirzepatide_monthly';
  }
  return 'No Plan';
}
