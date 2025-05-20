import { Container, Typography, Button, Box, Checkbox } from '@mui/material';
import { useEffect, useState } from 'react';
import { Database } from '@/lib/database.types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { compoundDetails } from './data';
import axios from 'axios';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import Router from 'next/router';
import { useSearchParams } from 'next/navigation';
import { usePatient, usePatientCareTeam } from '@/components/hooks/data';
import {
  MedicationAddOn,
  WeightLossBulkAddOn,
} from '@/components/shared/AddOnPayment';
import { useVisitActions } from '@/components/hooks/useVisit';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import { toast } from 'react-hot-toast';
import type { OrderProps } from '@/components/screens/Prescriptions/OrderHistoryContent';
import { isWeightLossMed } from '@/utils/isWeightLossMed';
import { format } from 'date-fns-tz';
import { differenceInDays } from 'date-fns';

type MedObjectProps = {
  name: string;
  type: MedicationType;
  price: number;
  discounted_price?: number;
  dosage: string;
  quantity: number;
  recurring: {
    interval: string;
    interval_count: number;
  };
  medication_quantity_id: number;
};

const medData: { [key: string]: MedObjectProps } = {
  Semaglutide: {
    name: 'Semaglutide weekly injections',
    type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
    price: 125,
    dosage: '1 mg vial (1 mg/mL x 1 mL)',
    quantity: 1,
    recurring: {
      interval: 'month',
      interval_count: 0,
    },
    medication_quantity_id: 98,
  },
  Tirzepatide: {
    name: 'Tirzepatide weekly injections',
    type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
    price: 200,
    dosage: '10 mg vial (5 mg/.5 mL x 1mL)',
    quantity: 1,
    recurring: {
      interval: 'month',
      interval_count: 0,
    },
    medication_quantity_id: 98,
  },
  Liraglutide: {
    name: 'Liraglutide weekly injections',
    type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
    price: 375,
    dosage: '50 mg vial (10 mg/mL X 5 mL)',
    quantity: 1,
    recurring: {
      interval: 'month',
      interval_count: 0,
    },
    medication_quantity_id: 98,
  },
};

const medBulkData: { [key: string]: MedObjectProps } = {
  Semaglutide: {
    name: 'Semaglutide',
    type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
    price: 125,
    discounted_price: 100,
    dosage: '10 mg vial (5 mg/mL x 2 mL)',
    quantity: 1,
    recurring: {
      interval: 'month',
      interval_count: 0,
    },
    medication_quantity_id: 98,
  },
  Tirzepatide: {
    name: 'Tirzepatide',
    type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
    price: 200,
    discounted_price: 160,
    dosage: '30 mg vial (10 mg/mL x 3 mL)',
    quantity: 1,
    recurring: {
      interval: 'month',
      interval_count: 0,
    },
    medication_quantity_id: 98,
  },
  Liraglutide: {
    name: 'Liraglutide',
    type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
    price: 375,
    discounted_price: 360,
    dosage: '90 mg vial',
    quantity: 1,
    recurring: {
      interval: 'month',
      interval_count: 0,
    },
    medication_quantity_id: 98,
  },
};
const WegovyNearYou = () => {
  const { data: patient } = usePatient();
  const { data: careTeam } = usePatientCareTeam();
  const supabase = useSupabaseClient<Database>();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const medicationSelected = searchParams?.get('med');
  const review = searchParams?.get('review');
  const quantity = searchParams?.get('quantity');
  const { addMedication } = useVisitActions();
  const [checked, setChecked] = useState<string>('');
  const handleChange = (value: string) => {
    setChecked(value);
  };

  const [weightLossOrders, setWeightLossOrders] = useState<OrderProps[]>([]);
  const [orders, setOrders] = useState<OrderProps[]>([]);
  const [nonGLP1Orders, setNonGLP1Orders] = useState<OrderProps[]>([]);
  const [glp1PrescribedMed, setGlp1PrescribedMed] = useState<string | null>();

  async function fetchOrders() {
    const allOrders = await supabase
      .from('order')
      .select('*, prescription_id:prescription!inner(*)')
      .eq('patient_id', patient?.id!)
      .order('created_at', { ascending: false })
      .then(({ data }) => (data || []) as OrderProps[]);

    const filteredOrders = allOrders?.filter(
      o => !o?.order_status?.includes('AUTO_REFILL')
    );
    if (filteredOrders?.length) {
      setOrders(filteredOrders);
      setNonGLP1Orders(
        filteredOrders?.filter(
          o =>
            !isWeightLossMed(
              o?.prescription_id?.medication?.toLowerCase() || ''
            )
        )
      );
    }

    const groupedData: { [key: string]: any[] } = {};
    const allWeightLossOrders = filteredOrders?.filter(o =>
      isWeightLossMed(o?.prescription_id?.medication?.toLowerCase() || '')
    );

    allWeightLossOrders?.forEach(order => {
      // Create a key using total_dose and created_at values
      const key = `${order.total_dose || order?.prescription_id?.medication}-${
        order?.group_id ||
        format(new Date(order.created_at || ''), 'dd-MM-yyyy HH:mm')
      }`;

      // If the key exists in the groupedData object, merge the objects
      if (groupedData[key]) {
        groupedData[key].push(order);
      } else {
        groupedData[key] = [order];
      }
    });

    const groupedOrders = Object.entries(groupedData)?.map(o => o[1]);
    const result: OrderProps[] = [];
    for (const group of groupedOrders) {
      const sortedOrders = group?.sort((a, b) => b?.id - a?.id);
      if (
        sortedOrders?.length &&
        differenceInDays(
          new Date(),
          new Date(sortedOrders?.[0]?.created_at || '')
        ) <
          (sortedOrders?.reduce(
            (total, item) => total + item?.prescription_id?.duration_in_days,
            0
          ) || 0) +
            35 &&
        !sortedOrders?.every(o =>
          o.order_status.toLowerCase().includes('cancel')
        )
      ) {
        setWeightLossOrders([...sortedOrders]);
        break;
      }
    }
  }

  useEffect(() => {
    if (patient?.id) {
      fetchOrders();
    }
  }, [patient?.id]);

  useEffect(() => {
    const brandNameMeds = [
      'mounjaro',
      'zepbound',
      'ozempic',
      'wegovy',
      'saxenda',
      'victoza',
    ];

    const activeWeightLossOrders = weightLossOrders
      ? weightLossOrders.filter(
          (order: any) =>
            !['CANCELED', 'CANCELLED'].includes(order.order_status)
        )
      : [];

    activeWeightLossOrders?.forEach(order => {
      const medication = order?.prescription_id?.medication?.toLowerCase();
      const medicationWords = medication?.split(/\s+/);

      const matchedBrand = medicationWords
        ? brandNameMeds.find(brand => medicationWords.includes(brand))
        : null;

      if (matchedBrand) {
        const capitalizedBrand =
          matchedBrand.charAt(0).toUpperCase() + matchedBrand.slice(1);
        setGlp1PrescribedMed(capitalizedBrand);
      }
    });
  }, [weightLossOrders]);

  async function handleConfirmMed() {
    setLoading(true);
    Router.push(`/patient-portal/weight-loss-treatment/compound`);
    window.scrollTo({ top: 0, left: 0 });
    setLoading(false);
  }
  async function handleConfirmQuantity() {
    if (!!medicationSelected) {
      addMedication(
        checked === 'bulk'
          ? medBulkData[medicationSelected]
          : medData[medicationSelected]
      );
    }

    Router.push(
      {
        pathname: `/patient-portal/wegovy-near-you`,
        query: { med: medicationSelected, review: true },
      },
      undefined,
      { shallow: true }
    );

    window.scrollTo({ top: 0, left: 0 });
    setLoading(false);
  }

  async function selectMedication() {
    setLoading(true);
    const message = `<p>Hi ${patient?.profiles?.first_name}</p>

    <p>I am sorry to hear you are having trouble finding ${glp1PrescribedMed}. I wanted to let you know about another option you have as a Zealthy member that you can consider while we are working to find ${glp1PrescribedMed} in a pharmacy near you.</p>
    
    <p>Semaglutide (active ingredient in Wegovy and Ozempic) or Tirzepatide (active ingredient in Mounjaro) from compounding pharmacy: Compounding pharmacies do not accept insurance but the cost of the medication is much lower than if you were to buy them at the local pharmacy due to our ability to source high-quality compound medications for less. Our price for compounded Semaglutide is roughly $125 for your first month and roughly $200 for your first month of compounded Tirzepatide. Please note compounded medications do not go through an FDA approval process. The medication is shipped to your home and shipping is included. Please use <a href="/patient-portal/weight-loss-treatment/compound">this link</a> to authorize payment or just reply indicating that you’d like to move forward to receive your first month of compound medication. You can also navigate to the <a href="/patient-portal">home page<a/> of your patient portal and select “Request compound Semaglutide or Tirzepatide”. You can see more information on compounded GLP-1 medications <a href="/post/exploring-semaglutide-access">here</a>.</p>
    
    <p>Since you will hopefully be able to find ${glp1PrescribedMed} in stock soon, I would recommend starting with a 1 month supply of compound Semaglutide or Tirzpetide and then we can re-evaluate.</p>
    
    <p>Please let us know if you have any questions or if you would like to explore alternative options.</p>
    `;

    if (!patient?.id || !patient?.profile_id) {
      return;
    }
    const existingTask = await supabase
      .from('task_queue')
      .select()
      .eq('patient_id', patient?.id)
      .eq('task_type', `FIND_${glp1PrescribedMed?.toUpperCase()}`)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => data);

    const addToQueue = await supabase
      .from('task_queue')
      .insert({
        task_type: `FIND_${glp1PrescribedMed?.toUpperCase()}`,
        patient_id: patient?.id,
        queue_type: 'Coordinator',
      })
      .select()
      .single()
      .then(({ data }) => data);

    if (!existingTask) {
      const coordinatorProfileId = careTeam?.find(c =>
        c?.role?.includes('Coordinator')
      )?.clinician?.profile_id;

      const groupId = await supabase
        .from('messages_group')
        .select('id')
        .eq('profile_id', patient?.profile_id)
        .eq('name', 'Weight Loss')
        .maybeSingle()
        .then(({ data }) => data?.id);

      const messageSent = await axios.post(`/api/message`, {
        data: {
          message,
          sender: `Practitioner/${coordinatorProfileId}`,
          recipient: `Patient/${patient?.profile_id}`,
          groupId,
          notify: true,
        },
      });

      await supabase
        .from('messages-v2')
        .update({ queue_id: addToQueue?.id })
        .eq('id', messageSent.data?.id);
    }
    toast.success('Your Zealthy coordination team has been notified');

    Router.push(
      {
        pathname: `/patient-portal/wegovy-near-you`,
        query: { med: 'Semaglutide' },
      },
      undefined,
      { shallow: true }
    );
    window.scrollTo({ top: 0, left: 0 });
    setLoading(false);
  }

  return (
    <Container maxWidth="xs">
      {!medicationSelected && !review && !quantity && (
        <>
          <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
            {`Would you like Zealthy to help you find your ${glp1PrescribedMed} at a pharmacy near you?`}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
            {`To help our members like you, Zealthy developed a program where our team will help you find ${glp1PrescribedMed} at a pharmacy near you.`}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
            {`If you select Confirm below, a coordinator will call at least 3 pharmacies near you to find your ${glp1PrescribedMed}.`}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: '3rem' }}>
            {
              'If they are unsuccessful at finding the correct dosage but there may be a different dosage that would be appropriate, they can work with your Zealthy provider to determine that.'
            }
          </Typography>
          <LoadingButton
            loading={loading}
            disabled={loading}
            fullWidth
            onClick={selectMedication}
          >
            Confirm
          </LoadingButton>
        </>
      )}
      {medicationSelected && !review && !quantity && (
        <>
          <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
            {`Your care team is working on finding ${glp1PrescribedMed} near you. `}
          </Typography>
          <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
            {'Order Semaglutide while you wait?'}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: '3rem' }}>
            {
              'While you wait for your coordinator to call pharmacies and see if we can find your medication in stock, you can get started on your first order by ordering Semaglutide, the main active ingredient in Wegovy and Ozempic.'
            }
          </Typography>
          <LoadingButton
            loading={loading}
            disabled={loading}
            fullWidth
            sx={{ marginBottom: '1rem' }}
            onClick={handleConfirmMed}
          >
            Continue to order Semaglutide
          </LoadingButton>
          <Button
            fullWidth
            variant="text"
            onClick={() => Router.replace('/patient-portal')}
          >
            Go to portal without ordering
          </Button>
        </>
      )}
      {medicationSelected && !review && quantity && (
        <Box>
          <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
            {'Tell us how much medication you’d like to receive.'}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
            {
              'For a limited time, Zealthy is offering a 20% discount on your medication and the next 2 months of your membership if you get a 3 month supply. '
            }
          </Typography>
          <Box
            sx={{
              padding: '1.5rem',
              borderRadius: '1rem',
              background: '#ffffff',
              boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '1rem',
              gap: '1.5rem',
              cursor: 'pointer',
            }}
            onClick={() => handleChange('bulk')}
          >
            <Box
              sx={{
                borderRadius: '0.75rem',
                background: '#F7F9A5',
                display: 'flex',
                width: '17rem',
                height: '3.25rem',
                padding: '1rem 1.25rem',
                justifyContent: 'center',
                alignItems: 'flex-start',
                alignSelf: 'center',
                fontWeight: 600,
              }}
            >{`For a limited time save $${compoundDetails[medicationSelected].saving}`}</Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <Checkbox
                value={checked}
                checked={checked === 'bulk'}
                inputProps={{ 'aria-label': 'controlled' }}
              />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="h3" fontWeight="600" mb="0.3rem">
                    {compoundDetails[medicationSelected].title}
                  </Typography>
                  <Typography variant="body1" mb="1rem">
                    {`${compoundDetails[medicationSelected].name} ${compoundDetails[medicationSelected].dosage}`}
                  </Typography>
                </Box>
                {/* <Box sx={{ display: "flex" }}> */}
                <Typography
                  variant="body1"
                  mb="1rem"
                  fontSize="1rem !important"
                >
                  <Typography
                    component="span"
                    variant="body1"
                    fontSize="1rem !important"
                    sx={{
                      textDecoration: 'line-through',
                      marginRight: '0.2rem',
                      width: '20px',
                    }}
                  >
                    {`$${compoundDetails[medicationSelected].price}/month`}
                  </Typography>
                  {`$${compoundDetails[medicationSelected].discountedPrice}/month for ${compoundDetails[medicationSelected].name} (3 month supply)`}
                </Typography>
                {/* </Box> */}
                <Typography
                  variant="body1"
                  mb="1rem"
                  fontSize="0.75rem !important"
                >
                  {compoundDetails[medicationSelected].body1}
                </Typography>
                <Typography variant="body1" fontSize="0.75rem !important">
                  {compoundDetails[medicationSelected].body2}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              padding: '1.5rem',
              borderRadius: '1rem',
              background: '#ffffff',
              boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '3rem',
              gap: '1.5rem',
              cursor: 'pointer',
            }}
            onClick={() => handleChange('single')}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <Checkbox
                value={checked}
                checked={checked === 'single'}
                inputProps={{ 'aria-label': 'controlled' }}
              />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="h3" fontWeight="600" mb="0.3rem">
                    {compoundDetails[medicationSelected].singleTitle}
                  </Typography>
                  <Typography variant="body1" mb="1rem">
                    {`${compoundDetails[medicationSelected].name} ${compoundDetails[medicationSelected].singleDosage}`}
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  mb="1rem"
                  fontSize="1rem !important"
                >
                  {`$${compoundDetails[medicationSelected].price} for your first month of ${compoundDetails[medicationSelected].name}`}
                </Typography>
              </Box>
            </Box>
          </Box>
          <LoadingButton
            loading={loading}
            disabled={loading}
            fullWidth
            onClick={handleConfirmQuantity}
          >
            Continue
          </LoadingButton>
        </Box>
      )}
      {review &&
        (checked === 'single' ? (
          <MedicationAddOn />
        ) : (
          <WeightLossBulkAddOn currentMonth={null} />
        ))}
    </Container>
  );
};

export default WegovyNearYou;
