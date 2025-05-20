import Router from 'next/router';
import { useCallback, useState, useMemo, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Divider,
  ListItem,
  List,
  Stack,
} from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import {
  details,
  medications,
} from '../Question/components/WeightLossTreatment/data';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { useSearchParams } from 'next/navigation';
import {
  usePatient,
  useAllPatientPrescriptionRequest,
  usePatientDocuments,
  useVWOVariationName,
  useLanguage,
} from '@/components/hooks/data';
import toast from 'react-hot-toast';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PharmacySelection from '../Profile/components/PharmacySelect';
import InsuranceInformation from '../Question/components/InsuranceInformation';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { useAppointmentActions } from '@/components/hooks/useAppointment';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';
import ListItemButton from '@mui/material/ListItemButton';
import CheckMark from '@/components/shared/icons/CheckMark';
import { useAnswerSelect } from '@/components/hooks/useAnswer';
import { usePatientAsync } from '@/components/hooks/usePatient';
import Loading from '@/components/shared/Loading/Loading';
import Link from 'next/link';

const WeightLossEligible = () => {
  const { addPotentialInsurance } = useIntakeActions();
  const { potentialInsurance } = useIntakeState();
  const { removeAppointment } = useAppointmentActions();
  const { data: patient } = usePatient();
  const language = useLanguage();
  const { data: variation8685 } = useVWOVariationName('8685');
  const handleContinue = useCallback(
    async (type: string) => {
      if (
        ['NO', 'Yes, but my plan is an HMO'].includes(type) &&
        patient?.region === 'FL' &&
        ['Medicare Access Florida', 'Medicaid Access Florida'].includes(
          potentialInsurance || ''
        )
      ) {
        Router.push(
          {
            pathname: `/patient-portal/weight-loss-treatment/glp1`,
            query: { confirm: true },
          },
          undefined,
          { shallow: false }
        );
        return;
      }
      if (
        type === 'YES' &&
        patient?.region === 'FL' &&
        ['Medicare Access Florida', 'Medicaid Access Florida'].includes(
          potentialInsurance || ''
        )
      ) {
        Router.push(
          {
            pathname: `/patient-portal/weight-loss-treatment/glp1`,
            query: { ineligible: true },
          },
          undefined,
          { shallow: false }
        );
        return;
      }
      if (type === 'YES' && patient?.region === 'FL') {
        Router.push(
          {
            pathname: `/patient-portal/weight-loss-treatment/glp1`,
            query: { ineligible: true },
          },
          undefined,
          { shallow: false }
        );
        return;
      }
      if (type === 'NO') {
        if (
          potentialInsurance !== 'TX' &&
          potentialInsurance !== 'OH' &&
          potentialInsurance !== 'Semaglutide Bundled' &&
          potentialInsurance !== 'Tirzepatide Bundled' &&
          potentialInsurance !== 'Weight Loss Sync' &&
          potentialInsurance !== PotentialInsuranceOption.FIRST_MONTH_FREE
        ) {
          addPotentialInsurance(null);
        }
        removeAppointment('Provider');
        Router.push(
          {
            pathname: `/patient-portal/weight-loss-treatment/glp1`,
            query: { confirm: true },
          },
          undefined,
          { shallow: false }
        );
        return;
      } else {
        Router.push(
          {
            pathname: `/patient-portal/weight-loss-treatment/glp1`,
            query: { ineligible: true },
          },
          undefined,
          { shallow: false }
        );
      }
    },
    [
      addPotentialInsurance,
      patient?.region,
      potentialInsurance,
      removeAppointment,
    ]
  );

  let y = 'Yes';
  let n = 'No';
  let hmo = 'Yes, but my plan is an HMO';
  if (language === 'esp' || language === 'esp') {
    y = 'Si';
    n = 'No';
    hmo =
      'Sí, pero mi plan es una HMO (Organización de Mantenimiento de Salud).';
  }

  return (
    <>
      <Typography variant="h2">Do you have government insurance?</Typography>
      <Stack direction="column" gap="8px" sx={{ mt: 3, mb: 3 }}>
        <Typography variant="body1">
          Zealthy's weight loss program is not available to members of
          government insurance programs such as Medicare, Medicaid, or Tricare.
        </Typography>
        <Typography variant="body1">
          If you have commercial or employer-sponsored insurance or if you are
          uninsured, you may continue signing up and will be able to get a
          weight loss treatment plan which may include GLP-1 medication such as
          Ozempic, Zepbound, Mounjaro, Wegovy, Semaglutide, or Tirzepatide.
        </Typography>
      </Stack>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <>
          <Button onClick={() => handleContinue('NO')}>No</Button>
          <Button color="grey" onClick={() => handleContinue('YES')}>
            {y}
          </Button>
        </>
      </Box>
    </>
  );
};

const IneligibleScreen = () => {
  return (
    <Stack direction="column" gap="8px" sx={{ mt: 3, mb: 3 }}>
      <Typography variant="body1">
        Due to regulations, if you have government insurance, you cannot request
        a name brand weight loss medication.
      </Typography>
      <Typography variant="body1">
        If your insurance status changes at any time and you are no longer a
        government insurance beneficiary, you may request medications here or
        message your care team help.
      </Typography>
      <Button onClick={() => Router.push('/patient-portal')} sx={{ mt: 3 }}>
        Go back to patient portal
      </Button>
    </Stack>
  );
};

const Question = () => {
  const answerAll = useAnswerSelect(answers => answers);
  const initialAnswer = answerAll['WEIGHT_L_Q6']?.answer || [];
  const initialAnswerArray = Array.isArray(initialAnswer)
    ? initialAnswer
        .map(a => ('code' in a ? a.code : null))
        .filter((code): code is string => code !== null)
    : [];
  const [selectedAnswers, setSelectedAnswers] =
    useState<string[]>(initialAnswerArray);
  const answerOptions = [
    { text: 'Keto or low carb', code: 'WEIGHT_L_Q6_A1' },
    { text: 'Plant-based', code: 'WEIGHT_L_Q6_A2' },
    { text: 'Macro or calorie counting', code: 'WEIGHT_L_Q6_A3' },
    { text: 'Weight Watchers', code: 'WEIGHT_L_Q6_A4' },
    { text: 'Noom', code: 'WEIGHT_L_Q6_A5' },
    { text: 'Calibrate', code: 'WEIGHT_L_Q6_A6' },
    { text: 'Found', code: 'WEIGHT_L_Q6_A7' },
    { text: 'Alpha', code: 'WEIGHT_L_Q6_A8' },
    { text: 'Push Health', code: 'WEIGHT_L_Q6_A9' },
    { text: 'None of the above', code: 'WEIGHT_L_Q6_A10' },
  ];

  const handleAnswer = (code: string) => {
    setSelectedAnswers(prev => {
      if (code === 'WEIGHT_L_Q6_A10') {
        return prev.includes(code) ? [] : [code];
      }
      return prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev.filter(c => c !== 'WEIGHT_L_Q6_A10'), code];
    });
  };

  return (
    <Container>
      <Typography variant="h2">
        Which of the following have you tried in the past?
      </Typography>
      <Typography variant="body1" mt={2} mb={2}>
        Select all that you've tried.
      </Typography>
      <Stack direction="column" gap="16px">
        <List
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            p: 0,
          }}
        >
          {answerOptions.map(a => {
            const isSelected = selectedAnswers.includes(a.code);
            return (
              <ListItemButton
                key={a.code}
                sx={{
                  backgroundColor: isSelected ? '#1976d2' : 'transparent',
                  color: isSelected ? '#ffffff' : '#000000',
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: isSelected ? '#1565c0' : '#f0f0f0',
                  },
                }}
                selected={isSelected}
                onClick={() => handleAnswer(a.code)}
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  sx={{ gap: '0.5rem' }}
                >
                  <Typography>{a.text}</Typography>
                </Box>
                {isSelected && <CheckMark />}
              </ListItemButton>
            );
          })}
        </List>
        <Button
          disabled={selectedAnswers.length === 0}
          onClick={() =>
            Router.push(
              {
                pathname: `/patient-portal/weight-loss-treatment/glp1`,
                query: { review: true },
              },
              undefined,
              { shallow: false }
            )
          }
        >
          Continue
        </Button>
      </Stack>
    </Container>
  );
};

type MedProps = {
  brand: string;
  drug: string;
  body1: string;
  body2: string;
  body3?: string;
};

const WeightLossGLP1Treatments = () => {
  const supabase = useSupabaseClient<Database>();
  const { updatePatient } = usePatientAsync();
  const { data: documents, refetch } = usePatientDocuments();
  const [loading, setLoading] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);
  const searchParams = useSearchParams();
  const medicationSelected = searchParams?.get('med');
  const review = searchParams?.get('review');
  const question = searchParams?.get('question');
  const insurance = searchParams?.get('insurance');
  const insChoice = searchParams?.get('insChoice');
  const pharmacy = searchParams?.get('pharmacy');
  const quantity = searchParams?.get('quantity');
  const confirm = searchParams?.get('confirm');
  const ineligible = searchParams?.get('ineligible');
  const { data: patient } = usePatient();
  const { data: prescriptionRequests } = useAllPatientPrescriptionRequest();
  const isTirzepatide = !!prescriptionRequests?.find(r =>
    r.specific_medication?.toLowerCase().includes('tirzepatide')
  );
  const [showMore, setShowMore] = useState(false);
  const { data: variation8685 } = useVWOVariationName('8685');

  useEffect(() => {
    if (review) {
      setLoadingReview(true);
      refetch().finally(() => {
        setLoadingReview(false);
      });
    }
  }, [review, refetch]);

  const { primaryMedications, hiddenMedications } = useMemo(() => {
    if (isTirzepatide) {
      return {
        primaryMedications: medications.filter(m => m.brand === 'Zepbound'),
        hiddenMedications: medications.filter(m => m.brand !== 'Zepbound'),
      };
    }
    return {
      primaryMedications: medications.filter(m => m.brand === 'Wegovy'),
      hiddenMedications: medications.filter(m => m.brand !== 'Wegovy'),
    };
  }, [isTirzepatide]);

  const hasUploadedInsuranceDocs = useMemo(() => {
    if (!documents || documents.length === 0) return false;
    return documents.some(
      doc => doc.name?.includes('front') || doc.name?.includes('back')
    );
  }, [documents]);

  let listItems = [
    {
      title: 'Upload your documents: ',
      body: 'Before we can review your Rx request, we need you to upload your insurance information, recent blood work, and choose a preferred pharmacy. Follow the action items on the home page of your patient portal.',
    },
    {
      title: 'Provider review: ',
      body: 'It generally takes 1-3 business days for your Zealthy provider to review your responses and, if clinically appropriate, we typically will start the process of getting your medication approved to be covered by insurance.',
    },
    {
      title: 'Prior authorization: ',
      body: 'You will be notified at that time that we are working on submitting a prior authorization to have your GLP-1 medication covered by your insurance, which typically takes 2-14 days. You can also choose to pay out of pocket, which means you won’t need to wait for our coordination team to get insurance approval to have your Rx covered.',
    },
    {
      title: 'Check your email and SMS: ',
      body: 'We’ll send you a message if your Provider has any questions or when your refill has been submitted to your pharmacy.',
    },
  ];

  if (hasUploadedInsuranceDocs) {
    listItems = listItems.filter(
      item => !item.title.includes('Upload your documents')
    );
  }

  const handleConfirmMed = useCallback(async () => {
    if (!patient?.id) return;
    setLoading(true);
    const prescriptionRequest = await supabase
      .from('prescription_request')
      .insert({
        status: 'REQUESTED',
        patient_id: patient?.id,
        region: patient?.region,
        medication_quantity_id: 124,
        shipping_method: 1,
        note: medicationSelected,
        specific_medication: medicationSelected,
      })
      .select()
      .maybeSingle();
    if (prescriptionRequest.status === 201) {
      const addToQueue = await supabase
        .from('task_queue')
        .insert({
          task_type: 'PRESCRIPTION_REQUEST',
          patient_id: patient?.id,
          queue_type: 'Provider (QA)',
        })
        .select()
        .maybeSingle()
        .then(({ data }) => data);
      if (prescriptionRequest.data?.id) {
        await supabase
          .from('prescription_request')
          .update({ queue_id: addToQueue?.id })
          .eq('id', prescriptionRequest.data?.id);
      }
      await updatePatient({ insurance_skip: false });
      toast.success(
        'Your prescription request has been successfully submitted!'
      );

      if (
        variation8685?.variation_name === 'Variation-1' ||
        variation8685?.variation_name === 'Variation-3'
      ) {
        Router.push(
          {
            pathname: `/patient-portal/weight-loss-treatment/glp1`,
            query: { pharmacy: true },
          },
          undefined,
          { shallow: false }
        );
      } else if (variation8685?.variation_name === 'Variation-4') {
        Router.push(
          {
            pathname: `/patient-portal/weight-loss-treatment/glp1`,
            query: { pharmacy: true },
          },
          undefined,
          { shallow: false }
        );
      } else {
        Router.push(
          {
            pathname: `/patient-portal/weight-loss-treatment/glp1`,
            query: { review: true },
          },
          undefined,
          { shallow: false }
        );
      }
      setLoading(false);
    }
  }, [medicationSelected, patient, supabase, updatePatient, variation8685]);

  function selectMedication(med: MedProps) {
    Router.push(
      {
        pathname: `/patient-portal/weight-loss-treatment/glp1`,
        query: { med: med.brand },
      },
      undefined,
      { shallow: true }
    );
    window.scrollTo({ top: 0, left: 0 });
  }

  const getNextQueryAfterPharmacy = () => {
    if (
      variation8685?.variation_name === 'Variation-1' ||
      variation8685?.variation_name === 'Variation-3'
    ) {
      return { insurance: true };
    } else if (variation8685?.variation_name === 'Variation-4') {
      return { insurance: true };
    }
    return { review: true };
  };

  const getNextQueryAfterInsurance = (choice: string) => {
    if (
      variation8685?.variation_name === 'Variation-1' ||
      variation8685?.variation_name === 'Variation-3'
    ) {
      return { review: true, insChoice: choice };
    } else if (variation8685?.variation_name === 'Variation-4') {
      return { question: true, insChoice: choice };
    }
    return { review: true, insChoice: choice };
  };

  return (
    <Container maxWidth="sm">
      {review && loadingReview && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Loading />
        </Box>
      )}
      {review && !loadingReview && (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h2" sx={{ mb: '1rem' }}>
            Your responses are being reviewed!
          </Typography>
          <Typography variant="body1" sx={{ mb: '2rem' }}>
            Your Zealthy Provider may reach out to you if they have any
            additional questions. Here's what's next:
          </Typography>
          <List
            sx={{ listStyleType: 'disc', pl: 3, mb: '3rem' }}
            disablePadding
          >
            {listItems.map((item, index) => (
              <ListItem key={index} sx={{ display: 'list-item', p: 0 }}>
                {item.title && <b>{item.title}</b>}
                {item.body}
              </ListItem>
            ))}
            <ListItem sx={{ display: 'list-item', p: 0 }}>
              While you wait, chat with your coach or coordinator if you have
              questions about what to expect with your refill. If you would
              prefer to have your Rx sent to a different pharmacy than you have
              on your profile, then update it using this{' '}
              <Link href="/patient-portal/profile?page=pharmacy">link</Link>.
            </ListItem>
          </List>
          <Button fullWidth onClick={() => Router.push('/patient-portal')}>
            Continue
          </Button>
        </Box>
      )}
      {!confirm &&
        !ineligible &&
        !medicationSelected &&
        !review &&
        !pharmacy &&
        !insurance &&
        !question &&
        (variation8685?.variation_name === 'Variation-1' ||
        variation8685?.variation_name === 'Variation-3' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h2" sx={{ mb: '1rem' }}>
              Confirm your preferred treatment option.
            </Typography>
            <Typography variant="body1" sx={{ mb: '3rem' }}>
              {`While you should share your preferred treatment option,
              your provider will ultimately only move forward with a treatment
              option that is medically appropriate for you. Both of these medication
              options will be included in the price of your membership at no additional
              cost to you and will be shipped to your door.`}
            </Typography>
            <Box sx={{ mb: '3rem' }}>
              {primaryMedications.map((med, i) => (
                <Box
                  key={`primary-med-${i}`}
                  sx={{
                    p: '2rem 2.5rem 1rem 2.5rem',
                    borderRadius: '1rem',
                    background: '#ffffff',
                    boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    mb: '1rem',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '1.3rem !important',
                      fontWeight: 700,
                      mb: '0.5rem',
                    }}
                  >
                    {med.brand}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 500, mb: '1rem' }}
                  >
                    {med.drug}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: '1rem',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {med.body1}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: '1rem' }}>
                    {med.body2}
                  </Typography>
                  {med.body3 && (
                    <Typography variant="body1" sx={{ mb: '1rem' }}>
                      {med.body3}
                    </Typography>
                  )}
                  <Button onClick={() => selectMedication(med)}>
                    Review treatment
                  </Button>
                </Box>
              ))}
              {/* Add View More button and hidden medications if needed */}
              {hiddenMedications.length > 0 && (
                <>
                  {showMore &&
                    hiddenMedications.map((med, i) => (
                      <Box
                        key={`hidden-med-${i}`}
                        sx={{
                          p: '2rem 2.5rem 1rem 2.5rem',
                          borderRadius: '1rem',
                          background: '#ffffff',
                          boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
                          display: 'flex',
                          flexDirection: 'column',
                          mb: '1rem',
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '1.3rem !important',
                            fontWeight: 700,
                            mb: '0.5rem',
                          }}
                        >
                          {med.brand}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            mb: '1rem',
                          }}
                        >
                          {med.drug}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            mb: '1rem',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {med.body1}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: '1rem' }}>
                          {med.body2}
                        </Typography>
                        {med.body3 && (
                          <Typography variant="body1" sx={{ mb: '1rem' }}>
                            {med.body3}
                          </Typography>
                        )}
                        <Button onClick={() => selectMedication(med)}>
                          Review treatment
                        </Button>
                      </Box>
                    ))}
                  <Button
                    color="grey"
                    fullWidth
                    onClick={() => setShowMore(m => !m)}
                  >
                    {showMore ? 'View less' : 'View more'}
                    {showMore ? (
                      <KeyboardArrowUpIcon />
                    ) : (
                      <KeyboardArrowDownIcon />
                    )}
                  </Button>
                </>
              )}
            </Box>
          </Box>
        ) : (
          // For control, variation 2, and new variation 4, show the government insurance page
          <WeightLossEligible />
        ))}
      {insurance && (
        <InsuranceInformation
          nextPage={choice => {
            Router.push(
              {
                pathname: '/patient-portal/weight-loss-treatment/glp1',
                query: getNextQueryAfterInsurance(choice || ''),
              },
              undefined,
              { shallow: false }
            );
          }}
        />
      )}
      {ineligible &&
        (variation8685?.variation_name === 'Variation-1' ||
        variation8685?.variation_name === 'Variation-3' ? (
          <></>
        ) : (
          <IneligibleScreen />
        ))}
      {question &&
        (variation8685?.variation_name === 'Variation-4' ? (
          <Question />
        ) : (
          <></>
        ))}
      {pharmacy && (
        <PharmacySelection
          patient={patient!}
          onCancel={() => {
            Router.push(
              {
                pathname: '/patient-portal/weight-loss-treatment/glp1',
                query: getNextQueryAfterPharmacy(),
              },
              undefined,
              { shallow: false }
            );
          }}
        />
      )}
      {confirm &&
        !review &&
        !pharmacy &&
        !insurance &&
        !medicationSelected &&
        variation8685?.variation_name !== 'Variation-1' &&
        variation8685?.variation_name !== 'Variation-3' && (
          <>
            <Typography variant="h2" sx={{ mb: '1rem' }}>
              Confirm your preferred treatment option.
            </Typography>
            <Typography variant="body1" sx={{ mb: '3rem' }}>
              {`While you should share your preferred treatment option,
            your provider will ultimately only move forward with a treatment
            option that is medically appropriate for you. Both of these medication
            options will be included in the price of your membership at no additional
            cost to you and will be shipped to your door.`}
            </Typography>
            <Box sx={{ mb: '3rem' }}>
              {primaryMedications.map((med, i) => (
                <Box
                  key={`primary-med-${i}`}
                  sx={{
                    p: '2rem 2.5rem 1rem 2.5rem',
                    borderRadius: '1rem',
                    background: '#ffffff',
                    boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    mb: '1rem',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '1.3rem !important',
                      fontWeight: 700,
                      mb: '0.5rem',
                    }}
                  >
                    {med.brand}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 500, mb: '1rem' }}
                  >
                    {med.drug}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: '1rem',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {med.body1}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: '1rem' }}>
                    {med.body2}
                  </Typography>
                  {med.body3 && (
                    <Typography variant="body1" sx={{ mb: '1rem' }}>
                      {med.body3}
                    </Typography>
                  )}
                  <Button onClick={() => selectMedication(med)}>
                    Review treatment
                  </Button>
                </Box>
              ))}
              {hiddenMedications.length > 0 && (
                <>
                  {showMore &&
                    hiddenMedications.map((med, i) => (
                      <Box
                        key={`hidden-med-${i}`}
                        sx={{
                          p: '2rem 2.5rem 1rem 2.5rem',
                          borderRadius: '1rem',
                          background: '#ffffff',
                          boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
                          display: 'flex',
                          flexDirection: 'column',
                          mb: '1rem',
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '1.3rem !important',
                            fontWeight: 700,
                            mb: '0.5rem',
                          }}
                        >
                          {med.brand}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            mb: '1rem',
                          }}
                        >
                          {med.drug}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            mb: '1rem',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {med.body1}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: '1rem' }}>
                          {med.body2}
                        </Typography>
                        {med.body3 && (
                          <Typography variant="body1" sx={{ mb: '1rem' }}>
                            {med.body3}
                          </Typography>
                        )}
                        <Button onClick={() => selectMedication(med)}>
                          Review treatment
                        </Button>
                      </Box>
                    ))}
                  <Button
                    color="grey"
                    fullWidth
                    onClick={() => setShowMore(m => !m)}
                  >
                    {showMore ? 'View less' : 'View more'}
                    {showMore ? (
                      <KeyboardArrowUpIcon />
                    ) : (
                      <KeyboardArrowDownIcon />
                    )}
                  </Button>
                </>
              )}
            </Box>
          </>
        )}
      {medicationSelected && !review && !quantity && !insurance && (
        <>
          <Typography variant="h2" sx={{ mb: '1rem' }}>
            {details[medicationSelected].title}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              mb: '3rem',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                mb: '0.5rem',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                sx={{
                  fontSize: '1rem !important',
                  flexBasis: '25%',
                }}
              >
                Overview
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  color: '#777777',
                  flexBasis: '75%',
                }}
              >
                {details[medicationSelected].overview}
              </Typography>
            </Box>
            <Divider sx={{ mb: '0.5rem' }} />
            <Box
              sx={{
                display: 'flex',
                mb: '0.5rem',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                sx={{
                  fontSize: '1rem !important',
                  flexBasis: '25%',
                }}
              >
                Results
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  color: '#777777',
                  flexBasis: '75%',
                }}
              >
                {details[medicationSelected].results}
              </Typography>
            </Box>
            <Divider sx={{ mb: '0.5rem' }} />
            <Box
              sx={{
                display: 'flex',
                mb: '0.5rem',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                sx={{
                  fontSize: '1rem !important',
                  flexBasis: '25%',
                }}
              >
                Cost
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flexBasis: '75%',
                }}
              >
                {details[medicationSelected].cost && (
                  <Typography
                    key="cost"
                    sx={{
                      fontSize: '0.875rem',
                      color: '#777777',
                      flexBasis: '75%',
                      mb: '1rem',
                    }}
                  >
                    {details[medicationSelected].cost}
                  </Typography>
                )}
              </Box>
            </Box>
            <Divider sx={{ mb: '0.5rem' }} />
          </Box>
          <LoadingButton
            type="button"
            loading={loading}
            disabled={loading}
            fullWidth
            sx={{ mb: '1rem', fontSize: '14px' }}
            onClick={handleConfirmMed}
          >
            Select as preferred medication and continue
          </LoadingButton>
        </>
      )}
    </Container>
  );
};

export default WeightLossGLP1Treatments;
