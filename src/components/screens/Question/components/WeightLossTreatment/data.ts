import getConfig from '../../../../../../config';

const siteName = getConfig(
  process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
).name;

export const medicationsNonCompound = [
  {
    brand: 'Wegovy',
    drug: 'Semaglutide',
    body1: `Wegovy (semaglutide) is a GLP-1 medication that was FDA-approved for weight loss in 2021. Among all GLP-1 medications, ${siteName} has experienced the highest rate of success getting prior authorizations for insurance to cover Wegovy, so it highly recommended for those with insurance.`,
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Wegovy will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Zepbound',
    drug: 'Tirzepatide',
    body1:
      'Zepbound (tirzepatide) is a GLP-1 medication that was FDA-approved for weight loss in 2023.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Zepbound will lose 25% of their body weight over a year.',
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutide',
    body1:
      'Semaglutide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2017. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Ozempic will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatide',
    body1:
      'Tirzapatide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2022. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Mounjaro will lose 20% of their body weight over a year.',
  },
  {
    brand: 'Saxenda',
    drug: 'Liraglutide',
    body1:
      'Liraglutide is a GLP-1 medication FDA-approved for weight loss in 2014.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Saxenda will lose 8% of their body weight over a year.',
  },
  {
    brand: 'Victoza',
    drug: 'Liraglutide',
    body1:
      'Victoza (liraglutide) is a GLP-1 medication that is FDA-approved for type 2 diabetes. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Victoza will lose 3 to 5% of their body weight over a year.',
  },
  {
    brand: 'Bupropion and Naltrexone',
    drug: '',
    body1:
      'Bupropion and naltrexone are non-GLP-1 medications that are FDA-approved for other conditions. They have also been proven effective when used off-label for weight loss.',
    body2:
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    body3:
      'Most patients who use Bupropion and Naltrexone will lose 5 to 8% of their body weight over a year.',
  },
  {
    brand: 'Metformin',
    drug: '',
    body1:
      'Metformin is a non-GLP-1 medications that is FDA-approved for other conditions. It has also been proven effective when used off-label for weight loss.',
    body2:
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    body3:
      'Most patients who use Metformin will lose 2 to 5% of their body weight over a year.',
  },
];

export const medicationsNonCompoundSpanish = [
  {
    brand: 'Wegovy',
    drug: 'Semaglutida',
    body1: `Wegovy (semaglutida) es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2021. Entre todos los medicamentos GLP-1, ${siteName} ha experimentado la tasa más alta de éxito en obtener autorizaciones previas para que el seguro cubra Wegovy, por lo que es altamente recomendado para aquellos con seguro.`,
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Wegovy perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Zepbound',
    drug: 'Tirzepatida',
    body1:
      'Zepbound (tirzepatida) es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2023.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Zepbound perderán el 25% de su peso corporal en un año.',
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutida',
    body1:
      'Semaglutida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2017. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Ozempic perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatida',
    body1:
      'Tirzepatida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2022. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Mounjaro perderán el 20% de su peso corporal en un año.',
  },
  {
    brand: 'Saxenda',
    drug: 'Liraglutida',
    body1:
      'Liraglutida es un medicamento GLP-1 aprobado por la FDA para la pérdida de peso en 2014.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Saxenda perderán el 8% de su peso corporal en un año.',
  },
  {
    brand: 'Victoza',
    drug: 'Liraglutida',
    body1:
      'Victoza (liraglutida) es un medicamento GLP-1 que está aprobado por la FDA para la diabetes tipo 2. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Victoza perderán del 3 al 5% de su peso corporal en un año.',
  },
  {
    brand: 'Bupropión y Naltrexona',
    drug: '',
    body1:
      'Bupropión y naltrexona son medicamentos no GLP-1 que están aprobados por la FDA para otras condiciones. También han demostrado ser efectivos cuando se usan fuera de indicación para la pérdida de peso.',
    body2:
      'El costo del medicamento se incluirá en su membresía si se envía a través de nuestra farmacia asociada de pedidos por correo.',
    body3:
      'La mayoría de los pacientes que usan Bupropión y Naltrexona perderán del 5 al 8% de su peso corporal en un año.',
  },
  {
    brand: 'Metformina',
    drug: '',
    body1:
      'Metformina es un medicamento no GLP-1 que está aprobado por la FDA para otras condiciones. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'El costo del medicamento se incluirá en su membresía si se envía a través de nuestra farmacia asociada de pedidos por correo.',
    body3:
      'La mayoría de los pacientes que usan Metformina perderán del 2 al 5% de su peso corporal en un año.',
  },
];

export const compoundMedicationsSpanish = [
  {
    brand: 'Semaglutida',
    drug: '',
    body1:
      'Semaglutida es el nombre genérico de Wegovy y Ozempic. Se ha demostrado que los pacientes que toman Semaglutida pierden un promedio del 14,9% del peso corporal en 64 semanas*.',
    body2: `Como miembro del programa de pérdida de peso de ${siteName}, ofrecemos acceso a una forma compuesta de Semaglutida si se prescribe**.`,
    body3:
      'Su primer mes de semaglutida generalmente cuesta alrededor de $151. Esto puede variar según la dosis.',
    disclaimers: [
      '*Las formulaciones compuestas no están aprobadas por la FDA y pueden no producir los mismos resultados que las formulaciones comercialmente disponibles.',
      '**Cuando se usa en combinación con una dieta restringida en calorías y un programa de ejercicios',
    ],
  },
  {
    brand: 'Tirzepatida',
    drug: '',
    body1:
      'Tirzepatida es el nombre genérico de Mounjaro y Zepbound.\n\nSe ha demostrado que los pacientes que toman Tirzepatida pierden en promedio el 20% de su peso corporal en 72 semanas*.',
    body2: `Como miembro del programa de pérdida de peso de ${siteName}, tiene acceso a una forma compuesta de Tirzepatida si se prescribe**.`,
    body3:
      'Su primer mes de Tirzepatida generalmente cuesta alrededor de $200. Esto puede variar según la dosis.',
    disclaimers: [
      '*Las formulaciones compuestas no están aprobadas por la FDA y pueden no producir los mismos resultados que las formulaciones comercialmente disponibles.',
      '**Cuando se usa en combinación con una dieta restringida en calorías y un programa de ejercicios',
    ],
  },
];

export const compoundMedicationsCASpanish = [
  {
    brand: 'Liraglutida',
    drug: '',
    body1:
      'Se ha demostrado que la liraglutida es eficaz cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Liraglutida perderán el 8% de su peso corporal en un año.',
    body3: '',
  },
];

export const medicationsWithCompound = [
  {
    brand: 'Wegovy',
    drug: 'Semaglutide',
    body1: `Wegovy (semaglutide) is a GLP-1 medication that was FDA-approved for weight loss in 2021. Among all GLP-1 medications, ${siteName} has experienced the highest rate of success getting prior authorizations for insurance to cover Wegovy, so it highly recommended for those with insurance.`,
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Wegovy will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Zepbound',
    drug: 'Tirzepatide',
    body1:
      'Zepbound (tirzepatide) is a GLP-1 medication that was FDA-approved for weight loss in 2023.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Zepbound will lose 25% of their body weight over a year.',
  },
  {
    brand: 'Semaglutide',
    drug: '',
    body1:
      'Semaglutide is the generic name for Wegovy and Ozempic. Patients taking Semaglutide have been shown to lose 14.9% of body weight on average over 64 weeks*.',
    body2: `As a ${siteName} weight loss member we offer access to a compounded form of Semaglutide if prescribed**.`,
    body3:
      'The monthly cost of this medication can be as low as $151 per month.',
    body3V2:
      'The monthly cost of this medication can be as low as $183 per month.',
    disclaimers: [
      '*When used in combination with a restricted calorie diet and exercise program',
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
    ],
  },
  {
    brand: 'Tirzepatide',
    drug: '',
    body1:
      'Tirzepatide is the generic name for Mounjaro and Zepbound.\n\nPatients taking Tirzepatide have been shown to lose on average 20% of their body weight over 72 weeks*. ',
    body2: `As a ${siteName} Weight Loss member, you have access to a compounded form of Tirzepatide if prescribed**. `,
    body3:
      'The monthly cost of this medication can be as low as $216 per month.',
    body3V2:
      'The monthly cost of this medication can be as low as $333 per month.',
    disclaimers: [
      '*When used in combination with a restricted calorie diet and exercise program',
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
    ],
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutide',
    body1:
      'Semaglutide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2017. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Ozempic will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatide',
    body1:
      'Tirzapatide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2022. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Mounjaro will lose 20% of their body weight over a year.',
  },
  {
    brand: 'Saxenda',
    drug: 'Liraglutide',
    body1:
      'Liraglutide is a GLP-1 medication FDA-approved for weight loss in 2014.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Saxenda will lose 8% of their body weight over a year.',
  },
  {
    brand: 'Victoza',
    drug: 'Liraglutide',
    body1:
      'Victoza (liraglutide) is a GLP-1 medication that is FDA-approved for type 2 diabetes. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Victoza will lose 3 to 5% of their body weight over a year.',
  },
  {
    brand: 'Bupropion and Naltrexone',
    drug: '',
    body1:
      'Bupropion and naltrexone are non-GLP-1 medications that are FDA-approved for other conditions. They have also been proven effective when used off-label for weight loss.',
    body2:
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    body3:
      'Most patients who use Bupropion and Naltrexone will lose 5 to 8% of their body weight over a year.',
  },
  {
    brand: 'Metformin',
    drug: '',
    body1:
      'Metformin is a non-GLP-1 medications that is FDA-approved for other conditions. It has also been proven effective when used off-label for weight loss.',
    body2:
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    body3:
      'Most patients who use Metformin will lose 2 to 5% of their body weight over a year.',
  },
];

export const medicationsWithCompoundSpanish = [
  {
    brand: 'Wegovy',
    drug: 'Semaglutida',
    body1: `Wegovy (semaglutida) es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2021. Entre todos los medicamentos GLP-1, ${siteName} ha experimentado la tasa más alta de éxito en obtener autorizaciones previas para que el seguro cubra Wegovy, por lo que es altamente recomendado para aquellos con seguro.`,
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Wegovy perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Zepbound',
    drug: 'Tirzepatida',
    body1:
      'Zepbound (tirzepatida) es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2023.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Zepbound perderán el 25% de su peso corporal en un año.',
  },
  {
    brand: 'Semaglutida',
    drug: '',
    body1:
      'Semaglutida es el nombre genérico de Wegovy y Ozempic. Se ha demostrado que los pacientes que toman Semaglutida pierden un promedio del 14,9% del peso corporal en 64 semanas*.',
    body2: `Como miembro del programa de pérdida de peso de ${siteName}, ofrecemos acceso a una forma compuesta de Semaglutida si se prescribe**.`,
    body3:
      'El costo mensual de este medicamento puede ser tan bajo como $151 por mes.',
    body3V2:
      'El costo mensual de este medicamento puede ser tan bajo como $183 por mes.',
    disclaimers: [
      '*Cuando se usa en combinación con una dieta restringida en calorías y un programa de ejercicios',
      '**Las formulaciones compuestas no están aprobadas por la FDA y pueden no producir los mismos resultados que las formulaciones disponibles comercialmente.',
    ],
  },
  {
    brand: 'Tirzepatida',
    drug: '',
    body1:
      'Tirzepatida es el nombre genérico de Mounjaro y Zepbound.\n\nSe ha demostrado que los pacientes que toman Tirzepatida pierden en promedio el 20% de su peso corporal en 72 semanas*.',
    body2: `Como miembro del programa de pérdida de peso de ${siteName}, tiene acceso a una forma compuesta de Tirzepatida si se prescribe**.`,
    body3:
      'El costo mensual de este medicamento puede ser tan bajo como $216 por mes.',
    body3V2:
      'El costo mensual de este medicamento puede ser tan bajo como $333 por mes.',
    disclaimers: [
      '*Cuando se usa en combinación con una dieta restringida en calorías y un programa de ejercicios',
      '**Las formulaciones compuestas no están aprobadas por la FDA y pueden no producir los mismos resultados que las formulaciones disponibles comercialmente.',
    ],
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutida',
    body1:
      'Semaglutida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2017. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Ozempic perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatida',
    body1:
      'Tirzepatida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2022. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Mounjaro perderán el 20% de su peso corporal en un año.',
  },
  {
    brand: 'Saxenda',
    drug: 'Liraglutida',
    body1:
      'Liraglutida es un medicamento GLP-1 aprobado por la FDA para la pérdida de peso en 2014.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Saxenda perderán el 8% de su peso corporal en un año.',
  },
  {
    brand: 'Victoza',
    drug: 'Liraglutida',
    body1:
      'Victoza (liraglutida) es un medicamento GLP-1 que está aprobado por la FDA para la diabetes tipo 2. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Victoza perderán del 3 al 5% de su peso corporal en un año.',
  },
  {
    brand: 'Bupropión y Naltrexona',
    drug: '',
    body1:
      'Bupropión y naltrexona son medicamentos no GLP-1 que están aprobados por la FDA para otras condiciones. También han demostrado ser efectivos cuando se usan fuera de indicación para la pérdida de peso.',
    body2:
      'El costo del medicamento se incluirá en su membresía si se envía a través de nuestra farmacia asociada de pedidos por correo.',
    body3:
      'La mayoría de los pacientes que usan Bupropión y Naltrexona perderán del 5 al 8% de su peso corporal en un año.',
  },
  {
    brand: 'Metformina',
    drug: '',
    body1:
      'Metformina es un medicamento no GLP-1 que está aprobado por la FDA para otras condiciones. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'El costo del medicamento se incluirá en su membresía si se envía a través de nuestra farmacia asociada de pedidos por correo.',
    body3:
      'La mayoría de los pacientes que usan Metformina perderán del 2 al 5% de su peso corporal en un año.',
  },
];

export const medicationsNonCompound4381 = [
  {
    brand: 'Zepbound',
    drug: 'Tirzepatide',
    body1:
      'Zepbound (tirzepatide) is a GLP-1 medication that was FDA-approved for weight loss in 2023.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Zepbound will lose 25% of their body weight over a year.',
  },
  {
    brand: 'Wegovy',
    drug: 'Semaglutide',
    body1:
      'Wegovy (semaglutide) is a GLP-1 medication that was FDA-approved for weight loss in 2021.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Wegovy will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutide',
    body1:
      'Semaglutide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2017. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Ozempic will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatide',
    body1:
      'Tirzapatide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2022. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Mounjaro will lose 20% of their body weight over a year.',
  },
  {
    brand: 'Saxenda',
    drug: 'Liraglutide',
    body1:
      'Liraglutide is a GLP-1 medication FDA-approved for weight loss in 2014.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Saxenda will lose 8% of their body weight over a year.',
  },
  {
    brand: 'Victoza',
    drug: 'Liraglutide',
    body1:
      'Victoza (liraglutide) is a GLP-1 medication that is FDA-approved for type 2 diabetes. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Victoza will lose 3 to 5% of their body weight over a year.',
  },
  {
    brand: 'Bupropion and Naltrexone',
    drug: '',
    body1:
      'Bupropion and naltrexone are non-GLP-1 medications that are FDA-approved for other conditions. They have also been proven effective when used off-label for weight loss.',
    body2:
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    body3:
      'Most patients who use Bupropion and Naltrexone will lose 5 to 8% of their body weight over a year.',
  },
  {
    brand: 'Metformin',
    drug: '',
    body1:
      'Metformin is a non-GLP-1 medications that is FDA-approved for other conditions. It has also been proven effective when used off-label for weight loss.',
    body2:
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    body3:
      'Most patients who use Metformin will lose 2 to 5% of their body weight over a year.',
  },
];
export const medicationsNonCompound4381Spanish = [
  {
    brand: 'Zepbound',
    drug: 'Tirzepatida',
    body1:
      'Zepbound (tirzepatida) es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2023.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Zepbound perderán el 25% de su peso corporal en un año.',
  },
  {
    brand: 'Wegovy',
    drug: 'Semaglutida',
    body1:
      'Wegovy (semaglutida) es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2021.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Wegovy perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutida',
    body1:
      'Semaglutida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2017. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Ozempic perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatida',
    body1:
      'Tirzepatida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2022. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Mounjaro perderán el 20% de su peso corporal en un año.',
  },
  {
    brand: 'Saxenda',
    drug: 'Liraglutida',
    body1:
      'Liraglutida es un medicamento GLP-1 aprobado por la FDA para la pérdida de peso en 2014.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Saxenda perderán el 8% de su peso corporal en un año.',
  },
  {
    brand: 'Victoza',
    drug: 'Liraglutida',
    body1:
      'Victoza (liraglutida) es un medicamento GLP-1 que está aprobado por la FDA para la diabetes tipo 2. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Victoza perderán del 3 al 5% de su peso corporal en un año.',
  },
  {
    brand: 'Bupropión y Naltrexona',
    drug: '',
    body1:
      'Bupropión y naltrexona son medicamentos no GLP-1 que están aprobados por la FDA para otras condiciones. También han demostrado ser efectivos cuando se usan fuera de indicación para la pérdida de peso.',
    body2:
      'El costo del medicamento se incluirá en su membresía si se envía a través de nuestra farmacia asociada de pedidos por correo.',
    body3:
      'La mayoría de los pacientes que usan Bupropión y Naltrexona perderán del 5 al 8% de su peso corporal en un año.',
  },
  {
    brand: 'Metformina',
    drug: '',
    body1:
      'Metformina es un medicamento no GLP-1 que está aprobado por la FDA para otras condiciones. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'El costo del medicamento se incluirá en su membresía si se envía a través de nuestra farmacia asociada de pedidos por correo.',
    body3:
      'La mayoría de los pacientes que usan Metformina perderán del 2 al 5% de su peso corporal en un año.',
  },
];

export const medications = [
  {
    brand: 'Zepbound',
    drug: 'Tirzepatide',
    body1:
      'Zepbound (tirzepatide) is a GLP-1 medication that was FDA-approved for weight loss in 2023.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Zepbound will lose 25% of their body weight over a year.',
  },
  {
    brand: 'Wegovy',
    drug: 'Semaglutide',
    body1:
      'Wegovy (semaglutide) is a GLP-1 medication that was FDA-approved for weight loss in 2021.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Wegovy will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutide',
    body1:
      'Semaglutide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2017. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Ozempic will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatide',
    body1:
      'Tirzapatide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2022. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Mounjaro will lose 20% of their body weight over a year.',
  },
  {
    brand: 'Saxenda',
    drug: 'Liraglutide',
    body1:
      'Liraglutide is a GLP-1 medication FDA-approved for weight loss in 2014.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Saxenda will lose 8% of their body weight over a year.',
  },
  {
    brand: 'Victoza',
    drug: 'Liraglutide',
    body1:
      'Victoza (liraglutide) is a GLP-1 medication that is FDA-approved for type 2 diabetes. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Victoza will lose 3 to 5% of their body weight over a year.',
  },
  {
    brand: 'Bupropion and Naltrexone',
    drug: '',
    body1:
      'Bupropion and naltrexone are non-GLP-1 medications that are FDA-approved for other conditions. They have also been proven effective when used off-label for weight loss.',
    body2:
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    body3:
      'Most patients who use Bupropion and Naltrexone will lose 5 to 8% of their body weight over a year.',
  },
  {
    brand: 'Metformin',
    drug: '',
    body1:
      'Metformin is a non-GLP-1 medications that is FDA-approved for other conditions. It has also been proven effective when used off-label for weight loss.',
    body2:
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    body3:
      'Most patients who use Metformin will lose 2 to 5% of their body weight over a year.',
  },
];

export const medicationsSpanish = [
  {
    brand: 'Zepbound',
    drug: 'Tirzepatida',
    body1:
      'Zepbound (tirzepatida) es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2023.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Zepbound perderán el 25% de su peso corporal en un año.',
  },
  {
    brand: 'Wegovy',
    drug: 'Semaglutida',
    body1:
      'Wegovy (semaglutida) es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2021.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Wegovy perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutida',
    body1:
      'Semaglutida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2017. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Ozempic perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatida',
    body1:
      'Tirzepatida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2022. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Mounjaro perderán el 20% de su peso corporal en un año.',
  },
  {
    brand: 'Saxenda',
    drug: 'Liraglutida',
    body1:
      'Liraglutida es un medicamento GLP-1 aprobado por la FDA para la pérdida de peso en 2014.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Saxenda perderán el 8% de su peso corporal en un año.',
  },
  {
    brand: 'Victoza',
    drug: 'Liraglutida',
    body1:
      'Victoza (liraglutida) es un medicamento GLP-1 que está aprobado por la FDA para la diabetes tipo 2. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Victoza perderán del 3 al 5% de su peso corporal en un año.',
  },
  {
    brand: 'Bupropión y Naltrexona',
    drug: '',
    body1:
      'Bupropión y naltrexona son medicamentos no GLP-1 que están aprobados por la FDA para otras condiciones. También han demostrado ser efectivos cuando se usan fuera de indicación para la pérdida de peso.',
    body2:
      'El costo del medicamento se incluirá en su membresía si se envía a través de nuestra farmacia asociada de pedidos por correo.',
    body3:
      'La mayoría de los pacientes que usan Bupropión y Naltrexona perderán del 5 al 8% de su peso corporal en un año.',
  },
  {
    brand: 'Metformina',
    drug: '',
    body1:
      'Metformina es un medicamento no GLP-1 que está aprobado por la FDA para otras condiciones. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'El costo del medicamento se incluirá en su membresía si se envía a través de nuestra farmacia asociada de pedidos por correo.',
    body3:
      'La mayoría de los pacientes que usan Metformina perderán del 2 al 5% de su peso corporal en un año.',
  },
];

export const medicationsCA = [
  {
    brand: 'Wegovy',
    drug: 'Semaglutide',
    body1:
      'Wegovy (semaglutide) is a GLP-1 medication that was FDA-approved for weight loss in 2021.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Wegovy will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Zepbound',
    drug: 'Tirzepatide',
    body1:
      'Zepbound (tirzepatide) is a GLP-1 medication that was FDA-approved for weight loss in 2023.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Zepbound will lose 25% of their body weight over a year.',
  },
  {
    brand: 'Semaglutide',
    drug: '',
    body1:
      'Semaglutide is the generic name for Wegovy and Ozempic. Patients taking Semaglutide have been shown to lose 14.9% of body weight on average over 64 weeks*.',
    body2: `As a ${siteName} weight loss member we offer access to a compounded form of Semaglutide if prescribed**.`,
    body3:
      'You can get Semaglutide for as little as $151/month including shipping and all medical supplies.',
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutide',
    body1:
      'Semaglutide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2017. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Ozempic will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatide',
    body1:
      'Tirzapatide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2022. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Mounjaro will lose 20% of their body weight over a year.',
  },
  {
    brand: 'Saxenda',
    drug: 'Liraglutide',
    body1:
      'Liraglutide is a GLP-1 medication FDA-approved for weight loss in 2014.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Saxenda will lose 8% of their body weight over a year.',
  },
  {
    brand: 'Victoza',
    drug: 'Liraglutide',
    body1:
      'Victoza (liraglutide) is a GLP-1 medication that is FDA-approved for type 2 diabetes. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Victoza will lose 3 to 5% of their body weight over a year.',
  },
  {
    brand: 'Metformin',
    drug: '',
    body1:
      'Metformin is a non-GLP-1 medications that is FDA-approved for other conditions. It has also been proven effective when used off-label for weight loss.',
    body2:
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    body3:
      'Most patients who use Metformin will lose 2 to 5% of their body weight over a year.',
  },
];
export const medicationsCASpanish = [
  {
    brand: 'Wegovy',
    drug: 'Semaglutida',
    body1:
      'Wegovy (semaglutida) es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2021.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Wegovy perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Zepbound',
    drug: 'Tirzepatida',
    body1:
      'Zepbound (tirzepatida) es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2023.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Zepbound perderán el 25% de su peso corporal en un año.',
  },
  {
    brand: 'Semaglutida',
    drug: '',
    body1:
      'Semaglutida es el nombre genérico de Wegovy y Ozempic. Se ha demostrado que los pacientes que toman Semaglutida pierden un promedio del 14,9% del peso corporal en 64 semanas*.',
    body2: `Como miembro del programa de pérdida de peso de ${siteName}, ofrecemos acceso a una forma compuesta de Semaglutida si se prescribe**.`,
    body3:
      'Puede obtener Semaglutida por tan solo $151 al mes, incluyendo el envío y todos los suministros médicos.',
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutida',
    body1:
      'Semaglutida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2017. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Ozempic perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatida',
    body1:
      'Tirzepatida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2022. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Mounjaro perderán el 20% de su peso corporal en un año.',
  },
  {
    brand: 'Saxenda',
    drug: 'Liraglutida',
    body1:
      'Liraglutida es un medicamento GLP-1 aprobado por la FDA para la pérdida de peso en 2014.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Saxenda perderán el 8% de su peso corporal en un año.',
  },
  {
    brand: 'Victoza',
    drug: 'Liraglutida',
    body1:
      'Victoza (liraglutida) es un medicamento GLP-1 que está aprobado por la FDA para la diabetes tipo 2. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Victoza perderán del 3 al 5% de su peso corporal en un año.',
  },
  {
    brand: 'Metformina',
    drug: '',
    body1:
      'Metformina es un medicamento no GLP-1 que está aprobado por la FDA para otras condiciones. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'El costo del medicamento se incluirá en su membresía si se envía a través de nuestra farmacia asociada de pedidos por correo.',
    body3:
      'La mayoría de los pacientes que usan Metformina perderán del 2 al 5% de su peso corporal en un año.',
  },
];

export const medicationsCA4381 = [
  {
    brand: 'Zepbound',
    drug: 'Tirzepatide',
    body1:
      'Zepbound (tirzepatide) is a GLP-1 medication that was FDA-approved for weight loss in 2023.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Zepbound will lose 25% of their body weight over a year.',
  },
  {
    brand: 'Wegovy',
    drug: 'Semaglutide',
    body1:
      'Wegovy (semaglutide) is a GLP-1 medication that was FDA-approved for weight loss in 2021.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Wegovy will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutide',
    body1:
      'Semaglutide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2017. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Ozempic will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatide',
    body1:
      'Tirzapatide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2022. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Mounjaro will lose 20% of their body weight over a year.',
  },
  {
    brand: 'Saxenda',
    drug: 'Liraglutide',
    body1:
      'Liraglutide is a GLP-1 medication FDA-approved for weight loss in 2014.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Saxenda will lose 8% of their body weight over a year.',
  },
  {
    brand: 'Victoza',
    drug: 'Liraglutide',
    body1:
      'Victoza (liraglutide) is a GLP-1 medication that is FDA-approved for type 2 diabetes. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Victoza will lose 3 to 5% of their body weight over a year.',
  },
  {
    brand: 'Metformin',
    drug: '',
    body1:
      'Metformin is a non-GLP-1 medications that is FDA-approved for other conditions. It has also been proven effective when used off-label for weight loss.',
    body2:
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    body3:
      'Most patients who use Metformin will lose 2 to 5% of their body weight over a year.',
  },
  {
    brand: 'Semaglutide',
    drug: '',
    body1:
      'Semaglutide is the generic name for Wegovy and Ozempic. Patients taking Semaglutide have been shown to lose 14.9% of body weight on average over 64 weeks*.',
    body2: `As a ${siteName} weight loss member we offer access to a compounded form of Semaglutide if prescribed**.`,
    body3:
      'You can get Semaglutide for as little as $151/month including shipping and all medical supplies.',
  },
];

export const medicationsCA4381Spanish = [
  {
    brand: 'Zepbound',
    drug: 'Tirzepatida',
    body1:
      'Zepbound (tirzepatida) es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2023.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Zepbound perderán el 25% de su peso corporal en un año.',
  },
  {
    brand: 'Wegovy',
    drug: 'Semaglutida',
    body1:
      'Wegovy (semaglutida) es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2021.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Wegovy perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutida',
    body1:
      'Semaglutida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2017. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Ozempic perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatida',
    body1:
      'Tirzepatida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2022. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Mounjaro perderán el 20% de su peso corporal en un año.',
  },
  {
    brand: 'Saxenda',
    drug: 'Liraglutida',
    body1:
      'Liraglutida es un medicamento GLP-1 aprobado por la FDA para la pérdida de peso en 2014.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Saxenda perderán el 8% de su peso corporal en un año.',
  },
  {
    brand: 'Victoza',
    drug: 'Liraglutida',
    body1:
      'Victoza (liraglutida) es un medicamento GLP-1 que está aprobado por la FDA para la diabetes tipo 2. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Victoza perderán del 3 al 5% de su peso corporal en un año.',
  },
  {
    brand: 'Metformina',
    drug: '',
    body1:
      'Metformina es un medicamento no GLP-1 que está aprobado por la FDA para otras condiciones. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'El costo del medicamento se incluirá en su membresía si se envía a través de nuestra farmacia asociada de pedidos por correo.',
    body3:
      'La mayoría de los pacientes que usan Metformina perderán del 2 al 5% de su peso corporal en un año.',
  },
  {
    brand: 'Semaglutida',
    drug: '',
    body1:
      'Semaglutida es el nombre genérico de Wegovy y Ozempic. Se ha demostrado que los pacientes que toman Semaglutida pierden un promedio del 14,9% del peso corporal en 64 semanas*.',
    body2: `Como miembro del programa de pérdida de peso de ${siteName}, ofrecemos acceso a una forma compuesta de Semaglutida si se prescribe**.`,
    body3:
      'Puede obtener Semaglutida por tan solo $151 al mes, incluyendo el envío y todos los suministros médicos.',
  },
];

export const medicationsDiabetes = [
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatide',
    body1:
      'Tirzapatide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2022. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Mounjaro will lose 20% of their body weight over a year.',
  },
  {
    brand: 'Wegovy',
    drug: 'Semaglutide',
    body1:
      'Wegovy (semaglutide) is a GLP-1 medication that was FDA-approved for weight loss in 2021.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Wegovy will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutide',
    body1:
      'Semaglutide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2017. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Ozempic will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Saxenda',
    drug: 'Liraglutide',
    body1:
      'Liraglutide is a GLP-1 medication FDA-approved for weight loss in 2014.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Saxenda will lose 8% of their body weight over a year.',
  },
  {
    brand: 'Victoza',
    drug: 'Liraglutide',
    body1:
      'Victoza (liraglutide) is a GLP-1 medication that is FDA-approved for type 2 diabetes. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Victoza will lose 3 to 5% of their body weight over a year.',
  },
  {
    brand: 'Bupropion and Naltrexone',
    drug: '',
    body1:
      'Bupropion and naltrexone are non-GLP-1 medications that are FDA-approved for other conditions. They have also been proven effective when used off-label for weight loss.',
    body2:
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    body3:
      'Most patients who use Bupropion and Naltrexone will lose 5 to 8% of their body weight over a year.',
  },
  {
    brand: 'Metformin',
    drug: '',
    body1:
      'Metformin is a non-GLP-1 medications that is FDA-approved for other conditions. It has also been proven effective when used off-label for weight loss.',
    body2:
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    body3:
      'Most patients who use Metformin will lose 2 to 5% of their body weight over a year.',
  },
];

export const medicationsDiabetesSpanish = [
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatida',
    body1:
      'Tirzepatida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2022. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Mounjaro perderán el 20% de su peso corporal en un año.',
  },
  {
    brand: 'Wegovy',
    drug: 'Semaglutida',
    body1:
      'Wegovy (semaglutida) es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2021.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Wegovy perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutida',
    body1:
      'Semaglutida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2017. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Ozempic perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Saxenda',
    drug: 'Liraglutida',
    body1:
      'Liraglutida es un medicamento GLP-1 aprobado por la FDA para la pérdida de peso en 2014.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Saxenda perderán el 8% de su peso corporal en un año.',
  },
  {
    brand: 'Victoza',
    drug: 'Liraglutida',
    body1:
      'Victoza (liraglutida) es un medicamento GLP-1 que está aprobado por la FDA para la diabetes tipo 2. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Victoza perderán del 3 al 5% de su peso corporal en un año.',
  },
  {
    brand: 'Bupropión y Naltrexona',
    drug: '',
    body1:
      'Bupropión y naltrexona son medicamentos no GLP-1 que están aprobados por la FDA para otras condiciones. También han demostrado ser efectivos cuando se usan fuera de indicación para la pérdida de peso.',
    body2:
      'El costo del medicamento se incluirá en su membresía si se envía a través de nuestra farmacia asociada de pedidos por correo.',
    body3:
      'La mayoría de los pacientes que usan Bupropión y Naltrexona perderán del 5 al 8% de su peso corporal en un año.',
  },
  {
    brand: 'Metformina',
    drug: '',
    body1:
      'Metformina es un medicamento no GLP-1 que está aprobado por la FDA para otras condiciones. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'El costo del medicamento se incluirá en su membresía si se envía a través de nuestra farmacia asociada de pedidos por correo.',
    body3:
      'La mayoría de los pacientes que usan Metformina perderán del 2 al 5% de su peso corporal en un año.',
  },
];

export const medicationsDiabetesCA = [
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatide',
    body1:
      'Tirzapatide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2022. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Mounjaro will lose 20% of their body weight over a year.',
  },
  {
    brand: 'Wegovy',
    drug: 'Semaglutide',
    body1:
      'Wegovy (semaglutide) is a GLP-1 medication that was FDA-approved for weight loss in 2021.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Wegovy will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutide',
    body1:
      'Semaglutide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2017. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Ozempic will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Saxenda',
    drug: 'Liraglutide',
    body1:
      'Liraglutide is a GLP-1 medication FDA-approved for weight loss in 2014.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Saxenda will lose 8% of their body weight over a year.',
  },
  {
    brand: 'Victoza',
    drug: 'Liraglutide',
    body1:
      'Victoza (liraglutide) is a GLP-1 medication that is FDA-approved for type 2 diabetes. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Victoza will lose 3 to 5% of their body weight over a year.',
  },
  {
    brand: 'Metformin',
    drug: '',
    body1:
      'Metformin is a non-GLP-1 medications that is FDA-approved for other conditions. It has also been proven effective when used off-label for weight loss.',
    body2:
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    body3:
      'Most patients who use Metformin will lose 2 to 5% of their body weight over a year.',
  },
  {
    brand: 'Semaglutide',
    drug: '',
    body1:
      'Semaglutide is the generic name for Wegovy and Ozempic. Patients taking Semaglutide have been shown to lose 14.9% of body weight on average over 64 weeks*.',
    body2: `As a ${siteName} weight loss member we offer access to a compounded form of Semaglutide if prescribed**.`,
    body3:
      'You can get Semaglutide for as little as $151/month including shipping and all medical supplies.',
  },
];

export const medicationsDiabetesCASpanish = [
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatida',
    body1:
      'Tirzepatida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2022. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Mounjaro perderán el 20% de su peso corporal en un año.',
  },
  {
    brand: 'Wegovy',
    drug: 'Semaglutida',
    body1:
      'Wegovy (semaglutida) es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2021.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Wegovy perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutida',
    body1:
      'Semaglutida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2017. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Ozempic perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Saxenda',
    drug: 'Liraglutida',
    body1:
      'Liraglutida es un medicamento GLP-1 aprobado por la FDA para la pérdida de peso en 2014.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Saxenda perderán el 8% de su peso corporal en un año.',
  },
  {
    brand: 'Victoza',
    drug: 'Liraglutida',
    body1:
      'Victoza (liraglutida) es un medicamento GLP-1 que está aprobado por la FDA para la diabetes tipo 2. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Victoza perderán del 3 al 5% de su peso corporal en un año.',
  },
  {
    brand: 'Metformina',
    drug: '',
    body1:
      'Metformina es un medicamento no GLP-1 que está aprobado por la FDA para otras condiciones. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'El costo del medicamento se incluirá en su membresía si se envía a través de nuestra farmacia asociada de pedidos por correo.',
    body3:
      'La mayoría de los pacientes que usan Metformina perderán del 2 al 5% de su peso corporal en un año.',
  },
  {
    brand: 'Semaglutida',
    drug: '',
    body1:
      'Semaglutida es el nombre genérico de Wegovy y Ozempic. Se ha demostrado que los pacientes que toman Semaglutida pierden un promedio del 14,9% del peso corporal en 64 semanas*.',
    body2: `Como miembro del programa de pérdida de peso de ${siteName}, ofrecemos acceso a una forma compuesta de Semaglutida si se prescribe**.`,
    body3:
      'Puede obtener Semaglutida por tan solo $151 al mes, incluyendo el envío y todos los suministros médicos.',
  },
];

export const compoundFirstMedications = [
  {
    brand: 'Semaglutide',
    drug: '',
    body1:
      'Semaglutide is the generic name for Wegovy and Ozempic. Patients taking Semaglutide have been shown to lose 14.9% of body weight on average over 64 weeks*.',
    body2: `As a ${siteName} weight loss member we offer access to a compounded form of Semaglutide if prescribed**.`,
    body3:
      'The monthly cost of this medication can be as low as $151 per month.',
    body3V2:
      'The monthly cost of this medication can be as low as $183 per month.',
    disclaimers: [
      '*When used in combination with a restricted calorie diet and exercise program',
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
    ],
  },
  {
    brand: 'Tirzepatide',
    drug: '',
    body1:
      'Tirzepatide is the generic name for Mounjaro and Zepbound.\n\nPatients taking Tirzepatide have been shown to lose on average 20% of their body weight over 72 weeks*. ',
    body2: `As a ${siteName} Weight Loss member, you have access to a compounded form of Tirzepatide if prescribed**. `,
    body3:
      'The monthly cost of this medication can be as low as $216 per month.',
    body3V2:
      'The monthly cost of this medication can be as low as $333 per month.',
    disclaimers: [
      '*When used in combination with a restricted calorie diet and exercise program',
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
    ],
  },
  {
    brand: 'Zepbound',
    drug: 'Tirzepatide',
    body1:
      'Zepbound (tirzepatide) is a GLP-1 medication that was FDA-approved for weight loss in 2023.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Zepbound will lose 25% of their body weight over a year.',
  },
  {
    brand: 'Wegovy',
    drug: 'Semaglutide',
    body1:
      'Wegovy (semaglutide) is a GLP-1 medication that was FDA-approved for weight loss in 2021.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Wegovy will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutide',
    body1:
      'Semaglutide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2017. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Ozempic will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatide',
    body1:
      'Tirzapatide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2022. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Mounjaro will lose 20% of their body weight over a year.',
  },
  {
    brand: 'Saxenda',
    drug: 'Liraglutide',
    body1:
      'Liraglutide is a GLP-1 medication FDA-approved for weight loss in 2014.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Saxenda will lose 8% of their body weight over a year.',
  },
  {
    brand: 'Victoza',
    drug: 'Liraglutide',
    body1:
      'Victoza (liraglutide) is a GLP-1 medication that is FDA-approved for type 2 diabetes. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Victoza will lose 3 to 5% of their body weight over a year.',
  },
  {
    brand: 'Bupropion and Naltrexone',
    drug: '',
    body1:
      'Bupropion and naltrexone are non-GLP-1 medications that are FDA-approved for other conditions. They have also been proven effective when used off-label for weight loss.',
    body2:
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    body3:
      'Most patients who use Bupropion and Naltrexone will lose 5 to 8% of their body weight over a year.',
  },
  {
    brand: 'Metformin',
    drug: '',
    body1:
      'Metformin is a non-GLP-1 medications that is FDA-approved for other conditions. It has also been proven effective when used off-label for weight loss.',
    body2:
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    body3:
      'Most patients who use Metformin will lose 2 to 5% of their body weight over a year.',
  },
];

export const compoundFirstMedicationsSpanish = [
  {
    brand: 'Semaglutida',
    drug: '',
    body1:
      'Semaglutida es el nombre genérico de Wegovy y Ozempic. Se ha demostrado que los pacientes que toman Semaglutida pierden un promedio del 14,9% del peso corporal en 64 semanas*.',
    body2: `Como miembro del programa de pérdida de peso de ${siteName}, ofrecemos acceso a una forma compuesta de Semaglutida si se prescribe**.`,
    body3:
      'El costo mensual de este medicamento puede ser tan bajo como $151 por mes.',
    body3V2:
      'El costo mensual de este medicamento puede ser tan bajo como $183 por mes.',
    disclaimers: [
      '*Cuando se usa en combinación con una dieta restringida en calorías y un programa de ejercicios',
      '**Las formulaciones compuestas no están aprobadas por la FDA y pueden no producir los mismos resultados que las formulaciones disponibles comercialmente.',
    ],
  },
  {
    brand: 'Tirzepatida',
    drug: '',
    body1:
      'Tirzepatida es el nombre genérico de Mounjaro y Zepbound.\n\nSe ha demostrado que los pacientes que toman Tirzepatida pierden en promedio el 20% de su peso corporal en 72 semanas*.',
    body2: `Como miembro del programa de pérdida de peso de ${siteName}, tiene acceso a una forma compuesta de Tirzepatida si se prescribe**.`,
    body3:
      'El costo mensual de este medicamento puede ser tan bajo como $216 por mes.',
    body3V2:
      'El costo mensual de este medicamento puede ser tan bajo como $333 por mes.',
    disclaimers: [
      '*Cuando se usa en combinación con una dieta restringida en calorías y un programa de ejercicios',
      '**Las formulaciones compuestas no están aprobadas por la FDA y pueden no producir los mismos resultados que las formulaciones disponibles comercialmente.',
    ],
  },
  {
    brand: 'Zepbound',
    drug: 'Tirzepatida',
    body1:
      'Zepbound (tirzepatida) es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2023.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Zepbound perderán el 25% de su peso corporal en un año.',
  },
  {
    brand: 'Wegovy',
    drug: 'Semaglutida',
    body1:
      'Wegovy (semaglutida) es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2021.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Wegovy perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutida',
    body1:
      'Semaglutida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2017. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Ozempic perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatida',
    body1:
      'Tirzepatida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2022. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Mounjaro perderán el 20% de su peso corporal en un año.',
  },
  {
    brand: 'Saxenda',
    drug: 'Liraglutida',
    body1:
      'Liraglutida es un medicamento GLP-1 aprobado por la FDA para la pérdida de peso en 2014.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Saxenda perderán el 8% de su peso corporal en un año.',
  },
  {
    brand: 'Victoza',
    drug: 'Liraglutida',
    body1:
      'Victoza (liraglutida) es un medicamento GLP-1 que está aprobado por la FDA para la diabetes tipo 2. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Victoza perderán del 3 al 5% de su peso corporal en un año.',
  },
  {
    brand: 'Bupropión y Naltrexona',
    drug: '',
    body1:
      'Bupropión y naltrexona son medicamentos no GLP-1 que están aprobados por la FDA para otras condiciones. También han demostrado ser efectivos cuando se usan fuera de indicación para la pérdida de peso.',
    body2:
      'El costo del medicamento se incluirá en su membresía si se envía a través de nuestra farmacia asociada de pedidos por correo.',
    body3:
      'La mayoría de los pacientes que usan Bupropión y Naltrexona perderán del 5 al 8% de su peso corporal en un año.',
  },
  {
    brand: 'Metformina',
    drug: '',
    body1:
      'Metformina es un medicamento no GLP-1 que está aprobado por la FDA para otras condiciones. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'El costo del medicamento se incluirá en su membresía si se envía a través de nuestra farmacia asociada de pedidos por correo.',
    body3:
      'La mayoría de los pacientes que usan Metformina perderán del 2 al 5% de su peso corporal en un año.',
  },
];

export const compoundFirstMedicationsCA = [
  {
    brand: 'Semaglutide',
    drug: '',
    body1:
      'Semaglutide is the generic name for Wegovy and Ozempic. Patients taking Semaglutide have been shown to lose 14.9% of body weight on average over 64 weeks*.',
    body2: `As a ${siteName} weight loss member we offer access to a compounded form of Semaglutide if prescribed**.`,
    body3:
      'You can get Semaglutide for as little as $151/month including shipping and all medical supplies.',
    disclaimers: [
      '*When used in combination with a restricted calorie diet and exercise program',
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
    ],
  },
  {
    brand: 'Tirzepatide',
    drug: '',
    body1:
      'Tirzepatide is the generic name for Mounjaro and Zepbound.\n\nPatients taking Tirzepatide have been shown to lose on average 20% of their body weight over 72 weeks*. ',
    body2: `As a ${siteName} Weight Loss member, you have access to a compounded form of Tirzepatide if prescribed**. `,
    body3:
      'The monthly cost of this medication can be as low as $216 per month.',
    disclaimers: [
      '*When used in combination with a restricted calorie diet and exercise program',
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
    ],
  },
  {
    brand: 'Zepbound',
    drug: 'Tirzepatide',
    body1:
      'Zepbound (tirzepatide) is a GLP-1 medication that was FDA-approved for weight loss in 2023.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Zepbound will lose 25% of their body weight over a year.',
  },
  {
    brand: 'Wegovy',
    drug: 'Semaglutide',
    body1:
      'Wegovy (semaglutide) is a GLP-1 medication that was FDA-approved for weight loss in 2021.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Wegovy will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutide',
    body1:
      'Semaglutide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2017. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Ozempic will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatide',
    body1:
      'Tirzapatide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2022. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Mounjaro will lose 20% of their body weight over a year.',
  },
  {
    brand: 'Saxenda',
    drug: 'Liraglutide',
    body1:
      'Liraglutide is a GLP-1 medication FDA-approved for weight loss in 2014.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Saxenda will lose 8% of their body weight over a year.',
  },
  {
    brand: 'Victoza',
    drug: 'Liraglutide',
    body1:
      'Victoza (liraglutide) is a GLP-1 medication that is FDA-approved for type 2 diabetes. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Victoza will lose 3 to 5% of their body weight over a year.',
  },
  {
    brand: 'Metformin',
    drug: '',
    body1:
      'Metformin is a non-GLP-1 medications that is FDA-approved for other conditions. It has also been proven effective when used off-label for weight loss.',
    body2:
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    body3:
      'Most patients who use Metformin will lose 2 to 5% of their body weight over a year.',
  },
  {
    brand: 'Semaglutide',
    drug: '',
    body1:
      'Semaglutide is the generic name for Wegovy and Ozempic. Patients taking Semaglutide have been shown to lose 14.9% of body weight on average over 64 weeks*.',
    body2: `As a ${siteName} weight loss member we offer access to a compounded form of Semaglutide if prescribed**.`,
    body3:
      'You can get Semaglutide for as little as $151/month including shipping and all medical supplies.',
    disclaimers: [
      '*When used in combination with a restricted calorie diet and exercise program',
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
    ],
  },
  {
    brand: 'Tirzepatide',
    drug: '',
    body1:
      'Tirzapatide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2022. It has also been proven effective when used off-label for weight loss.',
    body2: `As a ${siteName} Weight Loss member, you have access to a compounded form of Tirzepatide if prescribed**. `,
    body3:
      'Your first month of Tirzepatide is generally around $300 for your first month. This may vary based on dosage.',
    disclaimers: [
      '*When used in combination with a restricted calorie diet and exercise program',
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
    ],
  },
];

export const compoundFirstMedicationsCASpanish = [
  {
    brand: 'Semaglutida',
    drug: '',
    body1:
      'Semaglutida es el nombre genérico de Wegovy y Ozempic. Se ha demostrado que los pacientes que toman Semaglutida pierden un promedio del 14,9% del peso corporal en 64 semanas*.',
    body2: `Como miembro del programa de pérdida de peso de ${siteName}, ofrecemos acceso a una forma compuesta de Semaglutida si se prescribe**.`,
    body3:
      'Puede obtener Semaglutida por tan solo $151 al mes, incluyendo el envío y todos los suministros médicos.',
    disclaimers: [
      '*Cuando se usa en combinación con una dieta restringida en calorías y un programa de ejercicios',
      '**Las formulaciones compuestas no están aprobadas por la FDA y pueden no producir los mismos resultados que las formulaciones disponibles comercialmente.',
    ],
  },
  {
    brand: 'Tirzepatida',
    drug: '',
    body1:
      'Tirzepatida es el nombre genérico de Mounjaro y Zepbound.\n\nSe ha demostrado que los pacientes que toman Tirzepatida pierden en promedio el 20% de su peso corporal en 72 semanas*.',
    body2: `Como miembro del programa de pérdida de peso de ${siteName}, tiene acceso a una forma compuesta de Tirzepatida si se prescribe**.`,
    body3:
      'El costo mensual de este medicamento puede ser tan bajo como $216 por mes.',
    disclaimers: [
      '*Cuando se usa en combinación con una dieta restringida en calorías y un programa de ejercicios',
      '**Las formulaciones compuestas no están aprobadas por la FDA y pueden no producir los mismos resultados que las formulaciones disponibles comercialmente.',
    ],
  },
  {
    brand: 'Zepbound',
    drug: 'Tirzepatida',
    body1:
      'Zepbound (tirzepatida) es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2023.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Zepbound perderán el 25% de su peso corporal en un año.',
  },
  {
    brand: 'Wegovy',
    drug: 'Semaglutida',
    body1:
      'Wegovy (semaglutida) es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2021.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Wegovy perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutida',
    body1:
      'Semaglutida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2017. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Ozempic perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatida',
    body1:
      'Tirzepatida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2022. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Mounjaro perderán el 20% de su peso corporal en un año.',
  },
  {
    brand: 'Saxenda',
    drug: 'Liraglutida',
    body1:
      'Liraglutida es un medicamento GLP-1 aprobado por la FDA para la pérdida de peso en 2014.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Saxenda perderán el 8% de su peso corporal en un año.',
  },
  {
    brand: 'Victoza',
    drug: 'Liraglutida',
    body1:
      'Victoza (liraglutida) es un medicamento GLP-1 que está aprobado por la FDA para la diabetes tipo 2. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Victoza perderán del 3 al 5% de su peso corporal en un año.',
  },
  {
    brand: 'Metformina',
    drug: '',
    body1:
      'Metformina es un medicamento no GLP-1 que está aprobado por la FDA para otras condiciones. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'El costo del medicamento se incluirá en su membresía si se envía a través de nuestra farmacia asociada de pedidos por correo.',
    body3:
      'La mayoría de los pacientes que usan Metformina perderán del 2 al 5% de su peso corporal en un año.',
  },
  {
    brand: 'Semaglutida',
    drug: '',
    body1:
      'Semaglutida es el nombre genérico de Wegovy y Ozempic. Se ha demostrado que los pacientes que toman Semaglutida pierden un promedio del 14,9% del peso corporal en 64 semanas*.',
    body2: `Como miembro del programa de pérdida de peso de ${siteName}, ofrecemos acceso a una forma compuesta de Semaglutida si se prescribe**.`,
    body3:
      'Puede obtener Semaglutida por tan solo $151 al mes, incluyendo el envío y todos los suministros médicos.',
    disclaimers: [
      '*Cuando se usa en combinación con una dieta restringida en calorías y un programa de ejercicios',
      '**Las formulaciones compuestas no están aprobadas por la FDA y pueden no producir los mismos resultados que las formulaciones disponibles comercialmente.',
    ],
  },
  {
    brand: 'Tirzepatida',
    drug: '',
    body1:
      'Tirzepatida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2022. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2: `Como miembro del programa de pérdida de peso de ${siteName}, tiene acceso a una forma compuesta de Tirzepatida si se prescribe**.`,
    body3:
      'Su primer mes de Tirzepatida generalmente cuesta alrededor de $300. Esto puede variar según la dosis.',
    disclaimers: [
      '*Cuando se usa en combinación con una dieta restringida en calorías y un programa de ejercicios',
      '**Las formulaciones compuestas no están aprobadas por la FDA y pueden no producir los mismos resultados que las formulaciones disponibles comercialmente.',
    ],
  },
];

export const compoundMedications = [
  {
    brand: 'Semaglutide',
    drug: '',
    body1:
      'Semaglutide is the generic name for Wegovy and Ozempic. Patients taking Semaglutide have been shown to lose 14.9% of body weight on average over 64 weeks*.',
    body2: `As a ${siteName} weight loss member we offer access to a compounded form of Semaglutide if prescribed**.`,
    body3:
      'The monthly cost of this medication can be as low as $151 per month.',
    body3V2:
      'The monthly cost of this medication can be as low as $183 per month.',
    disclaimers: [
      '*When used in combination with a restricted calorie diet and exercise program',
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
    ],
  },
  {
    brand: 'Tirzepatide',
    drug: '',
    body1:
      'Tirzepatide is the generic name for Mounjaro and Zepbound.\n\nPatients taking Tirzepatide have been shown to lose on average 20% of their body weight over 72 weeks*. ',
    body2: `As a ${siteName} Weight Loss member, you have access to a compounded form of Tirzepatide if prescribed**. `,
    body3:
      'The monthly cost of this medication can be as low as $216 per month.',
    body3V2:
      'The monthly cost of this medication can be as low as $333 per month.',
    disclaimers: [
      '*When used in combination with a restricted calorie diet and exercise program',
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
    ],
  },
  {
    brand: 'Oral Semaglutide',
    drug: '',
    body1:
      'Semaglutide has the same active ingredient as Ozempic and Rybelsius.',
    body2: `As a ${siteName} weight loss member we offer access to a compounded form of Oral Semaglutide if prescribed**.`,
    body3:
      'The monthly cost of this medication can be as low as $151 per month. (same asterisks as below at the bottom of the screen)',
    body3V2: '',
    disclaimers: [
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
    ],
  },
];
export const compoundMedicationsCA = [
  {
    brand: 'Semaglutide',
    drug: '',
    body1:
      'Semaglutide is the generic name for Wegovy and Ozempic. Patients taking Semaglutide have been shown to lose 14.9% of body weight on average over 64 weeks*.',
    body2: `As a ${siteName} weight loss member we offer access to a compounded form of Semaglutide if prescribed**.`,
    body3:
      'You can get Semaglutide for as little as $151/month including shipping and all medical supplies.',
    disclaimers: [
      '*When used in combination with a restricted calorie diet and exercise program',
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
    ],
  },
];
export const compoundMedicationsTirzepatide = [
  {
    brand: 'Tirzepatide',
    drug: '',
    body1:
      'Tirzepatide is the generic name for Mounjaro and Zepbound.\n\nPatients taking Tirzepatide have been shown to lose on average 20% of their body weight over 72 weeks*. ',
    body2: `As a ${siteName} Weight Loss member, you have access to a compounded form of Tirzepatide if prescribed**. `,
    body3:
      'The monthly cost of this medication can be as low as $216 per month.',
    body3V2:
      'The monthly cost of this medication can be as low as $333 per month.',
    disclaimers: [
      '*When used in combination with a restricted calorie diet and exercise program',
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
    ],
  },
  {
    brand: 'Semaglutide',
    drug: '',
    body1:
      'Semaglutide is the generic name for Wegovy and Ozempic. Patients taking Semaglutide have been shown to lose 14.9% of body weight on average over 64 weeks*.',
    body2: `As a ${siteName} weight loss member we offer access to a compounded form of Semaglutide if prescribed**.`,
    body3:
      'The monthly cost of this medication can be as low as $151 per month.',
    body3V2:
      'The monthly cost of this medication can be as low as $183 per month.',
    disclaimers: [
      '*When used in combination with a restricted calorie diet and exercise program',
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
    ],
  },
];

export const compoundMedicationsTirzepatideSpanish = [
  {
    brand: 'Tirzepatida',
    drug: '',
    body1:
      'Tirzepatida es el nombre genérico de Mounjaro y Zepbound.\n\nSe ha demostrado que los pacientes que toman Tirzepatida pierden en promedio el 20% de su peso corporal en 72 semanas*.',
    body2: `Como miembro del programa de pérdida de peso de ${siteName}, tiene acceso a una forma compuesta de Tirzepatida si se prescribe**.`,
    body3:
      'El costo mensual de este medicamento puede ser tan bajo como $216 por mes.',
    body3V2:
      'El costo mensual de este medicamento puede ser tan bajo como $333 por mes.',
    disclaimers: [
      '*Cuando se usa en combinación con una dieta restringida en calorías y un programa de ejercicios',
      '**Las formulaciones compuestas no están aprobadas por la FDA y pueden no producir los mismos resultados que las formulaciones disponibles comercialmente.',
    ],
  },
  {
    brand: 'Semaglutida',
    drug: '',
    body1:
      'Semaglutida es el nombre genérico de Wegovy y Ozempic. Se ha demostrado que los pacientes que toman Semaglutida pierden un promedio del 14,9% del peso corporal en 64 semanas*.',
    body2: `Como miembro del programa de pérdida de peso de ${siteName}, ofrecemos acceso a una forma compuesta de Semaglutida si se prescribe**.`,
    body3:
      'El costo mensual de este medicamento puede ser tan bajo como $151 por mes.',
    body3V2:
      'El costo mensual de este medicamento puede ser tan bajo como $183 por mes.',
    disclaimers: [
      '*Cuando se usa en combinación con una dieta restringida en calorías y un programa de ejercicios',
      '**Las formulaciones compuestas no están aprobadas por la FDA y pueden no producir los mismos resultados que las formulaciones disponibles comercialmente.',
    ],
  },
];

export const compoundMedicationsTirzepatideCA = [
  {
    brand: 'Tirzepatide',
    drug: '',
    body1:
      'Tirzepatide is the generic name for Mounjaro and Zepbound.\n\nPatients taking Tirzepatide have been shown to lose on average 20% of their body weight over 72 weeks*. ',
    body2: `As a ${siteName} Weight Loss member, you have access to a compounded form of Tirzepatide if prescribed**. `,
    body3:
      'The monthly cost of this medication can be as low as $216 per month.',
    disclaimers: [
      '*When used in combination with a restricted calorie diet and exercise program',
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
    ],
  },
  {
    brand: 'Semaglutide',
    drug: '',
    body1:
      'Semaglutide is the generic name for Wegovy and Ozempic. Patients taking Semaglutide have been shown to lose 14.9% of body weight on average over 64 weeks*.',
    body2: `As a ${siteName} weight loss member we offer access to a compounded form of Semaglutide if prescribed**.`,
    body3:
      'You can get Semaglutide for as little as $151/month including shipping and all medical supplies.',
    disclaimers: [
      '*When used in combination with a restricted calorie diet and exercise program',
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
    ],
  },
];

export const compoundMedicationsTirzepatideCASpanish = [
  {
    brand: 'Tirzepatida',
    drug: '',
    body1:
      'Tirzepatida es el nombre genérico de Mounjaro y Zepbound.\n\nSe ha demostrado que los pacientes que toman Tirzepatida pierden en promedio el 20% de su peso corporal en 72 semanas*.',
    body2: `Como miembro del programa de pérdida de peso de ${siteName}, tiene acceso a una forma compuesta de Tirzepatida si se prescribe**.`,
    body3:
      'El costo mensual de este medicamento puede ser tan bajo como $216 por mes.',
    disclaimers: [
      '*Cuando se usa en combinación con una dieta restringida en calorías y un programa de ejercicios',
      '**Las formulaciones compuestas no están aprobadas por la FDA y pueden no producir los mismos resultados que las formulaciones disponibles comercialmente.',
    ],
  },
  {
    brand: 'Semaglutida',
    drug: '',
    body1:
      'Semaglutida es el nombre genérico de Wegovy y Ozempic. Se ha demostrado que los pacientes que toman Semaglutida pierden un promedio del 14,9% del peso corporal en 64 semanas*.',
    body2: `Como miembro del programa de pérdida de peso de ${siteName}, ofrecemos acceso a una forma compuesta de Semaglutida si se prescribe**.`,
    body3:
      'Puede obtener Semaglutida por tan solo $151 al mes, incluyendo el envío y todos los suministros médicos.',
    disclaimers: [
      '*Cuando se usa en combinación con una dieta restringida en calorías y un programa de ejercicios',
      '**Las formulaciones compuestas no están aprobadas por la FDA y pueden no producir los mismos resultados que las formulaciones disponibles comercialmente.',
    ],
  },
];

export const nonGLP1Eligible = [
  {
    brand: 'Metformin',
    drug: '',
    body1:
      'Metformin is a non-GLP-1 medications that is FDA-approved for other conditions. It has also been proven effective when used off-label for weight loss.',
    body2:
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    body3:
      'Most patients who use Metformin will lose 2 to 5% of their body weight over a year.',
  },
  {
    brand: 'Zepbound',
    drug: 'Tirzepatide',
    body1:
      'Zepbound (tirzepatide) is a GLP-1 medication that was FDA-approved for weight loss in 2023.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Zepbound will lose 25% of their body weight over a year.',
  },
  {
    brand: 'Wegovy',
    drug: 'Semaglutide',
    body1:
      'Wegovy (semaglutide) is a GLP-1 medication that was FDA-approved for weight loss in 2021.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Wegovy will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutide',
    body1:
      'Semaglutide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2017. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Ozempic will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatide',
    body1:
      'Tirzapatide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2022. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Mounjaro will lose 20% of their body weight over a year.',
  },
  {
    brand: 'Saxenda',
    drug: 'Liraglutide',
    body1:
      'Liraglutide is a GLP-1 medication FDA-approved for weight loss in 2014.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Saxenda will lose 8% of their body weight over a year.',
  },
  {
    brand: 'Victoza',
    drug: 'Liraglutide',
    body1:
      'Victoza (liraglutide) is a GLP-1 medication that is FDA-approved for type 2 diabetes. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Victoza will lose 3 to 5% of their body weight over a year.',
  },
];

export const nonGLP1EligibleSpanish = [
  {
    brand: 'Metformina',
    drug: '',
    body1:
      'Metformina es un medicamento no GLP-1 que está aprobado por la FDA para otras condiciones. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'El costo del medicamento se incluirá en su membresía si se envía a través de nuestra farmacia asociada de pedidos por correo.',
    body3:
      'La mayoría de los pacientes que usan Metformina perderán del 2 al 5% de su peso corporal en un año.',
  },
  {
    brand: 'Zepbound',
    drug: 'Tirzepatide',
    body1:
      'Zepbound (tirzepatida) es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2023.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Zepbound perderán el 25% de su peso corporal en un año.',
  },
  {
    brand: 'Wegovy',
    drug: 'Semaglutide',
    body1:
      'Wegovy (semaglutida) es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2021.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Wegovy perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutide',
    body1:
      'Semaglutida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2017. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Ozempic perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatide',
    body1:
      'Tirzepatida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2022. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Mounjaro perderán el 20% de su peso corporal en un año.',
  },
  {
    brand: 'Saxenda',
    drug: 'Liraglutide',
    body1:
      'Liraglutida es un medicamento GLP-1 aprobado por la FDA para la pérdida de peso en 2014.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Saxenda perderán el 8% de su peso corporal en un año.',
  },
  {
    brand: 'Victoza',
    drug: 'Liraglutide',
    body1:
      'Victoza (liraglutida) es un medicamento GLP-1 que está aprobado por la FDA para la diabetes tipo 2. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Victoza perderán del 3 al 5% de su peso corporal en un año.',
  },
];

export const medicationsWithCompoundVictozaFirst = [
  {
    brand: 'Victoza',
    drug: 'Liraglutide',
    body1: `Victoza is a GLP-1 medication primarily FDA-approved for managing type 2 diabetes, but it’s also used off-label for weight loss in some cases. While ${siteName} has had some success obtaining prior authorizations for insurance coverage of Victoza for weight management, it’s important to note that coverage may vary as Victoza is not specifically approved for weight loss.`,
    body2:
      'If your insurance denies coverage, you’ll have the option to explore other medications or pay out of pocket. Weight loss results with Victoza can vary, but some patients experience a reduction in body weight with continued use and lifestyle changes.',
  },
  {
    brand: 'Wegovy',
    drug: 'Semaglutide',
    body1: `Wegovy (semaglutide) is a GLP-1 medication that was FDA-approved for weight loss in 2021. Among all GLP-1 medications, ${siteName} has experienced the highest rate of success getting prior authorizations for insurance to cover Wegovy, so it highly recommended for those with insurance.`,
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Wegovy will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Zepbound',
    drug: 'Tirzepatide',
    body1:
      'Zepbound (tirzepatide) is a GLP-1 medication that was FDA-approved for weight loss in 2023.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Zepbound will lose 25% of their body weight over a year.',
  },
  {
    brand: 'Semaglutide',
    drug: '',
    body1:
      'Semaglutide is the generic name for Wegovy and Ozempic. Patients taking Semaglutide have been shown to lose 14.9% of body weight on average over 64 weeks*.',
    body2: `As a ${siteName} weight loss member we offer access to a compounded form of Semaglutide if prescribed**.`,
    body3:
      'The monthly cost of this medication can be as low as $151 per month.',
    body3V2:
      'The monthly cost of this medication can be as low as $183 per month.',
    disclaimers: [
      '*When used in combination with a restricted calorie diet and exercise program',
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
    ],
  },
  {
    brand: 'Tirzepatide',
    drug: '',
    body1:
      'Tirzepatide is the generic name for Mounjaro and Zepbound.\n\nPatients taking Tirzepatide have been shown to lose on average 20% of their body weight over 72 weeks*. ',
    body2: `As a ${siteName} Weight Loss member, you have access to a compounded form of Tirzepatide if prescribed**. `,
    body3:
      'The monthly cost of this medication can be as low as $216 per month.',
    body3V2:
      'The monthly cost of this medication can be as low as $333 per month.',
    disclaimers: [
      '*When used in combination with a restricted calorie diet and exercise program',
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
    ],
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutide',
    body1:
      'Semaglutide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2017. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Ozempic will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatide',
    body1:
      'Tirzapatide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2022. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Mounjaro will lose 20% of their body weight over a year.',
  },
  {
    brand: 'Saxenda',
    drug: 'Liraglutide',
    body1:
      'Liraglutide is a GLP-1 medication FDA-approved for weight loss in 2014.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Saxenda will lose 8% of their body weight over a year.',
  },
  {
    brand: 'Bupropion and Naltrexone',
    drug: '',
    body1:
      'Bupropion and naltrexone are non-GLP-1 medications that are FDA-approved for other conditions. They have also been proven effective when used off-label for weight loss.',
    body2:
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    body3:
      'Most patients who use Bupropion and Naltrexone will lose 5 to 8% of their body weight over a year.',
  },
  {
    brand: 'Metformin',
    drug: '',
    body1:
      'Metformin is a non-GLP-1 medications that is FDA-approved for other conditions. It has also been proven effective when used off-label for weight loss.',
    body2:
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    body3:
      'Most patients who use Metformin will lose 2 to 5% of their body weight over a year.',
  },
];

export const medicationsWithCompoundVictozaFirstSpanish = [
  {
    brand: 'Victoza',
    drug: 'Liraglutida',
    body1: `Victoza es un medicamento GLP-1 aprobado principalmente por la FDA para el manejo de la diabetes tipo 2, pero también se usa fuera de indicación para la pérdida de peso en algunos casos. Aunque ${siteName} ha tenido cierto éxito obteniendo autorizaciones previas para la cobertura de seguros de Victoza para el manejo del peso, es importante tener en cuenta que la cobertura puede variar ya que Victoza no está específicamente aprobado para la pérdida de peso.`,
    body2:
      'Si su seguro niega la cobertura, tendrá la opción de explorar otros medicamentos o pagar de su bolsillo. Los resultados de pérdida de peso con Victoza pueden variar, pero algunos pacientes experimentan una reducción del peso corporal con el uso continuo y cambios en el estilo de vida.',
  },
  {
    brand: 'Wegovy',
    drug: 'Semaglutida',
    body1: `Wegovy (semaglutida) es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2021. Entre todos los medicamentos GLP-1, ${siteName} ha experimentado la tasa más alta de éxito en obtener autorizaciones previas para que el seguro cubra Wegovy, por lo que es altamente recomendado para aquellos con seguro.`,
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Wegovy perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Zepbound',
    drug: 'Tirzepatida',
    body1:
      'Zepbound (tirzepatida) es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2023.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Zepbound perderán el 25% de su peso corporal en un año.',
  },
  {
    brand: 'Semaglutida',
    drug: '',
    body1:
      'Semaglutida es el nombre genérico de Wegovy y Ozempic. Se ha demostrado que los pacientes que toman Semaglutida pierden un promedio del 14,9% del peso corporal en 64 semanas*.',
    body2: `Como miembro del programa de pérdida de peso de ${siteName}, ofrecemos acceso a una forma compuesta de Semaglutida si se prescribe**.`,
    body3:
      'El costo mensual de este medicamento puede ser tan bajo como $151 por mes.',
    body3V2:
      'El costo mensual de este medicamento puede ser tan bajo como $183 por mes.',
    disclaimers: [
      '*Cuando se usa en combinación con una dieta restringida en calorías y un programa de ejercicios',
      '**Las formulaciones compuestas no están aprobadas por la FDA y pueden no producir los mismos resultados que las formulaciones disponibles comercialmente.',
    ],
  },
  {
    brand: 'Tirzepatida',
    drug: '',
    body1:
      'Tirzepatida es el nombre genérico de Mounjaro y Zepbound.\n\nSe ha demostrado que los pacientes que toman Tirzepatida pierden en promedio el 20% de su peso corporal en 72 semanas*.',
    body2: `Como miembro del programa de pérdida de peso de ${siteName}, tiene acceso a una forma compuesta de Tirzepatida si se prescribe**.`,
    body3:
      'El costo mensual de este medicamento puede ser tan bajo como $216 por mes.',
    body3V2:
      'El costo mensual de este medicamento puede ser tan bajo como $333 por mes.',
    disclaimers: [
      '*Cuando se usa en combinación con una dieta restringida en calorías y un programa de ejercicios',
      '**Las formulaciones compuestas no están aprobadas por la FDA y pueden no producir los mismos resultados que las formulaciones disponibles comercialmente.',
    ],
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutida',
    body1:
      'Semaglutida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2017. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Ozempic perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatida',
    body1:
      'Tirzepatida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2022. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Mounjaro perderán el 20% de su peso corporal en un año.',
  },
  {
    brand: 'Saxenda',
    drug: 'Liraglutida',
    body1:
      'Liraglutida es un medicamento GLP-1 aprobado por la FDA para la pérdida de peso en 2014.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Saxenda perderán el 8% de su peso corporal en un año.',
  },
  {
    brand: 'Bupropión y Naltrexona',
    drug: '',
    body1:
      'Bupropión y naltrexona son medicamentos no GLP-1 que están aprobados por la FDA para otras condiciones. También han demostrado ser efectivos cuando se usan fuera de indicación para la pérdida de peso.',
    body2:
      'El costo del medicamento se incluirá en su membresía si se envía a través de nuestra farmacia asociada de pedidos por correo.',
    body3:
      'La mayoría de los pacientes que usan Bupropión y Naltrexona perderán del 5 al 8% de su peso corporal en un año.',
  },
  {
    brand: 'Metformina',
    drug: '',
    body1:
      'Metformina es un medicamento no GLP-1 que está aprobado por la FDA para otras condiciones. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'El costo del medicamento se incluirá en su membresía si se envía a través de nuestra farmacia asociada de pedidos por correo.',
    body3:
      'La mayoría de los pacientes que usan Metformina perderán del 2 al 5% de su peso corporal en un año.',
  },
];

export const medicationsWithCompoundSaxendaFirst = [
  {
    brand: 'Saxenda',
    drug: 'Liraglutide',
    body1: `Saxenda is a GLP-1 medication that has been FDA-approved for weight loss. ${siteName} has had success obtaining prior authorizations for insurance to cover Saxenda, making it a strong recommendation for those with insurance.`,
    body2:
      'If your insurance denies coverage, you’ll have the option to try other medications or pay out of pocket. Most patients using Saxenda will lose around 10-15% of their body weight over a year.',
  },
  {
    brand: 'Wegovy',
    drug: 'Semaglutide',
    body1: `Wegovy (semaglutide) is a GLP-1 medication that was FDA-approved for weight loss in 2021. Among all GLP-1 medications, ${siteName} has experienced the highest rate of success getting prior authorizations for insurance to cover Wegovy, so it highly recommended for those with insurance.`,
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Wegovy will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Zepbound',
    drug: 'Tirzepatide',
    body1:
      'Zepbound (tirzepatide) is a GLP-1 medication that was FDA-approved for weight loss in 2023.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Zepbound will lose 25% of their body weight over a year.',
  },
  {
    brand: 'Semaglutide',
    drug: '',
    body1:
      'Semaglutide is the generic name for Wegovy and Ozempic. Patients taking Semaglutide have been shown to lose 14.9% of body weight on average over 64 weeks*.',
    body2: `As a ${siteName} weight loss member we offer access to a compounded form of Semaglutide if prescribed**.`,
    body3:
      'The monthly cost of this medication can be as low as $151 per month.',
    body3V2:
      'The monthly cost of this medication can be as low as $183 per month.',
    disclaimers: [
      '*When used in combination with a restricted calorie diet and exercise program',
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
    ],
  },
  {
    brand: 'Tirzepatide',
    drug: '',
    body1:
      'Tirzepatide is the generic name for Mounjaro and Zepbound.\n\nPatients taking Tirzepatide have been shown to lose on average 20% of their body weight over 72 weeks*. ',
    body2: `As a ${siteName} Weight Loss member, you have access to a compounded form of Tirzepatide if prescribed**. `,
    body3:
      'The monthly cost of this medication can be as low as $216 per month.',
    body3V2:
      'The monthly cost of this medication can be as low as $333 per month.',
    disclaimers: [
      '*When used in combination with a restricted calorie diet and exercise program',
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
    ],
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutide',
    body1:
      'Semaglutide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2017. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Ozempic will lose 15% of their body weight over a year.',
  },
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatide',
    body1:
      'Tirzapatide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2022. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Mounjaro will lose 20% of their body weight over a year.',
  },
  {
    brand: 'Victoza',
    drug: 'Liraglutide',
    body1:
      'Victoza (liraglutide) is a GLP-1 medication that is FDA-approved for type 2 diabetes. It has also been proven effective when used off-label for weight loss.',
    body2:
      'You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket. Most patients who use Victoza will lose 3 to 5% of their body weight over a year.',
  },
  {
    brand: 'Bupropion and Naltrexone',
    drug: '',
    body1:
      'Bupropion and naltrexone are non-GLP-1 medications that are FDA-approved for other conditions. They have also been proven effective when used off-label for weight loss.',
    body2:
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    body3:
      'Most patients who use Bupropion and Naltrexone will lose 5 to 8% of their body weight over a year.',
  },
  {
    brand: 'Metformin',
    drug: '',
    body1:
      'Metformin is a non-GLP-1 medications that is FDA-approved for other conditions. It has also been proven effective when used off-label for weight loss.',
    body2:
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    body3:
      'Most patients who use Metformin will lose 2 to 5% of their body weight over a year.',
  },
];

export const medicationsWithCompoundSaxendaFirstSpanish = [
  {
    brand: 'Saxenda',
    drug: 'Liraglutida',
    body1: `Saxenda es un medicamento GLP-1 que ha sido aprobado por la FDA para la pérdida de peso. ${siteName} ha tenido éxito obteniendo autorizaciones previas para que los seguros cubran Saxenda, lo que lo convierte en una recomendación sólida para aquellos con seguro.`,
    body2:
      'Si su seguro niega la cobertura, tendrá la opción de probar otros medicamentos o pagar de su bolsillo. La mayoría de los pacientes que usan Saxenda perderán alrededor del 10-15% de su peso corporal en un año.',
  },
  {
    brand: 'Wegovy',
    drug: 'Semaglutida',
    body1: `Wegovy (semaglutida) es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2021. Entre todos los medicamentos GLP-1, ${siteName} ha experimentado la tasa más alta de éxito en obtener autorizaciones previas para que el seguro cubra Wegovy, por lo que es altamente recomendado para aquellos con seguro.`,
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Wegovy perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Zepbound',
    drug: 'Tirzepatida',
    body1:
      'Zepbound (tirzepatida) es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2023.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Zepbound perderán el 25% de su peso corporal en un año.',
  },
  {
    brand: 'Semaglutida',
    drug: '',
    body1:
      'Semaglutida es el nombre genérico de Wegovy y Ozempic. Se ha demostrado que los pacientes que toman Semaglutida pierden un promedio del 14,9% del peso corporal en 64 semanas*.',
    body2: `Como miembro del programa de pérdida de peso de ${siteName}, ofrecemos acceso a una forma compuesta de Semaglutida si se prescribe**.`,
    body3:
      'El costo mensual de este medicamento puede ser tan bajo como $151 por mes.',
    body3V2:
      'El costo mensual de este medicamento puede ser tan bajo como $183 por mes.',
    disclaimers: [
      '*Cuando se usa en combinación con una dieta restringida en calorías y un programa de ejercicios',
      '**Las formulaciones compuestas no están aprobadas por la FDA y pueden no producir los mismos resultados que las formulaciones disponibles comercialmente.',
    ],
  },
  {
    brand: 'Tirzepatida',
    drug: '',
    body1:
      'Tirzepatida es el nombre genérico de Mounjaro y Zepbound.\n\nSe ha demostrado que los pacientes que toman Tirzepatida pierden en promedio el 20% de su peso corporal en 72 semanas*.',
    body2: `Como miembro del programa de pérdida de peso de ${siteName}, tiene acceso a una forma compuesta de Tirzepatida si se prescribe**.`,
    body3:
      'El costo mensual de este medicamento puede ser tan bajo como $216 por mes.',
    body3V2:
      'El costo mensual de este medicamento puede ser tan bajo como $333 por mes.',
    disclaimers: [
      '*Cuando se usa en combinación con una dieta restringida en calorías y un programa de ejercicios',
      '**Las formulaciones compuestas no están aprobadas por la FDA y pueden no producir los mismos resultados que las formulaciones disponibles comercialmente.',
    ],
  },
  {
    brand: 'Ozempic',
    drug: 'Semaglutida',
    body1:
      'Semaglutida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2017. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Ozempic perderán el 15% de su peso corporal en un año.',
  },
  {
    brand: 'Mounjaro',
    drug: 'Tirzepatida',
    body1:
      'Tirzepatida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2022. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Mounjaro perderán el 20% de su peso corporal en un año.',
  },
  {
    brand: 'Victoza',
    drug: 'Liraglutida',
    body1:
      'Victoza (liraglutida) es un medicamento GLP-1 que está aprobado por la FDA para la diabetes tipo 2. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo. La mayoría de los pacientes que usan Victoza perderán del 3 al 5% de su peso corporal en un año.',
  },
  {
    brand: 'Bupropión y Naltrexona',
    drug: '',
    body1:
      'Bupropión y naltrexona son medicamentos no GLP-1 que están aprobados por la FDA para otras condiciones. También han demostrado ser efectivos cuando se usan fuera de indicación para la pérdida de peso.',
    body2:
      'El costo del medicamento se incluirá en su membresía si se envía a través de nuestra farmacia asociada de pedidos por correo.',
    body3:
      'La mayoría de los pacientes que usan Bupropión y Naltrexona perderán del 5 al 8% de su peso corporal en un año.',
  },
  {
    brand: 'Metformina',
    drug: '',
    body1:
      'Metformina es un medicamento no GLP-1 que está aprobado por la FDA para otras condiciones. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    body2:
      'El costo del medicamento se incluirá en su membresía si se envía a través de nuestra farmacia asociada de pedidos por correo.',
    body3:
      'La mayoría de los pacientes que usan Metformina perderán del 2 al 5% de su peso corporal en un año.',
  },
];

export const compoundDetails: {
  [key: string]: {
    saving: number;
    ohioSaving?: number;
    medicareAccessSaving?: number;
    price: number;
    discountedPrice: number;
    ohioTitle: string;
    title: string;
    singleTitle: string;
    dosage: string;
    singleDosage: string;
    name: string;
    medicareAccessBody1?: string;
    body1: string;
    body2: string;
  };
} = {
  Semaglutide: {
    saving: 150,
    ohioSaving: 96,
    medicareAccessSaving: 128,
    price: 189,
    discountedPrice: 163,
    ohioTitle: 'Buy 3 month supply of medication',
    title: 'Buy 3 month supply of medication & get 20% off for a limited time',
    singleTitle: 'Buy 1 month supply of medication',
    medicareAccessBody1:
      'Additionally, you’ll get 20% off the next 2 months of your weight loss membership. This means your next 2 months of membership will be just $63/month.',
    dosage: '8.5 mg vial (3 vials included in shipment - 1 mg, 2.5 mg, 5 mg)',
    singleDosage: '1 mg vial',
    name: 'Semaglutide',
    body1:
      'Additionally, you’ll get 20% off the next 2 months of your weight loss membership. This means your next 2 months of membership will be just $108/month.',
    body2: `In order to receive a 3 month supply of your medication, you will need to pay for your next 2 months of your membership because your ${siteName} provider will need to be able to monitor your care over the next 3 months at least.`,
  },
  Tirzepatide: {
    saving: 207,
    ohioSaving: 153,
    medicareAccessSaving: 185,
    price: 250,
    discountedPrice: 199,
    ohioTitle: 'Buy 3 month supply of medication',
    title: 'Buy 3 month supply of medication & get 20% off for a limited time',
    singleTitle: 'Buy 1 month supply of medication',
    dosage: '60 mg vial (3 vials included in shipment - 20 mg, 20 mg, 20 mg)',
    singleDosage: '10 mg vial',
    name: 'Tirzepatide',
    medicareAccessBody1:
      'Additionally, you’ll get 20% off the next 2 months of your weight loss membership. This means your next 2 months of membership will be just $63/month.',
    body1:
      'Additionally, you’ll get 20% off the next 2 months of your weight loss membership. This means your next 2 months of membership will be just $108/month.',
    body2: `In order to receive a 3 month supply of your medication, you will need to pay for your next 2 months of your membership because your ${siteName} provider will need to be able to monitor your care over the next 3 months at least.`,
  },
  Liraglutide: {
    saving: 84,
    price: 375,
    discountedPrice: 360,
    ohioTitle: 'Buy 3 month supply of medication',
    title: 'Buy 3 month supply of medication & get 20% off for a limited time',
    singleTitle: 'Buy 1 month supply of medication',
    dosage: '90 mg vial',
    singleDosage: '50 mg vial',
    name: 'Liraglutide',
    body1:
      'Additionally, you’ll get 20% off the next 2 months of your weight loss membership. This means your next 2 months of membership will be just $108/month.',
    body2: `In order to receive a 3 month supply of your medication, you will need to pay for your next 2 months of your membership because your ${siteName} provider will need to be able to monitor your care over the next 3 months at least.`,
  },
};

export const compoundDetailsSpanish: {
  [key: string]: {
    saving: number;
    ohioSaving?: number;
    medicareAccessSaving?: number;
    price: number;
    discountedPrice: number;
    ohioTitle: string;
    title: string;
    singleTitle: string;
    dosage: string;
    singleDosage: string;
    name: string;
    medicareAccessBody1?: string;
    body1: string;
    body2: string;
  };
} = {
  Semaglutida: {
    saving: 150,
    ohioSaving: 96,
    medicareAccessSaving: 128,
    price: 189,
    discountedPrice: 163,
    ohioTitle: 'Compre un suministro de medicamento para 3 meses',
    title:
      'Compre un suministro de medicamento para 3 meses y obtenga un 20% de descuento por tiempo limitado',
    singleTitle: 'Compre un suministro de medicamento para 1 mes',
    medicareAccessBody1:
      'Además, obtendrá un 20% de descuento en los próximos 2 meses de su membresía para pérdida de peso. Esto significa que sus próximos 2 meses de membresía costarán solo $63/mes.',
    dosage:
      'Vial de 8.5 mg (3 viales incluidos en el envío - 1 mg, 2.5 mg, 5 mg)',
    singleDosage: 'Vial de 1 mg',
    name: 'Semaglutida',
    body1:
      'Además, obtendrá un 20% de descuento en los próximos 2 meses de su membresía para pérdida de peso. Esto significa que sus próximos 2 meses de membresía costarán solo $108/mes.',
    body2: `Para recibir un suministro de medicamento para 3 meses, deberá pagar los próximos 2 meses de su membresía porque su proveedor de ${siteName} necesitará poder monitorear su atención durante los próximos 3 meses como mínimo.`,
  },
  Tirzepatida: {
    saving: 207,
    ohioSaving: 153,
    medicareAccessSaving: 185,
    price: 250,
    discountedPrice: 199,
    ohioTitle: 'Compre un suministro de medicamento para 3 meses',
    title:
      'Compre un suministro de medicamento para 3 meses y obtenga un 20% de descuento por tiempo limitado',
    singleTitle: 'Compre un suministro de medicamento para 1 mes',
    dosage:
      'Vial de 60 mg (3 viales incluidos en el envío - 20 mg, 20 mg, 20 mg)',
    singleDosage: 'Vial de 10 mg',
    name: 'Tirzepatida',
    medicareAccessBody1:
      'Además, obtendrá un 20% de descuento en los próximos 2 meses de su membresía para pérdida de peso. Esto significa que sus próximos 2 meses de membresía costarán solo $63/mes.',
    body1:
      'Además, obtendrá un 20% de descuento en los próximos 2 meses de su membresía para pérdida de peso. Esto significa que sus próximos 2 meses de membresía costarán solo $108/mes.',
    body2: `Para recibir un suministro de medicamento para 3 meses, deberá pagar los próximos 2 meses de su membresía porque su proveedor de ${siteName} necesitará poder monitorear su atención durante los próximos 3 meses como mínimo.`,
  },
  Liraglutida: {
    saving: 84,
    price: 375,
    discountedPrice: 360,
    ohioTitle: 'Compre un suministro de medicamento para 3 meses',
    title:
      'Compre un suministro de medicamento para 3 meses y obtenga un 20% de descuento por tiempo limitado',
    singleTitle: 'Compre un suministro de medicamento para 1 mes',
    dosage: 'Vial de 90 mg',
    singleDosage: 'Vial de 50 mg',
    name: 'Liraglutida',
    body1:
      'Además, obtendrá un 20% de descuento en los próximos 2 meses de su membresía para pérdida de peso. Esto significa que sus próximos 2 meses de membresía costarán solo $108/mes.',
    body2: `Para recibir un suministro de medicamento para 3 meses, deberá pagar los próximos 2 meses de su membresía porque su proveedor de ${siteName} necesitará poder monitorear su atención durante los próximos 3 meses como mínimo.`,
  },
};

export const compoundCADetails: {
  [key: string]: {
    saving: number;
    ohioSaving?: number;
    medicareAccessSaving?: number;
    price: number;
    discountedPrice: number;
    ohioTitle: string;
    title: string;
    singleTitle: string;
    dosage: string;
    singleDosage: string;
    name: string;
    medicareAccessBody1?: string;
    body1: string;
    body2: string;
    singleBody1?: string;
  };
} = {
  Semaglutide: {
    saving: 419,
    ohioSaving: 96,
    medicareAccessSaving: 128,
    price: 275,
    discountedPrice: 200,
    ohioTitle: 'Buy 3 month supply of medication  ',
    title: 'Buy 3 month supply of medication & get 20% off for a limited time',
    singleTitle: 'Buy 6 week supply of medication',
    medicareAccessBody1:
      'Additionally, you’ll get 20% off the next 2 months of your weight loss membership. This means your next 2 months of membership will be just $63/month.',
    dosage: '10 mg (3 vials included in shipment - 2.5 mg, 2.5 mg, 5 mg)',
    singleDosage: '2.5 mg vial',
    name: 'Semaglutide',
    body1:
      'Additionally, you’ll get 20% off the next 2 months of your weight loss membership. This means your next 2 months of membership will be just $108/month.',
    body2: `In order to receive a 3 month supply of your medication, you will need to pay for your next 2 months of your membership because your ${siteName} provider will need to be able to monitor your care over the next 3 months at least.`,
    singleBody1:
      'This supply typically lasts for 6 weeks. This may vary depending on the dosage the provider prescribes.',
  },
  Tirzepatide: {
    saving: 304,
    ohioSaving: 153,
    medicareAccessSaving: 185,
    price: 300,
    discountedPrice: 216.67,
    ohioTitle: 'Buy 3 month supply of medication',
    title: 'Buy 3 month supply of medication & get 20% off for a limited time',
    singleTitle: 'Buy 1 month supply of medication',
    dosage: '50 mg (3 vials included in shipment - 10 mg, 20 mg, 20 mg)',
    singleDosage: '10 mg vial',
    name: 'Tirzepatide',
    medicareAccessBody1:
      'Additionally, you’ll get 20% off the next 2 months of your weight loss membership. This means your next 2 months of membership will be just $63/month.',
    body1:
      'Additionally, you’ll get 20% off the next 2 months of your weight loss membership. This means your next 2 months of membership will be just $108/month.',
    body2: `In order to receive a 3 month supply of your medication, you will need to pay for your next 2 months of your membership because your ${siteName} provider will need to be able to monitor your care over the next 3 months at least.`,
  },
};

export const compoundCADetailsSpanish: {
  [key: string]: {
    saving: number;
    ohioSaving?: number;
    medicareAccessSaving?: number;
    price: number;
    discountedPrice: number;
    ohioTitle: string;
    title: string;
    singleTitle: string;
    dosage: string;
    singleDosage: string;
    name: string;
    medicareAccessBody1?: string;
    body1: string;
    body2: string;
    singleBody1?: string;
  };
} = {
  Semaglutida: {
    saving: 419,
    ohioSaving: 96,
    medicareAccessSaving: 128,
    price: 275,
    discountedPrice: 200,
    ohioTitle: 'Compre un suministro de medicamento para 3 meses',
    title:
      'Compre un suministro de medicamento para 3 meses y obtenga un 20% de descuento por tiempo limitado',
    singleTitle: 'Compre un suministro de medicamento para 6 semanas',
    medicareAccessBody1:
      'Además, obtendrá un 20% de descuento en los próximos 2 meses de su membresía para pérdida de peso. Esto significa que sus próximos 2 meses de membresía costarán solo $63/mes.',
    dosage: '10 mg (3 viales incluidos en el envío - 2.5 mg, 2.5 mg, 5 mg)',
    singleDosage: 'Vial de 2.5 mg',
    name: 'Semaglutida',
    body1:
      'Además, obtendrá un 20% de descuento en los próximos 2 meses de su membresía para pérdida de peso. Esto significa que sus próximos 2 meses de membresía costarán solo $108/mes.',
    body2: `Para recibir un suministro de medicamento para 3 meses, deberá pagar los próximos 2 meses de su membresía porque su proveedor de ${siteName} necesitará poder monitorear su atención durante los próximos 3 meses como mínimo.`,
    singleBody1:
      'Este suministro típicamente dura 6 semanas. Esto puede variar dependiendo de la dosis que el proveedor recete.',
  },
  Tirzepatida: {
    saving: 304,
    ohioSaving: 153,
    medicareAccessSaving: 185,
    price: 300,
    discountedPrice: 216.67,
    ohioTitle: 'Compre un suministro de medicamento para 3 meses',
    title:
      'Compre un suministro de medicamento para 3 meses y obtenga un 20% de descuento por tiempo limitado',
    singleTitle: 'Compre un suministro de medicamento para 1 mes',
    dosage: '50 mg (3 viales incluidos en el envío - 10 mg, 20 mg, 20 mg)',
    singleDosage: 'Vial de 10 mg',
    name: 'Tirzepatida',
    medicareAccessBody1:
      'Además, obtendrá un 20% de descuento en los próximos 2 meses de su membresía para pérdida de peso. Esto significa que sus próximos 2 meses de membresía costarán solo $63/mes.',
    body1:
      'Además, obtendrá un 20% de descuento en los próximos 2 meses de su membresía para pérdida de peso. Esto significa que sus próximos 2 meses de membresía costarán solo $108/mes.',
    body2: `Para recibir un suministro de medicamento para 3 meses, deberá pagar los próximos 2 meses de su membresía porque su proveedor de ${siteName} necesitará poder monitorear su atención durante los próximos 3 meses como mínimo.`,
  },
};

export const details: {
  [key: string]: {
    title: string;
    overview: string;
    results: string;
    cost: string[];
    costCA?: string[];
    disclaimers?: string[];
  };
} = {
  Ozempic: {
    title: 'Ozempic (semaglutide)',
    overview:
      'A GLP-1 medication effective for weight loss when used off-label; FDA-approved for type 2 diabetes in 2017.',
    results:
      'Most patients who use Ozempic will lose 15% of their body weight over a year.',
    cost: [
      'If your insurance covers Ozempic, it will likely cost $25 per month. The manufacturer, Novo Nordisk, has a savings card that typically lowers your copay to $25 per month if your insurance covers the medication, with a maximum saving of $150 per 1 month prescription.',
    ],
  },
  Zepbound: {
    title: 'Zepbound (tirzepatide)',
    overview:
      'Zepbound is a GLP-1 medication that was FDA-approved for weight loss in 2023.',
    results:
      'Most patients who use Zepbound will lose 20-25% of their body weight over a year.',
    cost: [
      'Potentially covered by insurance. With insurance and savings card, as low as $0 per month. You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket.',
      'Zepbound is typically the most affordable GLP-1 option for those with insurance.',
    ],
  },
  Wegovy: {
    title: 'Wegovy (semaglutide)',
    overview:
      'Wegovy (semaglutide) is a GLP-1 medication that was FDA-approved for weight loss in 2021.',
    results:
      'Most patients who use Wegovy will lose 15% of their body weight over a year.',
    cost: [
      'Potentially covered by insurance. With insurance and savings card, as low as $0 per month. You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket.',
      'Wegovy is typically the most affordable GLP-1 option for those with insurance.',
    ],
  },
  Mounjaro: {
    title: 'Mounjaro (tirzepatide)',
    overview:
      'Tirzapatide is a GLP-1 medication that was FDA-approved for type 2 diabetes in 2022. It has also been proven effective when used off-label for weight loss.',
    results:
      'Most patients who use Mounjaro will lose 20% of their body weight over a year.',
    cost: [
      'Potentially covered by insurance. With insurance and savings card, as low as $25 per month. You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket.',
    ],
  },
  Saxenda: {
    title: 'Saxenda (liraglutide)',
    overview:
      'Liraglutide is a GLP-1 medication FDA-approved for weight loss in 2014. ',
    results:
      'Most patients who use Saxenda will lose 8% of their body weight over a year.',
    cost: [
      'If your insurance covers Saxenda, the manufacturer, Novo Nordisk, has a saving card that can reduce your out-of-pocket cost to as little as $25. You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket.',
    ],
  },

  Victoza: {
    title: 'Victoza (liraglutide)',
    overview:
      'Victoza (liraglutide) is a GLP-1 medication that is FDA-approved for type 2 diabetes. It has also been proven effective when used off-label for weight loss.',
    results:
      'Most patients who use Victoza will lose 3 to 5% of their body weight over a year.',
    cost: [
      'Potentially covered by insurance. With insurance and savings card, as low as $20 per month. You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket.',
    ],
  },
  'Bupropion and Naltrexone': {
    title: 'Bupropion and Naltrexone',
    overview:
      'Bupropion and naltrexone are non-GLP-1 medications that are FDA-approved for other conditions. They have also been proven effective when used off-label for weight loss.',
    results:
      'Most patients who use Bupropion and Naltrexone will lose 5 to 8% of their body weight over a year.',
    cost: [
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy. ',
    ],
  },
  Metformin: {
    title: 'Metformin',
    overview:
      'Metformin is a non-GLP-1 medications that is FDA-approved for other conditions. It has also been proven effective when used off-label for weight loss.',
    results:
      'Most patients who use Metformin will lose 2 to 5% of their body weight over a year.',
    cost: [
      'The cost of the medication will be included in your membership if shipped through our partner mail order pharmacy.',
    ],
  },
  Semaglutide: {
    title: 'Semaglutide',
    overview: `Semaglutide is the generic name for Ozempic and Wegovy, GLP-1 medications that are FDA-approved for treatment of type 2 diabetes and weight loss respectively. 

As a ${siteName} Weight Loss member, you have access to a compounded form of Semaglutide if prescribed. Compounded Semaglutide contains the same active ingredient as the commercially available medications Ozempic and Wegovy.*`,
    results:
      'Studies have shown that once weekly Semaglutide injections led to 14.9% of body weight loss on average over 68 weeks.**',
    cost: [
      `As a ${siteName} member, the cost of the medication is as little as $151/month, and approximately the same price or slightly more if your dose increases for future months. This option, which is significantly more affordable than alternatives, does not require insurance or prior authorization. Your medication would be shipped to your home at no additional cost.`,
    ],
    costCA: [
      'You can get semaglutide for as little as $151/month including shipping and all medical supplies. This option is due to a unique pharmacy partnership we have and does not require use of insurance or prior authorization. Your medication would be shipped to your home.',
    ],
    disclaimers: [
      '*When used in combination with a restricted calorie diet and exercise program',
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
    ],
  },
  Liraglutide: {
    title: 'Liraglutide',
    overview:
      'Liraglutide has been proven effective when used off-label for weight loss.',
    results:
      'Most patients who use Liraglutide will lose 8% of their body weight over a year.',
    cost: [
      'The cost of the medication for most users will be $375/month and will be paid out of pocket. This option is due to a unique pharmacy partnership we have and does not require use of insurance or prior authorization.  Your medication would be shipped to your home.',
    ],
  },
  Tirzepatide: {
    title: 'Tirzepatide',
    overview: `Tirzepatide is the generic name for Mounjaro and Zepbound, GLP-1 medications that are FDA-approved for treatment of type 2 diabetes and weight loss respecively.

As a ${siteName} Weight Loss member, you have access to a compounded form of Tirzepatide if prescribed. Compounded Tirzepatide contains the same active ingredient as the commercially available medications Mounjaro and Zepbound.*`,
    results:
      'Studies have shown that once weekly Tirzepatide injections led to 20% of body weight loss on average over 72 weeks.**',
    cost: [
      `As a ${siteName} member, the cost of the medication is as little as $216/month, and approximately the same price or slightly more if your dose increases for future months. This option, which is significantly more affordable than alternatives, does not require insurance or prior authorization.  Your medication would be shipped to your home, which is included in the price.`,
    ],
    costCA: [
      `As a ${siteName} member, the cost of the medication is as little as $216/month, and approximately the same price or slightly more if your dose increases for future months. This option, which is significantly more affordable than alternatives, does not require insurance or prior authorization.  Your medication would be shipped to your home, which is included in the price.`,
    ],
    disclaimers: [
      '*When used in combination with a restricted calorie diet and exercise program',
      '**Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
    ],
  },
};
export const detailsSpanish: {
  [key: string]: {
    title: string;
    overview: string;
    results: string;
    cost: string[];
    costCA?: string[];
    disclaimers?: string[];
  };
} = {
  Ozempic: {
    title: 'Ozempic (semaglutida)',
    overview:
      'Un medicamento GLP-1 efectivo para la pérdida de peso cuando se usa fuera de indicación; aprobado por la FDA para la diabetes tipo 2 en 2017.',
    results:
      'La mayoría de los pacientes que usan Ozempic perderán el 15% de su peso corporal en un año.',
    cost: [
      'Si su seguro cubre Ozempic, probablemente costará $25 por mes. El fabricante, Novo Nordisk, tiene una tarjeta de ahorros que típicamente reduce su copago a $25 por mes si su seguro cubre el medicamento, con un ahorro máximo de $150 por prescripción de 1 mes.',
    ],
  },
  Zepbound: {
    title: 'Zepbound (tirzepatida)',
    overview:
      'Zepbound es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2023.',
    results:
      'La mayoría de los pacientes que usan Zepbound perderán del 20 al 25% de su peso corporal en un año.',
    cost: [
      'Potencialmente cubierto por el seguro. Con seguro y tarjeta de ahorros, tan bajo como $0 por mes. Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo.',
      'Zepbound es típicamente la opción GLP-1 más asequible para aquellos con seguro.',
    ],
  },
  Wegovy: {
    title: 'Wegovy (semaglutida)',
    overview:
      'Wegovy (semaglutida) es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2021.',
    results:
      'La mayoría de los pacientes que usan Wegovy perderán el 15% de su peso corporal en un año.',
    cost: [
      'Potencialmente cubierto por el seguro. Con seguro y tarjeta de ahorros, tan bajo como $0 por mes. Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo.',
      'Wegovy es típicamente la opción GLP-1 más asequible para aquellos con seguro.',
    ],
  },
  Mounjaro: {
    title: 'Mounjaro (tirzepatida)',
    overview:
      'Tirzepatida es un medicamento GLP-1 que fue aprobado por la FDA para la diabetes tipo 2 en 2022. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    results:
      'La mayoría de los pacientes que usan Mounjaro perderán el 20% de su peso corporal en un año.',
    cost: [
      'Potencialmente cubierto por el seguro. Con seguro y tarjeta de ahorros, tan bajo como $25 por mes. Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo.',
    ],
  },
  Saxenda: {
    title: 'Saxenda (liraglutida)',
    overview:
      'Liraglutida es un medicamento GLP-1 aprobado por la FDA para la pérdida de peso en 2014.',
    results:
      'La mayoría de los pacientes que usan Saxenda perderán el 8% de su peso corporal en un año.',
    cost: [
      'Si su seguro cubre Saxenda, el fabricante, Novo Nordisk, tiene una tarjeta de ahorros que puede reducir su costo de bolsillo a tan solo $25. Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo.',
    ],
  },
  Victoza: {
    title: 'Victoza (liraglutida)',
    overview:
      'Victoza (liraglutida) es un medicamento GLP-1 que está aprobado por la FDA para la diabetes tipo 2. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    results:
      'La mayoría de los pacientes que usan Victoza perderán del 3 al 5% de su peso corporal en un año.',
    cost: [
      'Potencialmente cubierto por el seguro. Con seguro y tarjeta de ahorros, tan bajo como $20 por mes. Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo.',
    ],
  },
  'Bupropión y Naltrexona': {
    title: 'Bupropión y Naltrexona',
    overview:
      'Bupropión y naltrexona son medicamentos no GLP-1 que están aprobados por la FDA para otras condiciones. También han demostrado ser efectivos cuando se usan fuera de indicación para la pérdida de peso.',
    results:
      'La mayoría de los pacientes que usan Bupropión y Naltrexona perderán del 5 al 8% de su peso corporal en un año.',
    cost: [
      'El costo del medicamento se incluirá en su membresía si se envía a través de nuestra farmacia asociada de pedidos por correo.',
    ],
  },
  Metformina: {
    title: 'Metformina',
    overview:
      'Metformina es un medicamento no GLP-1 que está aprobado por la FDA para otras condiciones. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    results:
      'La mayoría de los pacientes que usan Metformina perderán del 2 al 5% de su peso corporal en un año.',
    cost: [
      'El costo del medicamento se incluirá en su membresía si se envía a través de nuestra farmacia asociada de pedidos por correo.',
    ],
  },
  Semaglutida: {
    title: 'Semaglutida',
    overview: `Semaglutida es el nombre genérico de Ozempic y Wegovy, medicamentos GLP-1 que están aprobados por la FDA para el tratamiento de la diabetes tipo 2 y la pérdida de peso respectivamente. 

Como miembro del programa de pérdida de peso de ${siteName}, tiene acceso a una forma compuesta de Semaglutida si se prescribe. La Semaglutida compuesta contiene el mismo ingrediente activo que los medicamentos comercialmente disponibles Ozempic y Wegovy.*`,
    results:
      'Los estudios han demostrado que las inyecciones semanales de Semaglutida llevaron a una pérdida promedio del 14,9% del peso corporal en 68 semanas.**',
    cost: [
      `Como miembro de ${siteName}, el costo del medicamento es de tan solo $151/mes, y aproximadamente el mismo precio o ligeramente más si su dosis aumenta en meses futuros. Esta opción, que es significativamente más asequible que las alternativas, no requiere seguro ni autorización previa. Su medicamento se enviaría a su casa sin costo adicional.`,
    ],
    costCA: [
      'Puede obtener semaglutida por tan solo $151/mes, incluyendo el envío y todos los suministros médicos. Esta opción se debe a una asociación única con una farmacia y no requiere el uso de seguro ni autorización previa. Su medicamento se enviaría a su casa.',
    ],
    disclaimers: [
      '*Cuando se usa en combinación con una dieta restringida en calorías y un programa de ejercicios',
      '**Las formulaciones compuestas no están aprobadas por la FDA y pueden no producir los mismos resultados que las formulaciones disponibles comercialmente.',
    ],
  },
  Liraglutida: {
    title: 'Liraglutida',
    overview:
      'Liraglutida ha demostrado ser efectiva cuando se usa fuera de indicación para la pérdida de peso.',
    results:
      'La mayoría de los pacientes que usan Liraglutida perderán el 8% de su peso corporal en un año.',
    cost: [
      'El costo del medicamento para la mayoría de los usuarios será de $375/mes y se pagará de su bolsillo. Esta opción se debe a una asociación única con una farmacia y no requiere el uso de seguro ni autorización previa. Su medicamento se enviaría a su casa.',
    ],
  },
  Tirzepatida: {
    title: 'Tirzepatida',
    overview: `Tirzepatida es el nombre genérico de Mounjaro y Zepbound, medicamentos GLP-1 que están aprobados por la FDA para el tratamiento de la diabetes tipo 2 y la pérdida de peso respectivamente.

Como miembro del programa de pérdida de peso de ${siteName}, tiene acceso a una forma compuesta de Tirzepatida si se prescribe. La Tirzepatida compuesta contiene el mismo ingrediente activo que los medicamentos comercialmente disponibles Mounjaro y Zepbound.*`,
    results:
      'Los estudios han demostrado que las inyecciones semanales de Tirzepatida llevaron a una pérdida promedio del 20% del peso corporal en 72 semanas.**',
    cost: [
      `Como miembro de ${siteName}, el costo del medicamento es de tan solo $216/mes, y aproximadamente el mismo precio o ligeramente más si su dosis aumenta en meses futuros. Esta opción, que es significativamente más asequible que las alternativas, no requiere seguro ni autorización previa. Su medicamento se enviaría a su casa, lo cual está incluido en el precio.`,
    ],
    costCA: [
      `Como miembro de ${siteName}, el costo del medicamento es de tan solo $216/mes, y aproximadamente el mismo precio o ligeramente más si su dosis aumenta en meses futuros. Esta opción, que es significativamente más asequible que las alternativas, no requiere seguro ni autorización previa. Su medicamento se enviaría a su casa, lo cual está incluido en el precio.`,
    ],
    disclaimers: [
      '*Cuando se usa en combinación con una dieta restringida en calorías y un programa de ejercicios',
      '**Las formulaciones compuestas no están aprobadas por la FDA y pueden no producir los mismos resultados que las formulaciones disponibles comercialmente.',
    ],
  },
};
