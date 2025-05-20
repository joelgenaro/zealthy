export const calcBmiIndex = (height: number, weight: number) => {
  return Math.round((weight / height ** 2) * 703 * 10) / 10;
};

export function calcTargetWeight(heightInInches: number) {
  const heightInMeters = heightInInches * 0.0254;

  // Calculate target weight in Kg for BMI of 18.5
  const weightInKg = 18.5 * heightInMeters * heightInMeters;

  const weightInPounds = weightInKg * 2.20462;

  return Math.floor(weightInPounds);
}
