export const wholeOrFloat = (value: number) => {
  console.log(602 % 2);
  console.log(value % 2 === 0 ? value : value.toFixed(2), 'FLOATTTT');
  console.log(value % 2, 'mod');
  if (Number.isFinite(value) && !Number.isInteger(value)) {
    // If it's a float, return it with two decimal places
    return value.toFixed(2);
  } else {
    // If it's not a float (i.e., a whole number), return it as is
    return value;
  }
};
