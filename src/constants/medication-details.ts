import getConfig from '../../config';

const siteName = getConfig(
  process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
).name;

export const WeightLossMedDetails: {
  [key: string]: {
    title: string;
    overview: string;
    results: string;
    cost: string[];
    costCA?: string[];
    costCT?: string[];
    costCTV2?: string[];
    disclaimers?: string[];
  };
} = {
  Zepbound: {
    title: 'Zepbound (tirzepatide)',
    overview:
      'Zepbound is a GLP-1 medication that was FDA-approved for weight loss in 2023.',
    results:
      'Most patients who use Zepbound will lose 20-25% of their body weight over a year.',
    cost: [
      'Potentially covered by insurance. With insurance and savings card, as low as $0 per month. You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket.',
      `After Wegovy, Zepbound is typically the next most likely GLP-1 option to be covered by insurance for ${siteName} members.`,
    ],
  },
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
  Rybelsus: {
    title: 'Rybelsus (semaglutide)',
    overview:
      'Rybelsus (semaglutide) is a GLP-1 medication that is FDA-approved for type 2 diabetes. It has also been proven effective when used off-label for weight loss.',
    results:
      'Most patients who use Rybelsus will lose 5 to 10% of their body weight over a year.',
    cost: [
      'Potentially covered by insurance. With insurance and savings card, as low as $10 per month. You’ll be able to attempt other medications if your insurance denies coverage, and will also be given the option to pay out of pocket.',
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
      'Most patients who use Bupoprion and Naltrexone will lose 5 to 8% of their body weight over a year.',
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
    costCT: [
      `As a ${siteName} member, the cost of the medication is as little as $151/month, and your price will NOT increase if you increase your dosage in future months. For a limited time, you can get grandfathered in at this price (compare to $300-$1K+ per month elsewhere). This option, which is significantly more affordable than alternatives, does not require insurance or prior authorization. Your medication would be shipped to your home at no additional cost.`,
    ],
    costCTV2: [
      `As a ${siteName} member, the cost of the medication is as little as $183/month, and your price will NOT increase if you increase your dosage in future months. For a limited time, you can get grandfathered in at this price (compare to $300-$1K+ per month elsewhere). This option, which is significantly more affordable than alternatives, does not require insurance or prior authorization. Your medication would be shipped to your home at no additional cost.`,
    ],
    disclaimers: [
      '*Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
      '**When used in combination with a restricted calorie diet and exercise program',
    ],
  },
  'Oral Semaglutide': {
    title: 'Oral Semaglutide',
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
    costCT: [
      `As a ${siteName} member, the cost of the medication is as little as $151/month, and your price will NOT increase if you increase your dosage in future months. For a limited time, you can get grandfathered in at this price (compare to $300-$1K+ per month elsewhere). This option, which is significantly more affordable than alternatives, does not require insurance or prior authorization. Your medication would be shipped to your home at no additional cost.`,
    ],
    costCTV2: [
      `As a ${siteName} member, the cost of the medication is as little as $183/month, and your price will NOT increase if you increase your dosage in future months. For a limited time, you can get grandfathered in at this price (compare to $300-$1K+ per month elsewhere). This option, which is significantly more affordable than alternatives, does not require insurance or prior authorization. Your medication would be shipped to your home at no additional cost.`,
    ],
    disclaimers: [
      '*Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
      '**When used in combination with a restricted calorie diet and exercise program',
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
    costCT: [
      `As a ${siteName} member, the cost of the medication is as little as $216/month, and your price will NOT increase if you increase your dosage in future months. For a limited time, you can get grandfathered in at this price (compare to $300-$1K+ per month elsewhere). This option, which is significantly more affordable than alternatives, does not require insurance or prior authorization. Your medication would be shipped to your home at no additional cost.`,
    ],
    costCTV2: [
      `As a ${siteName} member, the cost of the medication is as little as $333/month, and your price will NOT increase if you increase your dosage in future months. For a limited time, you can get grandfathered in at this price (compare to $300-$1K+ per month elsewhere). This option, which is significantly more affordable than alternatives, does not require insurance or prior authorization. Your medication would be shipped to your home at no additional cost.`,
    ],
    disclaimers: [
      '*Compound formulations are not FDA approved and may not yield the same results as the commercially available formulations.',
      '**When used in combination with a restricted calorie diet and exercise program',
    ],
  },
};

export const WeightLossMedDetailsSpanish: {
  [key: string]: {
    title: string;
    overview: string;
    results: string;
    cost: string[];
    costCA?: string[];
    costCT?: string[];
    costCTV2?: string[];
    disclaimers?: string[];
  };
} = {
  Zepbound: {
    title: 'Zepbound (tirzepatida)',
    overview:
      'Zepbound es un medicamento GLP-1 que fue aprobado por la FDA para la pérdida de peso en 2023.',
    results:
      'La mayoría de los pacientes que usan Zepbound perderán del 20 al 25% de su peso corporal en un año.',
    cost: [
      'Potencialmente cubierto por el seguro. Con seguro y tarjeta de ahorros, tan bajo como $0 por mes. Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo.',
      `Después de Wegovy, Zepbound es típicamente la siguiente opción GLP-1 con más probabilidades de ser cubierta por el seguro para los miembros de ${siteName}.`,
    ],
  },
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
  Rybelsus: {
    title: 'Rybelsus (semaglutida)',
    overview:
      'Rybelsus (semaglutida) es un medicamento GLP-1 que está aprobado por la FDA para la diabetes tipo 2. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    results:
      'La mayoría de los pacientes que usan Rybelsus perderán del 5 al 10% de su peso corporal en un año.',
    cost: [
      'Potencialmente cubierto por el seguro. Con seguro y tarjeta de ahorros, tan bajo como $10 por mes. Podrá intentar otros medicamentos si su seguro niega la cobertura, y también se le dará la opción de pagar de su bolsillo.',
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
  'Bupropion and Naltrexone': {
    title: 'Bupropion y Naltrexone',
    overview:
      'Bupropión y naltrexona son medicamentos no GLP-1 que están aprobados por la FDA para otras condiciones. También han demostrado ser efectivos cuando se usan fuera de indicación para la pérdida de peso.',
    results:
      'La mayoría de los pacientes que usan Bupropión y Naltrexona perderán del 5 al 8% de su peso corporal en un año.',
    cost: [
      'El costo del medicamento se incluirá en su membresía si se envía a través de nuestra farmacia asociada de pedidos por correo.',
    ],
  },
  Metformin: {
    title: 'Metformina',
    overview:
      'Metformina es un medicamento no GLP-1 que está aprobado por la FDA para otras condiciones. También ha demostrado ser efectivo cuando se usa fuera de indicación para la pérdida de peso.',
    results:
      'La mayoría de los pacientes que usan Metformina perderán del 2 al 5% de su peso corporal en un año.',
    cost: [
      'El costo del medicamento se incluirá en su membresía si se envía a través de nuestra farmacia asociada de pedidos por correo.',
    ],
  },
  Semaglutide: {
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
    costCT: [
      `Como miembro de ${siteName}, el costo del medicamento es de tan solo $151/mes, y su precio NO aumentará si aumenta su dosis en meses futuros. Por tiempo limitado, puede obtener este precio garantizado (compare con $300-$1K+ por mes en otros lugares). Esta opción, que es significativamente más asequible que las alternativas, no requiere seguro ni autorización previa. Su medicamento se enviaría a su casa sin costo adicional.`,
    ],
    costCTV2: [
      `Como miembro de ${siteName}, el costo del medicamento es de tan solo $183/mes, y su precio NO aumentará si aumenta su dosis en meses futuros. Por tiempo limitado, puede obtener este precio garantizado (compare con $300-$1K+ por mes en otros lugares). Esta opción, que es significativamente más asequible que las alternativas, no requiere seguro ni autorización previa. Su medicamento se enviaría a su casa sin costo adicional.`,
    ],
    disclaimers: [
      '*Las formulaciones compuestas no están aprobadas por la FDA y pueden no producir los mismos resultados que las formulaciones disponibles comercialmente.',
      '**Cuando se usa en combinación con una dieta restringida en calorías y un programa de ejercicios',
    ],
  },
  'Oral Semaglutide': {
    title: 'Semaglutida oral',
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
    costCT: [
      `Como miembro de ${siteName}, el costo del medicamento es de tan solo $151/mes, y su precio NO aumentará si aumenta su dosis en meses futuros. Por tiempo limitado, puede obtener este precio garantizado (compare con $300-$1K+ por mes en otros lugares). Esta opción, que es significativamente más asequible que las alternativas, no requiere seguro ni autorización previa. Su medicamento se enviaría a su casa sin costo adicional.`,
    ],
    costCTV2: [
      `Como miembro de ${siteName}, el costo del medicamento es de tan solo $183/mes, y su precio NO aumentará si aumenta su dosis en meses futuros. Por tiempo limitado, puede obtener este precio garantizado (compare con $300-$1K+ por mes en otros lugares). Esta opción, que es significativamente más asequible que las alternativas, no requiere seguro ni autorización previa. Su medicamento se enviaría a su casa sin costo adicional.`,
    ],
    disclaimers: [
      '*Las formulaciones compuestas no están aprobadas por la FDA y pueden no producir los mismos resultados que las formulaciones disponibles comercialmente.',
      '**Cuando se usa en combinación con una dieta restringida en calorías y un programa de ejercicios',
    ],
  },
  Liraglutide: {
    title: 'Liraglutide',
    overview:
      'Liraglutida ha demostrado ser efectiva cuando se usa fuera de indicación para la pérdida de peso.',
    results:
      'La mayoría de los pacientes que usan Liraglutida perderán el 8% de su peso corporal en un año.',
    cost: [
      'El costo del medicamento para la mayoría de los usuarios será de $375/mes y se pagará de su bolsillo. Esta opción se debe a una asociación única con una farmacia y no requiere el uso de seguro ni autorización previa. Su medicamento se enviaría a su casa.',
    ],
  },
  Tirzepatide: {
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
    costCT: [
      `Como miembro de ${siteName}, el costo del medicamento es de tan solo $216/mes, y su precio NO aumentará si aumenta su dosis en meses futuros. Por tiempo limitado, puede obtener este precio garantizado (compare con $300-$1K+ por mes en otros lugares). Esta opción, que es significativamente más asequible que las alternativas, no requiere seguro ni autorización previa. Su medicamento se enviaría a su casa sin costo adicional.`,
    ],
    costCTV2: [
      `Como miembro de ${siteName}, el costo del medicamento es de tan solo $333/mes, y su precio NO aumentará si aumenta su dosis en meses futuros. Por tiempo limitado, puede obtener este precio garantizado (compare con $300-$1K+ por mes en otros lugares). Esta opción, que es significativamente más asequible que las alternativas, no requiere seguro ni autorización previa. Su medicamento se enviaría a su casa sin costo adicional.`,
    ],
    disclaimers: [
      '*Las formulaciones compuestas no están aprobadas por la FDA y pueden no producir los mismos resultados que las formulaciones disponibles comercialmente.',
      '**Cuando se usa en combinación con una dieta restringida en calorías y un programa de ejercicios',
    ],
  },
};
