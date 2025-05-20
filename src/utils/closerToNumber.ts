export function closerToNumber(number: number, value1 = 4, value2 = 12) {
  const difference1 = Math.abs(number - value1);
  const difference2 = Math.abs(number - value2);
  if (difference1 < difference2) {
    return value1;
  } else if (difference2 < difference1) {
    return value2;
  } else {
    // If the differences are equal, you can decide how to handle that
    // For simplicity, returning the first value in this case
    return value1;
  }
}
