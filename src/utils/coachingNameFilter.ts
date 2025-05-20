const filters = ['(Texas)'];

function coachingNameFilter(medName: string) {
  let name = medName;
  if (name) {
    filters.forEach(filter => {
      name = name.replace(filter, '');
    });
  }
  return name;
}

export default coachingNameFilter;
