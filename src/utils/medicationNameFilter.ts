const filters = ['(pulmonary hypertension)'];

function medicationNameFilter(medName: string) {
  let name = medName;
  if (name) {
    filters.forEach(filter => {
      name = name.replace(filter, '');
    });
  }
  return name;
}

export default medicationNameFilter;
