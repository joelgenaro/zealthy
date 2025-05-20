import { OrderProps } from '../OrderHistoryContent';

export const oldMedications: { [key: string]: any } = {
  'Semaglutide 2 mg vial': {
    plan: 'Semaglutide Monthly',
    currMonth: '2nd month',
    states: [],
    pharmacy: 'Tailor Made',
    dose: '0.5 mg per week',
    size: '2 mg',
    sig: 'Inject 25 units once per week for four weeks',
    durationInWeeks: '4 weeks',
    price: '$275',
    shipments: '',
    vials: '1',
    doctorInstructions:
      'For the next four weeks Inject 25 units (0.5 mg) subcutaneously once per week. Note that this vial is more concentrated, so you will still inject 25 units as before but get twice as much medication.  After your third week, you will request a refill and we will determine whether to increase dosage for your next month’s supply. You will be able to do this through this link',
    laymanInstructions: `<b>WHAT TO DO</b>
    <p>Inject 25 units (0.5 mg) under the skin once per week for four weeks</p>
    <br />
    <b>HOW TO INJECT</b>
    <p><a href=""https://api.getzealthy.com/storage/v1/object/public/pdfs/How%20to%20administer%20your%20GLP-1%20medication.pdf"" target=""_blank"">This guide<a/> will show you how to use the syringe supplied in your package to inject the prescribed amount of medication each week. </p>
    <br />
    <b>HOW TO GET REFILLS</b>
    <p>After your third week of injecting your medication, you will submit your order for a refill, which you must complete to recieve your next month's supply. You will be able to do this through <a href=""/patient-portal/visit/weight-loss-refill"""">this link</a>.</p>`,
  },
  'Semaglutide 30 mg vial': {
    plan: 'Semaglutide 3 months',
    currMonth: '4,5,6 months and beyond (quarterly supply)',
    states: [],
    pharmacy: 'Tailor Made',
    dose: `<p class="subtitle">Month 1+ (Weeks 1+)</p>
    <p>50 units (2.5 mg) per week</p>"`,
    size: '30 mg',
    sig: `"<p class="subtitle">Month 1+ (Weeks 1+)</p>
    <p>Inject 50 units (2.5 mg) per week for 12 weeks</p>`,
    durationInWeeks: '12 weeks',
    price: '$999',
    shipments: '',
    vials: '1',
    doctorInstructions: '',
    laymanInstructions: `<b>WHAT TO DO</b>
    <p>Inject 50 units (2.5 mg) under the skin once per week for 12 weeks. Complete your check in with your Zealthy provider after your third injection, and then again after your sixth injection. Your 30 mg supply will come in 3 separate shipments of 10 mg each with each delivered a month apart, and each shipment should last 4 injections completed once per week.</p>
    <br />
    <b>HOW TO INJECT</b>
    <p><a href=""https://api.getzealthy.com/storage/v1/object/public/pdfs/How%20to%20administer%20your%20GLP-1%20medication.pdf"" target=""_blank"">This guide<a/> will show you how to use the syringe supplied in your package to inject the prescribed amount of medication each week. You also will have a video in the home page of your Zealthy portal with these instructions.</p>
    <br />
    <b>HOW TO GET REFILLS</b>
    <p>After your third week of injecting your medication and then again after your sixth week of injecting your medication, you will submit a dosage update request, which you must complete to increase your dosage. After your ninth week of injecting your medication, you will submit a refill request to order more medication using <a href=""/patient-portal/visit/weight-loss-refill""> this link</a>.</p>`,
  },
  'Tirzepatide 30 mg vial': {
    plan: 'Tirzepatide Monthly',
    currMonth: '3rd month',
    states: [],
    pharmacy: 'Hallandale',
    dose: '7.5 mg per week',
    size: '30 mg',
    sig: 'Inject 75 units once per week ',
    durationInWeeks: '4 weeks',
    price: '$597',
    shipments: '',
    vials: '1',
    doctorInstructions: '',
    laymanInstructions: `<b>WHAT TO DO</b>
    <p>Inject 75 units (7.5 mg) under the skin once per week for four weeks</p>
    <br />
    <b>HOW TO INJECT</b>
    <p><a href=""https://api.getzealthy.com/storage/v1/object/public/pdfs/How%20to%20administer%20your%20GLP-1%20medication.pdf"" target=""_blank"">This guide<a/> will show you how to use the syringe supplied in your package to inject the prescribed amount of medication each week. You also will have a video in the home page of your Zealthy portal with these instructions.</p>
    <br />
    <b>HOW TO GET REFILLS</b>
    <p>After your third week of injecting your medication, you will submit your order for a refill, which you must complete to recieve your next month's supply. You will be able to do this through <a href=""/patient-portal/visit/weight-loss-refill"">this link</a>.</p>`,
  },
  'Tirzepatide 50 mg vial': {
    plan: 'Tirzepatide Monthly',
    currMonth: '4th, 5th, 6th month (and beyond)',
    states: [],
    pharmacy: 'Hallandale',
    dose: '10 mg per week',
    size: '50 mg',
    sig: 'Inject 100 units once per week ',
    durationInWeeks: '5 weeks',
    price: '$800',
    shipments: '',
    vials: '1',
    doctorInstructions: '',
    laymanInstructions: `<b>WHAT TO DO</b>
    <p>Inject 100 units (10 mg) under the skin once per week for five weeks</p>
    <br />
    <b>HOW TO INJECT</b>
    <p><a href=""https://api.getzealthy.com/storage/v1/object/public/pdfs/How%20to%20administer%20your%20GLP-1%20medication.pdf"" target=""_blank"">This guide<a/> will show you how to use the syringe supplied in your package to inject the prescribed amount of medication each week. You also will have a video in the home page of your Zealthy portal with these instructions.</p>
    <br />
    <b>HOW TO GET REFILLS</b>
    <p>After your third week of injecting your medication, you will submit your order for a refill, which you must complete to recieve your next month's supply. You will be able to do this through <a href=""/patient-portal/visit/weight-loss-refill"">this link</a>.</p>`,
  },
  'Tirzepatide 30 mg vial - multi': {
    plan: 'Tirzepatide Multimonth',
    currMonth: '1,2,3 months',
    states: [],
    pharmacy: 'Hallandale',
    dose: `<p class=""subtitle"">Month 1 (Weeks 1-4)</p>
    <p>25 units (2.5 mg) per week</p>
    <p class="subtitle">Month 2 (Weeks 5-8)</p>
    <p>50 units (5 mg) per week</p>`,
    size: '30 mg',
    sig: `<p class="subtitle">Month 1 (Weeks 1-4)</p>
    <p>Inject 25 units (2.5 mg) once per week x 4 weeks</p>
    <p class="subtitle">Month 2 (Weeks 5-8)</p>
    <p>Inject 50 units (5 mg) once per week x 4 weeks</p>`,
    durationInWeeks: '12 weeks',
    price: '$597',
    shipments: '',
    vials: '1',
    doctorInstructions: '',
    laymanInstructions: `<b>WHAT TO DO</b>
    <p>Inject 25 units (2.5 mg) under the skin once per week for 4 weeks. Complete your dosage update request after your third injection, and then again after your sixth injection. Most members will inject 50 units (5 mg) under the skin once per week for weeks 5-8, and then 75 units (7.5 mg) under the skin once per week for weeks 9-14, but you should not increase your dosage without your provider's approval. Your 30 mg supply will come in 1 shipment. </p>
    <br />
    <b>HOW TO INJECT</b>
    <p><a href=""https://api.getzealthy.com/storage/v1/object/public/pdfs/How%20to%20administer%20your%20GLP-1%20medication.pdf"" target=""_blank"">This guide<a/> will show you how to use the syringe supplied in your package to inject the prescribed amount of medication each week. You also will have a video in the home page of your Zealthy portal with these instructions.</p>
    <br />
    <b>HOW TO GET REFILLS</b>
    <p>After your third week of injecting your medication, you will submit a dosage update request, which you must complete to increase your dosage <a href=""/patient-portal/visit/weight-loss-quarterly-checkin"">here</a>  After your sixth week of injecting your medication, assuming your dosage has already increased to 50 units (5 mg) per week, you will submit a refill request to order more medication using <a href=""/patient-portal/visit/weight-loss-refill"">this link</a>.</p>`,
  },
  'Tirzepatide 90 mg vial': {
    plan: 'Tirzepatide Multimonth',
    currMonth: 'Months 4,5,6 and beyond',
    states: [],
    pharmacy: 'Hallandale',
    dose: `<p class="subtitle">Month 1 -3</p>
    <p>75 units (7.5 mg) per week</p>`,
    size: '90 mg',
    sig: '<p>Inject 75 units (7.5 mg) once per week</p>',
    durationInWeeks: '12 weeks',
    price: '$1,499',
    shipments: '',
    vials: `<p class="subtitle">Shipment 1</p>
    <p>30 mg in bottle</p>
    <p class="subtitle">Shipment 2</p>
    <p>30 mg in bottle</p>
    <p class="subtitle">Shipment 3</p>
    <p>30 mg in bottle</p>`,
    doctorInstructions: '',
    laymanInstructions: `<b>WHAT TO DO</b>
    <p>Inject 75 units (7.5 mg) under the skin once per week for 12 weeks. Complete your check in after your third injection, and then again after your sixth injection. Your 90 mg supply will come in 3 separate shipments of 30 mg with each delivered a month apart, and each shipment should last 4 injections completed once per week.</p>
    <br />
    <b>HOW TO INJECT</b>
    <p><a href=""https://api.getzealthy.com/storage/v1/object/public/pdfs/How%20to%20administer%20your%20GLP-1%20medication.pdf"" target=""_blank"">This guide<a/> will show you how to use the syringe supplied in your package to inject the prescribed amount of medication each week. You also will have a video in the home page of your Zealthy portal with these instructions.</p>
    <br />
    <b>HOW TO GET REFILLS</b>
    <p>After your third week of injecting your medication and then again after your sixth week of injecting your medication, you will submit a dosage update request, which you must complete to increase your dosage be using <a href=""/patient-portal/visit/weight-loss-quarterly-checkin"">this link</a>.  After your ninth week of injecting your medication, you will submit a refill request to order more medication using <a href=""/patient-portal/visit/weight-loss-refill"">this link</a>.</p>`,
  },
};

export const orderCardNote = (pharmacy: string, drug: string, size: string) => {
  let label: string = '*Label will say ';
  console.log(pharmacy, drug, size, 'CardNote');
  if (pharmacy === 'Empower') {
    if (drug === 'Semaglutide') {
      const sizeMap: { [key: string]: string } = {
        '1 mg': '1/0.5 mg/mL, 1 mL',
        '2.5 mg': '1/0.5 mg/mL, 2.5 mL',
        '5 mg': '5/0.5 mg/mL, 1 mL',
        '12.5 mg': '5/0.5 mg/mL, 2.5 mL',
      };
      label = sizeMap[size]
        ? label +
          `Semaglutide/Cyanocobalamin injection ${
            sizeMap[size] ? sizeMap[size] : ''
          }`
        : ``;
    }
    if (drug === 'Tirzepatide') {
      const sizeMap: { [key: string]: string } = {
        '20 mg': '8/2 mg/mL, 2.5 mL',
        '34 mg': '17/2 mg/mL, 2 mL',
      };
      label = sizeMap[size]
        ? label +
          `Tirzepatide/Niacinamide injection ${
            sizeMap[size] ? sizeMap[size] : ''
          }`
        : ``;
    }
  }
  if (pharmacy === 'Hallandale') {
    if (drug === 'Semaglutide') {
      const sizeMap: { [key: string]: string } = {
        '2.5 mg': '2.5 mg/mL, 1 mL',
        '5 mg': '2.5 mg/mL, 2 mL',
        '12.5 mg': '2.5 mg/mL, 5 mL',
      };
      label = sizeMap[size]
        ? label + `Semaglutide injection ${sizeMap[size] ? sizeMap[size] : ''}`
        : ``;
    }
    if (drug === 'Tirzepatide') {
      const sizeMap: { [key: string]: string } = {
        '10 mg': '5 mg/0.5mL, 1 mL',
        '20 mg': '5 mg/0.5mL, 2 mL',
        '30 mg': '5 mg/0.5mL, 3 mL',
        '50 mg': '5 mg/0.5mL, 5 mL',
      };
      label = sizeMap[size]
        ? label + `Tirzepatide injection ${sizeMap[size] ? sizeMap[size] : ''}`
        : ``;
    }
  }
  if (pharmacy === 'Tailor-Made') {
    if (drug === 'Semaglutide') {
      const sizeMap: { [key: string]: string } = {
        '10 mg': '5 mg/0.4mg/mL, 2 mL',
      };
      label = sizeMap[size]
        ? label +
          `Semaglutide/Cyanocobalamin injection ${
            sizeMap[size] ? sizeMap[size] : ''
          }`
        : ``;
    }
    if (drug === 'Tirzepatide') {
      label = ``;
    }
  }
  if (pharmacy === 'Belmar') {
    if (drug === 'Semaglutide') {
      const sizeMap: { [key: string]: string } = {
        '1 mg': '1mg/1mg/ml, 1 mL',
        '2 mg': '1mg/1mg/ml, 1 mL',
        '3 mg': '1mg/1mg/ml, 1 mL',
        '4 mg': '1mg/1mg/ml, 1 mL',
        '5 mg': '1mg/1mg/ml, 5 mL',
        '10 mg': '1mg/1mg/ml, 5 mL',
        '15 mg': '1mg/1mg/ml, 5 mL',
      };
      label = sizeMap[size]
        ? label +
          `Semaglutide/Cyanocobalamin injection ${
            sizeMap[size] ? sizeMap[size] : ''
          }`
        : ``;
    }
    if (drug === 'Tirzepatide') {
      label = ``;
    }
  }
  if (pharmacy === 'Red Rock') {
    if (drug === 'Semaglutide') {
      const sizeMap: { [key: string]: string } = {
        '2.5 mg': '2.16mg/ml, 1 mL',
        '5 mg': '4.32mg/2ml, 2 mL',
        '12.5 mg': '8.64mg/4ml, 4 mL',
      };
      label = sizeMap[size]
        ? label + `Semaglutide injection ${sizeMap[size] ? sizeMap[size] : ''}`
        : ``;
    }
    if (drug === 'Tirzepatide') {
      const sizeMap: { [key: string]: string } = {
        '10 mg': '10 mg/ml, 1 mL',
        '20 mg': '10 mg/ml, 2 mL',
        '30 mg': '10 mg/ml, 3 mL',
        '50 mg': '20 mg/ml, 2 mL',
      };
      label = sizeMap[size]
        ? label + `Tirzepatide injection ${sizeMap[size] ? sizeMap[size] : ''}`
        : ``;
    }
  }
  if (pharmacy === 'Revive') {
    if (drug === 'Semaglutide') {
      const sizeMap: { [key: string]: string } = {
        '2.5 mg': '2.5 mg/ml Sterile Solution, 1ml',
        '5 mg': '2.5 mg/ml Sterile Solution, 2ml',
        '10 mg': '5 mg/ml Sterile Solution, 2ml',
      };
      label = sizeMap[size]
        ? label + `Semaglutide ${sizeMap[size] ? sizeMap[size] : ''}`
        : ``;
    }
    if (drug === 'Tirzepatide') {
      label = ``;
    }
  }

  return label;
};

export const calculateBelmarWeeks = (totalDose: string, index: number) => {
  // Monthly
  if (totalDose === 'Semaglutide 1 mg vial') {
    if (index === 0) return '(Weeks 1-4)';
  }
  if (totalDose === 'Semaglutide 2 mg vial') {
    if (index === 0) return '(Weeks 1-2)';
    if (index === 1) return '(Weeks 3-4)';
  }
  if (totalDose === 'Semaglutide 5 mg vial') {
    if (index === 0) return '(Weeks 1-4)';
  }
  if (totalDose === 'Semaglutide 10 mg vial') {
    if (index === 0) return '(Weeks 1-4)';
    if (index === 1) return '(Weeks 3-4)';
  }

  // Quarterly
  if (totalDose === 'Semaglutide 8 mg vial') {
    if (index === 0) return '(Weeks 1-4)';
    if (index === 1) return '(Weeks 5-6)';
    if (index === 2) return '(Weeks 7-8)';
    if (index === 3) return '(Weeks 9-12)';
  }
  if (totalDose === 'Semaglutide 17 mg vial') {
    if (index === 0) return '(Weeks 1-2)';
    if (index === 1) return '(Weeks 3-4)';
    if (index === 2) return '(Weeks 5-8)';
    if (index === 3) return '(Weeks 9-10)';
    if (index === 4) return '(Weeks 11-12)';
  }
  if (totalDose === 'Semaglutide 25 mg vial') {
    if (index === 0) return '(Weeks 1-4)';
    if (index === 1) return '(Weeks 5-6)';
    if (index === 2) return '(Weeks 7-8)';
    if (index === 3) return '(Weeks 9-10)';
    if (index === 4) return '(Weeks 11-12)';
  }
  if (totalDose === 'Semaglutide 30 mg vial') {
    if (index === 0) return '(Weeks 1-4)';
    if (index === 1) return '(Weeks 3-4)';
    if (index === 2) return '(Weeks 5-6)';
    if (index === 3) return '(Weeks 7-8)';
    if (index === 4) return '(Weeks 9-10)';
    if (index === 5) return '(Weeks 11-12)';
  }
  return '';
};
export const calculateBelmarShipments = (totalDose: string, index: number) => {
  // Quarterly
  if (totalDose === 'Semaglutide 8 mg vial') {
    if (index === 0) return ' - Shipment 1';
    if (index === 1) return ' - Shipment 2';
    if (index === 2) return ' - Shipment 2';
    if (index === 3) return ' - Shipment 3';
  }
  if (totalDose === 'Semaglutide 17 mg vial') {
    if (index === 0) return ' - Shipment 1';
    if (index === 1) return ' - Shipment 1';
    if (index === 2) return ' - Shipment 2';
    if (index === 3) return ' - Shipment 3';
    if (index === 4) return ' - Shipment 3';
  }
  if (totalDose === 'Semaglutide 25 mg vial') {
    if (index === 0) return ' - Shipment 1';
    if (index === 1) return ' - Shipment 2';
    if (index === 2) return ' - Shipment 2';
    if (index === 3) return ' - Shipment 3';
    if (index === 4) return ' - Shipment 3';
  }
  if (totalDose === 'Semaglutide 30 mg vial') {
    if (index === 0) return ' - Shipment 1';
    if (index === 1) return ' - Shipment 1';
    if (index === 2) return ' - Shipment 2';
    if (index === 3) return ' - Shipment 2';
    if (index === 4) return ' - Shipment 3';
    if (index === 5) return ' - Shipment 3';
  }
  return '';
};
export const calculateHallandaleWeeks120 = (index: number) => {
  if (index === 0) return ' - Weeks 1 & 2';
  if (index === 1) return ' - Weeks 3 - 7';
  if (index === 2) return ' - Weeks 8 - 12';
  // if (index === 3) return ' - Weeks 7 & 8'; // previously used to send 6 vials for hallandale 120. not anymore
  // if (index === 4) return ' - Weeks 9 & 10';
  // if (index === 5) return ' - Weeks 11 & 12';
};
export const calculateBelmarVials = (totalDose: string) => {
  // Quarterly
  if (totalDose === 'Semaglutide 8 mg vial') {
    return [
      'using Vial 1 listed above',
      'using Vial 2 and then Vial 3 listed above',
      'using vial 4 listed above',
    ];
  }
  if (totalDose === 'Semaglutide 17 mg vial') {
    return [
      'using Vials 1 and 2 listed above',
      'using Vial 3 listed above',
      'using Vials 4 and 5 listed above',
    ];
  }
  if (totalDose === 'Semaglutide 25 mg vial') {
    return [
      'using Vial 1 listed above',
      'using Vials 2 and 3 listed above',
      'using Vials 4 and 5 listed above',
    ];
  }
  if (totalDose === 'Semaglutide 30 mg vial') {
    return [
      'using Vials 1 and 2 listed above',
      'using Vials 3 and 4 listed above',
      'using Vials 5 and 6 listed above',
    ];
  }
  return '';
};

export const calculateWhatToDoQuarterly = (
  hasMultipleMonthVials: boolean,
  numberOfVials: number,
  dosageFromDescription: { descriptions: string[]; medications: string[] },
  sortedOrderOldestToNewest: OrderProps[]
) => {
  const dosageDescriptionsLength =
    dosageFromDescription?.descriptions?.length - 1;
  const dosageMedicationsLength =
    dosageFromDescription?.medications?.length - 1;

  const multiMonthVialIndex = sortedOrderOldestToNewest.findIndex(order =>
    order?.prescription_id?.dosage_instructions?.includes('---')
  );

  const whatToDoQuarterlyMultiMonthVial = `${
    dosageFromDescription.descriptions?.[0] || ''
  } under the skin from the ${
    sortedOrderOldestToNewest[0]?.prescription_id?.medication
  } for your first month.
    Then, you will ${
      dosageFromDescription?.descriptions?.length > 1
        ? dosageFromDescription?.descriptions?.[1]?.toLowerCase()
        : dosageFromDescription?.descriptions?.[0]?.toLowerCase()
    } under the skin from the ${dosageFromDescription?.medications?.[
    multiMonthVialIndex
  ]?.toLowerCase()} for your second month.
    Finally, you will ${dosageFromDescription?.descriptions?.[
      dosageDescriptionsLength
    ]?.toLowerCase()} under the skin from the ${dosageFromDescription?.medications?.[
    dosageMedicationsLength
  ]?.toLowerCase()} for your third month. ${
    sortedOrderOldestToNewest[0]?.prescription_id?.pharmacy !== 'Belmar'
      ? ` Your 3 month supply will come in one package, with ${
          (numberOfVials || 0) > 1
            ? `${numberOfVials} separate vials`
            : '1 vial'
        } of ${
          dosageFromDescription?.medications?.[0]?.toLowerCase()?.split(' ')[1]
        } mg${
          dosageFromDescription?.medications?.length > 1
            ? ` and ${
                dosageFromDescription?.medications?.[1]
                  ?.toLowerCase()
                  ?.split(' ')[1]
              } mg`
            : ''
        } and should have enough medication to last all 3 months.`
      : `Your 3 month supply will come in three separate shipments, with each shipment / vial arriving one month apart.`
  }`;
  const whatToDoQuarterly = `${
    sortedOrderOldestToNewest[0]?.prescription_id?.dosage_instructions
  } under the skin from the ${
    sortedOrderOldestToNewest[0]?.prescription_id?.medication
  } for your first month. 
    Then, you will ${sortedOrderOldestToNewest[1]?.prescription_id?.dosage_instructions?.toLowerCase()} under the skin from the ${
    sortedOrderOldestToNewest[1]?.prescription_id?.medication
  } for your second month. 
    Finally, you will ${sortedOrderOldestToNewest[2]?.prescription_id?.dosage_instructions?.toLowerCase()} under the skin from the ${
    sortedOrderOldestToNewest[2]?.prescription_id?.medication
  } for your third month. ${
    sortedOrderOldestToNewest[0]?.prescription_id?.pharmacy !== 'Belmar'
      ? ` Your 3 month supply will come in one package, with 3 separate vials of ${
          sortedOrderOldestToNewest[0]?.prescription_id?.medication?.split(
            ' '
          )[1]
        } mg for your first month, ${
          sortedOrderOldestToNewest[1]?.prescription_id?.medication?.split(
            ' '
          )[1]
        } mg for your second month, and ${
          sortedOrderOldestToNewest[2]?.prescription_id?.medication?.split(
            ' '
          )[1]
        } mg for your third month.`
      : `Your 3 month supply will come in three separate shipments, with each shipment / vial arriving one month apart.`
  }`;

  return hasMultipleMonthVials
    ? whatToDoQuarterlyMultiMonthVial
    : whatToDoQuarterly;
};
