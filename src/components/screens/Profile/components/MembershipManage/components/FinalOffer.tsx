import {
  useCompoundMatrix,
  usePatient,
  usePatientPrescriptions,
  useVWOVariationName,
} from '@/components/hooks/data';
import { useNextDosage } from '@/components/hooks/useTitrationSelection';
import { useVisitActions } from '@/components/hooks/useVisit';
import { CompoundDetailProps } from '@/components/screens/Question/components/CompoundWeightLossRefillTreatment/CompoundWeightLossRefillTreatment';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import { Box, Button, Checkbox, Stack, Typography } from '@mui/material';
import Router from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import klarnaBadge from 'public/images/klarna-badge.png';

const FinalOffer = () => {
  const { id } = Router.query;
  const { data: patientInfo } = usePatient();
  const { data: patientPrescriptions } = usePatientPrescriptions();
  const { data: compoundMatrix } = useCompoundMatrix();
  const [compoundDetails, setCompoundDetails] =
    useState<CompoundDetailProps | null>(null);
  const { addMedication, resetMedications } = useVisitActions();

  const isTirz = useMemo(() => {
    return patientPrescriptions?.some(
      p =>
        p.medication?.toLowerCase().includes('tirzepatide') ||
        p.medication?.toLowerCase().includes('zepbound') ||
        p.medication?.toLowerCase().includes('mounjaro')
    );
  }, [patientPrescriptions]);

  const medName = useMemo(() => {
    return isTirz ? 'Tirzepatide' : 'Semaglutide';
  }, [isTirz]);

  const next1MonthDosage = useNextDosage(
    patientInfo!,
    `${medName.toLowerCase()}_monthly`,
    compoundMatrix!,
    medName,
    patientPrescriptions,
    true
  );
  const next3MonthDosage = useNextDosage(
    patientInfo!,
    `${medName.toLowerCase()}_multi_month`,
    compoundMatrix!,
    medName,
    patientPrescriptions,
    true
  );

  const fetchCompoundDetails = useCallback(() => {
    const object: CompoundDetailProps = {
      [medName]: {
        saving: Math.round(
          (135 - 108) * 2 +
            (next1MonthDosage?.price! * 3 - next3MonthDosage?.price!)
        ),
        name: medName,
        title:
          'Buy 3 month supply of medication & get 20% off for a limited time',
        singleTitle: 'Buy 1 month supply of medication',
        singleDescription: `$${next1MonthDosage?.price} for your next month of ${medName}`,
        body1:
          'You’ll get 20% off the next 3 months of your weight loss membership. This means your next 3 months of membership will be just $108/month.',
        body2:
          'In order to receive a 3 month supply of your medication, you will need to pay for your next 2 months of your membership because your Zealthy provider will need to be able to monitor your care over the next 3 months at least.',
        medData: {
          name: `${medName} weekly injections`,
          type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
          price: next1MonthDosage?.price!,
          dosage: `${next1MonthDosage?.med?.vial_size?.trim()}${
            next1MonthDosage?.med?.shipment_breakdown?.length === 3 &&
            next1MonthDosage?.med?.pharmacy === 'Empower'
              ? ` (3 vials included - ${next1MonthDosage?.med?.shipment_breakdown?.join(
                  ', '
                )})`
              : next1MonthDosage?.med?.shipment_breakdown?.length === 3 &&
                next1MonthDosage?.med?.pharmacy !== 'Red Rock'
              ? ` (3 vials included in shipment - ${next1MonthDosage?.med?.shipment_breakdown?.join(
                  ', '
                )})`
              : next1MonthDosage?.med?.shipment_breakdown?.length === 3 &&
                next1MonthDosage?.med?.pharmacy === 'Red Rock'
              ? ` (3 shipments - ${next1MonthDosage?.med?.shipment_breakdown?.join(
                  ', '
                )})`
              : next1MonthDosage?.med?.number_of_vials === 2
              ? ` (2 vials included in shipment - ${next1MonthDosage?.med?.shipment_breakdown?.join(
                  ', '
                )})`
              : next1MonthDosage?.med?.number_of_vials === 1 &&
                next1MonthDosage?.med?.duration_in_days === 90
              ? ``
              : ''
          }`,

          dose: next1MonthDosage?.med?.dose,
          quantity: 1,
          recurring: {
            interval: 'month',
            interval_count: 1,
          },
          medication_quantity_id: 98,
          matrixId: next1MonthDosage?.med?.id!,
          currMonth: next1MonthDosage?.med?.current_month!,
        },
        medBulkData: {
          name: `${medName} weekly injections`,
          type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
          price: next3MonthDosage?.price,
          discounted_price: next3MonthDosage?.price! / 3,
          dosage: `${next3MonthDosage?.med?.vial_size?.trim()}${
            next3MonthDosage?.med?.shipment_breakdown?.length === 3 &&
            next3MonthDosage?.med?.pharmacy === 'Empower'
              ? ` (3 vials included - ${next3MonthDosage?.med?.shipment_breakdown?.join(
                  ', '
                )})`
              : next3MonthDosage?.med?.shipment_breakdown?.length === 3 &&
                next3MonthDosage?.med?.pharmacy !== 'Red Rock'
              ? ` (3 vials included in shipment - ${next3MonthDosage?.med?.shipment_breakdown?.join(
                  ', '
                )})`
              : next3MonthDosage?.med?.shipment_breakdown?.length === 3 &&
                next3MonthDosage?.med?.pharmacy === 'Red Rock'
              ? ` (3 shipments - ${next3MonthDosage?.med?.shipment_breakdown?.join(
                  ', '
                )})`
              : next3MonthDosage?.med?.number_of_vials === 2
              ? ` (2 vials included in shipment - ${next3MonthDosage?.med?.shipment_breakdown?.join(
                  ', '
                )})`
              : next3MonthDosage?.med?.number_of_vials === 1 &&
                next3MonthDosage?.med?.duration_in_days === 90
              ? ``
              : ''
          }`,
          dose: next3MonthDosage?.med?.dose,
          quantity: 1,
          recurring: {
            interval: 'month',
            interval_count: 3,
          },
          medication_quantity_id: 98,
          matrixId: next3MonthDosage?.med?.id!,
          currMonth: next3MonthDosage?.med?.current_month!,
        },
      },
    };
    setCompoundDetails(object);
  }, [
    next1MonthDosage?.med?.current_month,
    next1MonthDosage?.med?.dose,
    next1MonthDosage?.med?.duration_in_days,
    next1MonthDosage?.med?.id,
    next1MonthDosage?.med?.number_of_vials,
    next1MonthDosage?.med?.pharmacy,
    next1MonthDosage?.med?.shipment_breakdown,
    next1MonthDosage?.med?.vial_size,
    next1MonthDosage?.price,
    next3MonthDosage?.med?.current_month,
    next3MonthDosage?.med?.dose,
    next3MonthDosage?.med?.duration_in_days,
    next3MonthDosage?.med?.id,
    next3MonthDosage?.med?.number_of_vials,
    next3MonthDosage?.med?.pharmacy,
    next3MonthDosage?.med?.shipment_breakdown,
    next3MonthDosage?.med?.vial_size,
    next3MonthDosage?.price,
  ]);

  useEffect(() => {
    fetchCompoundDetails();
  }, [fetchCompoundDetails, next1MonthDosage?.med, next3MonthDosage?.med]);

  const hasPrescription = useMemo(() => {
    console.log('patientPrescriptions', patientPrescriptions);
    return patientPrescriptions?.length ?? 0 > 0;
  }, [patientPrescriptions]);

  async function handleConfirmQuantity() {
    resetMedications();
    if (selectedOffer === 0) {
      addMedication(compoundDetails?.[medName].medBulkData!);
    } else {
      addMedication(compoundDetails?.[medName].medData!);
    }

    const targetPath = hasPrescription
      ? '/patient-portal/questionnaires-v2/weight-loss-compound-refill/TREATMENT_OPTIONS'
      : '/patient-portal/weight-loss-treatment/compound';

    Router.push(
      {
        pathname: targetPath,
        query: {
          med: medName,
          review: 'true',
          checked: selectedOffer === 0 ? 'bulk' : 'single',
          quantity: 'false',
        },
      },
      undefined,
      { shallow: true }
    );
    window.scrollTo({ top: 0, left: 0 });
  }

  const medInformation = [
    {
      title: '20% off a 3 month supply of medication',
      medication: `${medName} ${next3MonthDosage?.med?.vial_size}`,
      medicationDescription: hasPrescription
        ? medName === 'Tirzepatide'
          ? `On average, people lose 7% of their weight taking tirzepatide for 3 months**`
          : `On average, people lose 5% of their weight taking Semaglutide for 3 months**`
        : medName === 'Semaglutide'
        ? `On average, people lose 7% of their weight in their first 3 months of Semaglutide**`
        : `On average, people lose 8% of their weight in their first 3 months of Tirzepatide**`,
      oldprice: `$${Math.round(next1MonthDosage?.price!)}/month`,
      newprice: `$${parseFloat(
        (next3MonthDosage?.price! / 3).toFixed(2)
      )}/month`,
      savings: `$${parseFloat(
        (next1MonthDosage?.price! - next3MonthDosage?.price! / 3).toFixed(2)
      )}/month`,
    },
    {
      title: '10% off a 1 month supply of medication',
      medication: `${medName} ${next1MonthDosage?.med?.vial_size}`,
      medicationDescription:
        medName === 'Semaglutide'
          ? `On average, people lose 2% of their weight after 1 month on Semaglutide**`
          : `On average, people lose 3% of their weight after 1 month on Tirzepatide**`,
      oldprice: undefined,
      newprice: `$${Math.round(next1MonthDosage?.price!)}/month`,
      savings: undefined,
    },
  ];

  const [selectedOffer, setSelectedOffer] = useState(0);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        borderRadius: '16px',
        marginBottom: '24px',
      }}
    >
      <>
        <Typography
          variant="h2"
          sx={{
            marginBottom: '1rem',
          }}
        >
          Best & Final: Our Best Offer to Keep You on Track
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: '2rem' }}>
          Right now, Zealthy is offering a 20% discount on your medication and 1
          month free of your membership if you purchase a 3 month supply.
        </Typography>
        <Stack>
          {medInformation.map((med, index) => (
            <Box
              key={med.title}
              onClick={() => setSelectedOffer(index)}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                border: '1px solid #E0E0E0',
                borderColor: selectedOffer === index ? '#00531a' : '#E0E0E0',
                borderWidth: selectedOffer === index ? '2px' : '1px',
              }}
            >
              <Stack direction="row" spacing={2}>
                <Box>
                  <Checkbox
                    value={index}
                    checked={selectedOffer === index}
                    onChange={() => setSelectedOffer(index)}
                  />
                </Box>
                <Stack>
                  <Typography
                    variant="h2"
                    sx={{
                      marginBottom: '1rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {med.title}
                  </Typography>
                  <Typography variant="body1">{med.medication}</Typography>
                  <Typography variant="body2">
                    {med.medicationDescription}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {med.oldprice && (
                      <Typography
                        variant="body2"
                        sx={{
                          textDecoration: 'line-through',
                        }}
                      >
                        {med.oldprice}
                      </Typography>
                    )}
                    <Typography variant="body2">{med.newprice}</Typography>
                  </Stack>
                  {med.savings && (
                    <Typography variant="body2">
                      You Save: {med.savings}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>
        {selectedOffer === 0 ? (
          <LoadingButton
            onClick={() => handleConfirmQuantity()}
            sx={{
              backgroundColor: '#ffffff',
              color: '#000000',
              width: '100%',
              marginBottom: 2,
            }}
          >
            <Typography fontWeight={700}>Pay with</Typography>
            <Image
              alt="klarna-badge"
              src={klarnaBadge}
              width={100}
              style={{
                height: 'auto',
                maxWidth: '100%',
                objectFit: 'contain',
              }}
            />
          </LoadingButton>
        ) : null}
        <Button
          fullWidth
          size="small"
          onClick={() => handleConfirmQuantity()}
          sx={{
            fontWeight: '600',
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          Pay with card
        </Button>
        <Button
          fullWidth
          color="grey"
          size="small"
          onClick={() => {
            Router.push(
              {
                query: {
                  id,
                  page: 'goodbye',
                },
              },
              undefined,
              { shallow: true }
            );
          }}
        >
          {'Continue unsubscribe'}
        </Button>
      </>
    </Box>
  );
};

export default FinalOffer;
