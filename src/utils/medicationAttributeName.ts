export default function medicationAttributeName(
  medicationName: string,
  specificCare?: string | any
) {
  let medicationAttributeName: string = '';

  if (medicationName === 'Zealthy Weight Loss + Tirzepatide Program') {
    medicationAttributeName = 'Tirzepatide Bundled';
  } else if (medicationName === 'Zealthy Weight Loss + Semaglutide Program') {
    medicationAttributeName = 'Semaglutide Bundled';
  } else if (medicationName === 'Semaglutide weekly injections') {
    medicationAttributeName = 'Semaglutide';
  } else if (medicationName === 'Tirzepatide weekly injections') {
    medicationAttributeName = 'Tirzepatide';
  } else if (
    medicationName?.includes('Semaglutide weekly injections NOT BUNDLED')
  ) {
    medicationAttributeName = 'Semaglutide';
  } else if (
    medicationName?.includes('Tirzepatide weekly injections NOT BUNDLED')
  ) {
    medicationAttributeName = 'Tirzepatide';
  } else if (
    medicationName?.includes('Tirzepatide weekly injections BUNDLED')
  ) {
    medicationAttributeName = 'Tirzepatide Bundled';
  } else if (
    medicationName?.includes('Semaglutide weekly injections BUNDLED')
  ) {
    medicationAttributeName = 'Semaglutide Bundled';
  } else if (specificCare === 'Hair Loss') {
    medicationAttributeName = medicationName;
  } else {
    medicationAttributeName = medicationName || specificCare;
  }

  return medicationAttributeName;
}
