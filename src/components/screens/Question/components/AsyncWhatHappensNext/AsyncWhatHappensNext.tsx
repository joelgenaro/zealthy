import { usePatient } from '@/components/hooks/data';
import Bell from '@/components/shared/icons/Bell';
import CheckMark from '@/components/shared/icons/CheckMark';
import Timer from '@/components/shared/icons/Timer';
import { Database } from '@/lib/database.types';
import { Stack, Box, Divider, Typography, List, ListItem } from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface MedicationProps {
  medication_quantity: {
    medication_dosage: {
      medication: {
        name: string;
        display_name?: string;
      };
      dosage: {
        dosage: string;
      };
    };
    quantity: {
      quantity: number;
    };
  };
}

interface AsyncWhatHappensNextProps {}

const AsyncWhatHappensNext = ({}: AsyncWhatHappensNextProps) => {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const [medicationInfo, setMedicationInfo] = useState<MedicationProps | null>(
    null
  );

  const fetchMedRequest = useCallback(
    async (patientId: number) => {
      const med = await supabase
        .from('prescription_request')
        .select(
          `medication_quantity ( medication_dosage ( medication ( name, display_name ), dosage (dosage )), quantity (quantity))`
        )
        .eq('patient_id', patientId)
        .limit(1)
        .single();
      setMedicationInfo(med.data as MedicationProps);
    },
    [supabase]
  );

  const wording = useMemo(() => {
    if (
      !medicationInfo ||
      ['Birth Control Medication', 'Mental Health Medication'].includes(
        medicationInfo.medication_quantity.medication_dosage.medication
          .display_name || ''
      )
    )
      return [];

    if (
      medicationInfo.medication_quantity.medication_dosage.medication
        .display_name === 'Acne treatment'
    ) {
      return [
        'Prescription skincare treatment',
        'Dosage determined by provider',
        'Shipped every 3 months',
      ];
    }

    return [
      `${medicationInfo?.medication_quantity?.medication_dosage?.medication?.name}`,
      `${medicationInfo?.medication_quantity?.medication_dosage?.dosage?.dosage}`,
      `Refill every ${medicationInfo?.medication_quantity?.quantity?.quantity} days`,
    ];
  }, [medicationInfo]);

  useEffect(() => {
    if (medicationInfo === null && patient?.id) {
      fetchMedRequest(patient.id);
    }
  }, [fetchMedRequest, medicationInfo, patient?.id]);

  return (
    <Stack direction="column" gap="22px">
      <Stack direction="row">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '40px',
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: '16px',
          }}
        >
          <Box
            sx={{
              width: '40px',
              height: '40px',
              backgroundColor: '#005315',
              borderRadius: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckMark stroke="#ffffff" />
          </Box>
          <Divider
            orientation="vertical"
            textAlign="left"
            sx={{
              height: '144px',
              border: '2px solid #005315',
            }}
          />
        </Box>
        <Stack direction="column" gap="16px">
          <Typography
            variant="h2"
            sx={{ fontSize: '22px !important' }}
            color="#005315"
          >
            {'Your Visit'}
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: '16px !important', fontWeight: '300' }}
          >
            {
              'Your medical intake responses and prescription request has been sent for review by a licensed Zealthy provider.'
            }
          </Typography>
          <List
            sx={{
              listStyleType: 'disc',
              pl: 3,
              marginBottom: '8px',
            }}
            disablePadding
          >
            {wording.map(text => (
              <ListItem key={text} sx={{ display: 'list-item', padding: 0 }}>
                {text}
              </ListItem>
            ))}
          </List>
        </Stack>
      </Stack>
      <Stack direction="row">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '40px',
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: '16px',
          }}
        >
          <Box
            sx={{
              width: '40px',
              height: '40px',
              backgroundColor: '#000000',
              borderRadius: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Timer stroke="#FFFFFF" />
          </Box>
          <Divider
            orientation="vertical"
            textAlign="left"
            sx={{
              height: '74px',
              border: '2px dashed #B5BABC',
            }}
          />
        </Box>
        <Stack direction="column" gap="16px">
          <Typography
            variant="h2"
            sx={{ fontSize: '22px !important' }}
            color="#000000"
          >
            {'ID Verification'}
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: '16px !important', fontWeight: '300' }}
          >
            {
              "To access treatment, we need a photo of your valid driver's license or passport. Make sure you have a photo of your ID or your physical ID, since we'll need this for you to get your medication."
            }
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '40px',
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: '16px',
          }}
        >
          <Box
            sx={{
              width: '40px',
              height: '40px',
              backgroundColor: 'transparent',
              border: '2px dashed #B5BABC',
              borderRadius: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Timer stroke="#B5BABC" />
          </Box>
          <Divider
            orientation="vertical"
            textAlign="left"
            sx={{
              height: '180px',
              border: '2px dashed #B5BABC',
            }}
          />
        </Box>
        <Stack direction="column">
          <Typography
            variant="h2"
            sx={{ fontSize: '22px !important' }}
            color="#000000"
            marginBottom="8px"
          >
            {'Provider Review'}
          </Typography>
          <Box
            sx={{
              background: '#FFE792',
              borderRadius: '38px',
              width: '173px',
              height: '24px',
              padding: '4px 12px',
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontSize: '12px !important',
                lineHeight: '16px !important',
                fontWeight: '500',
                letterSpacing: '-0.006em',
                color: '#231A04',
              }}
            >
              {'Avg. response time: 12 hrs'}
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{
              fontSize: '16px !important',
              fontWeight: '300',
              marginBottom: '16px',
            }}
          >
            {'Your Zealthy provider will review your order.'}
          </Typography>
          <List
            sx={{
              listStyleType: 'disc',
              pl: 3,
              marginBottom: '8px',
            }}
            disablePadding
          >
            <ListItem sx={{ display: 'list-item', padding: 0 }}>
              {'Review your medical history'}
            </ListItem>
            <ListItem sx={{ display: 'list-item', padding: 0 }}>
              {'Determine if a prescription is right for you'}
            </ListItem>
            <ListItem sx={{ display: 'list-item', padding: 0 }}>
              {'Leave you a message in your account regarding your treatment'}
            </ListItem>
          </List>
          <Box
            sx={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <Bell />
            <Typography variant="subtitle1" sx={{ color: '#978053' }}>
              {"You'll be notified via SMS and email"}
            </Typography>
          </Box>
        </Stack>
      </Stack>
      <Stack direction="row">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '40px',
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: '16px',
          }}
        >
          <Box
            sx={{
              width: '40px',
              height: '40px',
              backgroundColor: 'transparent',
              border: '2px dashed #B5BABC',
              borderRadius: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Timer stroke="#B5BABC" />
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <Typography
            variant="h2"
            sx={{ fontSize: '22px !important' }}
            color="#000000"
          >
            {'Treatment Shipped'}
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: '16px !important', fontWeight: '300' }}
          >
            {
              'If approved, your prescription is charged to the card you provided and shipped to you discreetly.'
            }
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
};

export default AsyncWhatHappensNext;
