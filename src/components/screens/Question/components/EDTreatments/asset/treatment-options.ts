import {
  Medication,
  MedicationType,
} from '@/context/AppContext/reducers/types/visit';

const values: Medication[] = [
  {
    medication_quantity_id: null,
    type: MedicationType.ED,
    display_name: 'ED Medication',
    name: 'Sildenafil + Tadalafil Zealthy Hardies',
    dosage: 'Standard',
    otherOptions: [],
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/s-t-hardies.svg',
  },

  {
    medication_quantity_id: null,
    type: MedicationType.ED,
    display_name: 'ED Medication',
    name: 'Sildenafil + Oxytocin Zealthy Hardies',
    dosage: 'Standard',
    otherOptions: [],
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/s-o-hardies.svg',
  },
  {
    medication_quantity_id: null,
    type: MedicationType.ED,
    display_name: 'ED Medication',
    name: 'Tadalafil + Oxytocin Zealthy Hardies',
    dosage: 'Standard',
    otherOptions: [],
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/t-o-hardies.svg',
  },
  {
    medication_quantity_id: null,
    type: MedicationType.ED,
    display_name: 'ED Medication',
    name: 'Tadalafil + Vardenafil Zealthy Hardies',
    dosage: 'Standard',
    otherOptions: [],
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/t+v-hardies.svg',
  },
  {
    medication_quantity_id: null,
    type: MedicationType.ED,
    display_name: 'ED Medication',
    name: 'Sildenafil Hardies',
    dosage: 'Standard',
    otherOptions: [],
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/t+v-hardies.svg',
  },
  {
    medication_quantity_id: null,
    type: MedicationType.ED,
    display_name: 'ED Medication',
    name: 'Tadalafil Hardies',
    dosage: 'Standard',
    otherOptions: [],
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/t+v-hardies.svg',
  },
];

export const options: {
  image: string;
  pricePerUnit: number;
  unit: string;
  label: string;
  value: Medication;
  subLabel: string;
  alternative?: {
    medication: Medication;
    pricePerUnit: number;
    unit: string;
    image: string;
  };
}[] = [
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/s-t-hardies.svg',
    label: `<div class='title'>
          <div class='banner-1'>Quick Dissolve Tablet</div>
          <h3><strong>Sildenafil + Tadalafil Zealthy Hardies</strong></h3>
          <div class="description">Long-lasting and fast-acting</div>
          <div>$11/Hardie</div>
        </div>
        <img src='https://api.getzealthy.com/storage/v1/object/public/questions/s-t-hardies.svg' />`,
    value: values[0],
    pricePerUnit: 11,
    unit: 'tablet',
    subLabel:
      "<div class='graph'><strong>Performance Boost - by hour</strong><div class='properties'><span>Take: <strong>15m before sex</strong></span></span><span>Supports You: <strong>36h</strong></span></div><img src='https://api.getzealthy.com/storage/v1/object/public/questions/tadalafil-vardenafil-chart.svg' width='100%'/></div><p>Uses the same exact active ingredients as brand name Viagra® and Cialis® (no chemical difference).</p>",
  },
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/s-o-hardies.svg',
    label: `<div class='title'>
    <div class='banner-1'>Quick Dissolve Tablet</div>
    <h3><strong>Sildenafil + Oxytocin Zealthy Hardies</strong></h3>
    <div class="description">Fast-acting</div>
    <div>$11/Hardie</div>
    </div>
    <img src='https://api.getzealthy.com/storage/v1/object/public/questions/s-o-hardies.svg' />`,
    value: values[1],
    pricePerUnit: 11,
    unit: 'tablet',
    subLabel:
      "<div class='graph'><strong>Performance Boost - by hour</strong><div class='properties'><span>Take: <strong>15m before sex</strong></span></span><span>Supports You: <strong>6h</strong></span></div><img src='https://api.getzealthy.com/storage/v1/object/public/questions/tadalafil-vardenafil-chart.svg' width='100%'/></div><p>Uses the same exact active ingredient as brand name Viagra® (no chemical difference).</p>",
  },
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/t-o-hardies.svg',
    label: `<div class='title'>
    <div class='banner-1'>Quick Dissolve Tablet</div>
    <h3><strong>Tadalafil + Oxytocin Zealthy Hardies</strong></h3>
    <div class="description">Long-lasting</div>
    <div>$11/Hardie</div>
    </div>
    <img src='https://api.getzealthy.com/storage/v1/object/public/questions/t-o-hardies.svg' />`,
    value: values[2],
    pricePerUnit: 11,
    unit: 'tablet',
    subLabel:
      "<div class='graph'><strong>Performance Boost - by hour</strong><div class='properties'><span>Take: <strong>1hr before sex</strong></span></span><span>Supports You: <strong>36h</strong></span></div><img src='https://api.getzealthy.com/storage/v1/object/public/questions/tadalafil-vardenafil-chart.svg' width='100%'/></div><p>Uses the same exact active ingredient as brand name Cialis® (no chemical difference).</p>",
  },
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/t+v-hardies.svg',
    label: `<div class='title'>
              <div class='banner-1'>Quick Dissolve Tablet</div>
              <h3><strong>Tadalafil + Vardenafil Zealthy Hardies</strong></h3>
              <div class="description">Getting and Staying Hard</div>
              <div>$11/Hardie</div>
            </div>
            <img src='https://api.getzealthy.com/storage/v1/object/public/images/programs/t+v-hardies.svg' />`,
    value: values[3],
    pricePerUnit: 11,
    unit: 'tablet',
    subLabel:
      "<div class='graph'><strong>Performance Boost - by hour</strong><div class='properties'><span>Take: <strong>30m before sex</strong></span></span><span>Supports You: <strong>36h</strong></span></div><img src='https://api.getzealthy.com/storage/v1/object/public/questions/tadalafil-vardenafil-chart.svg' width='100%'/></div><p>Uses the same exact active ingredients as brand name Viagra® and Cialis® (no chemical difference).</p>",
  },
];

export const options5146 = [
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/s-t-hardies.svg',
    label: `<div class='title'>
              <div class='banner-1'>Quick Dissolve Tablet</div>
              <h3><strong>Sildenafil + Tadalafil Zealthy Hardies</strong></h3>
              <div class="description">Long-lasting and fast-acting</div>
              <div>$11/Hardie</div>
            </div>
            <img src='https://api.getzealthy.com/storage/v1/object/public/questions/s-t-hardies.svg' />`,
    value: values[0],
    pricePerUnit: 11,
    unit: 'tablet',
    subLabel:
      "<div class='graph'><strong>Performance Boost - by hour</strong><div class='properties'><span>Take: <strong>15m before sex</strong></span></span><span>Supports You: <strong>36h</strong></span></div><img src='https://api.getzealthy.com/storage/v1/object/public/questions/tadalafil-vardenafil-chart.svg' width='100%'/></div><p>Uses the same exact active ingredients as brand name Viagra® and Cialis® (no chemical difference).</p>",
  },
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/t+v-hardies.svg',
    label: `<div class='title'>
              <div class='banner-1'>Quick Dissolve Tablet</div>
              <h3><strong>Tadalafil + Vardenafil Zealthy Hardies</strong></h3>
              <div class="description">Getting and Staing Hard</div>
              <div>$11/Hardie</div>
            </div>
            <img src='https://api.getzealthy.com/storage/v1/object/public/images/programs/t+v-hardies.svg' />`,
    value: values[3],
    pricePerUnit: 11,
    unit: 'tablet',
    subLabel:
      "<div class='graph'><strong>Performance Boost - by hour</strong><div class='properties'><span>Take: <strong>30m before sex</strong></span></span><span>Supports You: <strong>36h</strong></span></div><img src='https://api.getzealthy.com/storage/v1/object/public/questions/tadalafil-vardenafil-chart.svg' width='100%'/></div><p>Uses the same exact active ingredients as brand name Viagra® and Cialis® (no chemical difference).</p>",
  },
];

export const options5146V2 = [
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/s-t-hardies.svg',
    label: `<div class='title'>
                  <div class='banner-1'>Quick Dissolve Tablet</div>
                  <h3><strong>Sildenafil + Tadalafil Zealthy Hardies</strong></h3>
                  <div class="description">Long-lasting and fast-acting</div>
                  <div>$11/Hardie</div>
                </div>
                <img src='https://api.getzealthy.com/storage/v1/object/public/questions/s-t-hardies.svg' />`,
    value: values[0],
    pricePerUnit: 11,
    unit: 'tablet',
    subLabel:
      "<div class='graph'><strong>Performance Boost - by hour</strong><div class='properties'><span>Take: <strong>15m before sex</strong></span></span><span>Supports You: <strong>36h</strong></span></div><img src='https://api.getzealthy.com/storage/v1/object/public/questions/tadalafil-vardenafil-chart.svg' width='100%'/></div><p>Uses the same exact active ingredients as brand name Viagra® and Cialis® (no chemical difference).</p>",
  },
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/t+v-hardies.svg',
    label: `<div class='title'>
                  <div class='banner-1'>Quick Dissolve Tablet</div>
                  <h3><strong>Tadalafil + Vardenafil Zealthy Hardies</strong></h3>
                  <div class="description">Getting and Staing Hard</div>
                  <div>$11/Hardie</div>
                </div>
                <img src='https://api.getzealthy.com/storage/v1/object/public/images/programs/t+v-hardies.svg' />`,
    value: values[3],
    pricePerUnit: 11,
    unit: 'tablet',
    subLabel:
      "<div class='graph'><strong>Performance Boost - by hour</strong><div class='properties'><span>Take: <strong>30m before sex</strong></span></span><span>Supports You: <strong>36h</strong></span></div><img src='https://api.getzealthy.com/storage/v1/object/public/questions/tadalafil-vardenafil-chart.svg' width='100%'/></div><p>Uses the same exact active ingredients as brand name Viagra® and Cialis® (no chemical difference).</p>",
  },
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/s-o-hardies.svg',
    label: `<div class='title'>
              <div class='banner-1'>Quick Dissolve Tablet</div>
              <h3><strong>Sildenafil + Oxytocin Zealthy Hardies</strong></h3>
              <div class="description">Fast-acting</div>
              <div>$11/Hardie</div>
            </div>
            <img src='https://api.getzealthy.com/storage/v1/object/public/questions/s-o-hardies.svg' />`,
    value: values[1],
    pricePerUnit: 11,
    unit: 'tablet',
    subLabel:
      "<div class='graph'><strong>Performance Boost - by hour</strong><div class='properties'><span>Take: <strong>15m before sex</strong></span></span><span>Supports You: <strong>6h</strong></span></div><img src='https://api.getzealthy.com/storage/v1/object/public/questions/tadalafil-vardenafil-chart.svg' width='100%'/></div><p>Uses the same exact active ingredient as brand name Viagra® (no chemical difference).</p>",
  },
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/t-o-hardies.svg',
    label: `<div class='title'>
              <div class='banner-1'>Quick Dissolve Tablet</div>
              <h3><strong>Tadalafil + Oxytocin Zealthy Hardies</strong></h3>
              <div class="description">Long-lasting</div>
              <div>$11/Hardie</div>
            </div>
            <img src='https://api.getzealthy.com/storage/v1/object/public/questions/t-o-hardies.svg' />`,
    value: values[2],
    pricePerUnit: 11,
    unit: 'tablet',
    subLabel:
      "<div class='graph'><strong>Performance Boost - by hour</strong><div class='properties'><span>Take: <strong>1hr before sex</strong></span></span><span>Supports You: <strong>36h</strong></span></div><img src='https://api.getzealthy.com/storage/v1/object/public/questions/tadalafil-vardenafil-chart.svg' width='100%'/></div><p>Uses the same exact active ingredient as brand name Cialis® (no chemical difference).</p>",
  },
];

export const options5440: {
  image: string;
  pricePerUnit: number;
  unit: string;
  label: string;
  value: Medication;
  subLabel: string;
  alternative?: {
    medication: Medication;
    pricePerUnit: number;
    unit: string;
    image: string;
  };
}[] = [
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/t-o-hardies.svg',
    label: `<div class='title'>
    <div class='banner-1'>Quick Dissolve Tablet</div>
    <h3><strong>Tadalafil + Oxytocin Zealthy Hardies</strong></h3>
    <div class="description">Long-lasting</div>
    <div>$11/Hardie</div>
    </div>
    <img src='https://api.getzealthy.com/storage/v1/object/public/questions/t-o-hardies.svg' />`,
    value: values[2],
    pricePerUnit: 11,
    unit: 'tablet',
    subLabel:
      "<div class='graph'><strong>Performance Boost - by hour</strong><div class='properties'><span>Take: <strong>1hr before sex</strong></span></span><span>Supports You: <strong>36h</strong></span></div><img src='https://api.getzealthy.com/storage/v1/object/public/questions/tadalafil-vardenafil-chart.svg' width='100%'/></div><p>Uses the same exact active ingredient as brand name Cialis® (no chemical difference).</p>",
  },
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/s-t-hardies.svg',
    label: `<div class='title'>
          <div class='banner-1'>Quick Dissolve Tablet</div>
          <h3><strong>Sildenafil + Tadalafil Zealthy Hardies</strong></h3>
          <div class="description">Long-lasting and fast-acting</div>
          <div>$11/Hardie</div>
        </div>
        <img src='https://api.getzealthy.com/storage/v1/object/public/questions/s-t-hardies.svg' />`,
    value: values[0],
    pricePerUnit: 11,
    unit: 'tablet',
    subLabel:
      "<div class='graph'><strong>Performance Boost - by hour</strong><div class='properties'><span>Take: <strong>15m before sex</strong></span></span><span>Supports You: <strong>36h</strong></span></div><img src='https://api.getzealthy.com/storage/v1/object/public/questions/tadalafil-vardenafil-chart.svg' width='100%'/></div><p>Uses the same exact active ingredients as brand name Viagra® and Cialis® (no chemical difference).</p>",
  },
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/s-o-hardies.svg',
    label: `<div class='title'>
    <div class='banner-1'>Quick Dissolve Tablet</div>
    <h3><strong>Sildenafil + Oxytocin Zealthy Hardies</strong></h3>
    <div class="description">Fast-acting</div>
    <div>$11/Hardie</div>
    </div>
    <img src='https://api.getzealthy.com/storage/v1/object/public/questions/s-o-hardies.svg' />`,
    value: values[1],
    pricePerUnit: 11,
    unit: 'tablet',
    subLabel:
      "<div class='graph'><strong>Performance Boost - by hour</strong><div class='properties'><span>Take: <strong>15m before sex</strong></span></span><span>Supports You: <strong>6h</strong></span></div><img src='https://api.getzealthy.com/storage/v1/object/public/questions/tadalafil-vardenafil-chart.svg' width='100%'/></div><p>Uses the same exact active ingredient as brand name Viagra® (no chemical difference).</p>",
  },
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/images/programs/t+v-hardies.svg',
    label: `<div class='title'>
              <div class='banner-1'>Quick Dissolve Tablet</div>
              <h3><strong>Tadalafil + Vardenafil Zealthy Hardies</strong></h3>
              <div class="description">Getting and Staying Hard</div>
              <div>$11/Hardie</div>
            </div>
            <img src='https://api.getzealthy.com/storage/v1/object/public/images/programs/t+v-hardies.svg' />`,
    value: values[3],
    pricePerUnit: 11,
    unit: 'tablet',
    subLabel:
      "<div class='graph'><strong>Performance Boost - by hour</strong><div class='properties'><span>Take: <strong>30m before sex</strong></span></span><span>Supports You: <strong>36h</strong></span></div><img src='https://api.getzealthy.com/storage/v1/object/public/questions/tadalafil-vardenafil-chart.svg' width='100%'/></div><p>Uses the same exact active ingredients as brand name Viagra® and Cialis® (no chemical difference).</p>",
  },
];

export const optionsCA = [
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/turq_sildenafil_hardies.svg',
    label: `<div class='title'>
          <div class='banner-1'>Quick Dissolve Tablet</div>
          <h3><strong>Sildenafil Hardies</strong></h3>
          <div class="description">Fast-acting</div>
          <div>$11/Hardie</div>
        </div>
        <img src='https://api.getzealthy.com/storage/v1/object/public/questions/turq_sildenafil_hardies.svg' />`,
    value: values[4],
    pricePerUnit: 11,
    unit: 'tablet',
    subLabel:
      "<div class='graph'><strong>Performance Boost - by hour</strong><div class='properties'><span>Take: <strong>15m before sex</strong></span></span><span>Supports You: <strong>6h</strong></span></div><img src='https://api.getzealthy.com/storage/v1/object/public/questions/tadalafil-vardenafil-chart.svg' width='100%'/></div><p>Uses the same exact active ingredients as brand name Viagra®.</p>",
  },
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/tadal_hardies.svg',
    label: `<div class='title'>
          <div class='banner-1'>Quick Dissolve Tablet</div>
          <h3><strong>Tadalafil Hardies</strong></h3>
          <div class="description">Long-lasting</div>
          <div>$11/Hardie</div>
        </div>
        <img src='https://api.getzealthy.com/storage/v1/object/public/questions/tadal_hardies.svg' />`,
    value: values[5],
    pricePerUnit: 11,
    unit: 'tablet',
    subLabel:
      "<div class='graph'><strong>Performance Boost - by hour</strong><div class='properties'><span>Take: <strong>1hr before sex</strong></span></span><span>Supports You: <strong>36h</strong></span></div><img src='https://api.getzealthy.com/storage/v1/object/public/questions/tadalafil-vardenafil-chart.svg' width='100%'/></div><p>Uses the same exact active ingredients as brand name Cialis® (no chemical difference).</p>",
  },
];
