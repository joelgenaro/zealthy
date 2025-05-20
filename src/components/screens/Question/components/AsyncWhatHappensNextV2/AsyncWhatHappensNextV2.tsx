import { usePatient, usePatientInvoices } from '@/components/hooks/data';
import { useSelector } from '@/components/hooks/useSelector';
import Bell from '@/components/shared/icons/Bell';
import { useEffect } from 'react';
import TextItem from './components/TextItem';
import UncompletedSign from './components/UncompletedSign';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { useVWOVariationName } from '@/components/hooks/data';
import { stat } from 'fs';
import { useIntakeState } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useVWO } from '@/context/VWOContext';

const AsyncWhatHappensNext = () => {
  const { data: labKitInvoice } = usePatientInvoices(72.5);
  const { data: variation54832, status: status54832 } =
    useVWOVariationName('5483-2');
  const { specificCare } = useIntakeState();

  const asyncMentalHealth = useSelector(store =>
    store.visit.selectedCare.careSelections.find(
      c => c.reason === 'Mental health'
    )
  );
  const enclomiphene = useSelector(store =>
    store.visit.selectedCare.careSelections.find(
      c => c.reason === 'Enclomiphene'
    )
  );
  const skincare = useSelector(
    store => store.intake?.specificCare === 'Skincare'
  );
  const femaleHairLoss = useSelector(
    store => store.intake?.specificCare === 'Hair Loss'
  );
  const preworkout = useSelector(
    store => store.intake?.specificCare === 'Preworkout'
  );

  const { data: patient } = usePatient();
  const vwoContext = useVWO();
  const variation8552_2 = vwoContext.getVariationName(
    '8552_2',
    String(patient?.id)
  );

  useEffect(() => {
    if (
      variation8552_2 === 'Variation-1' &&
      ['KS', 'KY', 'LA', 'MA', 'MD', 'MI'].includes(patient?.region || '') &&
      specificCare === SpecificCareOption.ERECTILE_DYSFUNCTION
    ) {
      sessionStorage.setItem('showExclusiveOfferEd', 'true');
    }
  }, [variation8552_2]);
  useEffect(() => {
    if (asyncMentalHealth) {
      window?.freshpaint?.track('amh-checkout-page-success', {
        email: patient?.profiles?.email!,
        first_name: patient?.profiles?.first_name!,
        last_name: patient?.profiles?.last_name!,
        state: patient?.region,
        birth_date: patient?.profiles?.birth_date,
        gender: patient?.profiles?.gender,
        phone: patient?.profiles?.phone_number,
      });
    }
    if (enclomiphene) {
      window?.freshpaint?.track('prescription-request-submitted-enclomiphene');
      window.VWO?.event('prescriptionRequestedEnclomiphene');
    }
    if (skincare) {
      window?.freshpaint?.track('prescription-request-submitted-skincare');
    }
    if (femaleHairLoss) {
      window?.freshpaint?.track('female-hair-loss-checkout-success');
    }
    if (preworkout) {
      window?.freshpaint?.track('preworkout-completed-flow');
    }
  }, [
    asyncMentalHealth,
    enclomiphene,
    femaleHairLoss,
    patient,
    preworkout,
    skincare,
  ]);

  return (
    <Stack direction="column" gap="22px">
      <TextItem
        header="Your Visit"
        body="Your medical intake responses and prescription request has been sent for review by a licensed Zealthy provider."
        hasCompleted
      />
      <TextItem
        header="ID Verification"
        body="You submitted a photo of your photo ID. If the ID you submitted was not valid, you will not be able to continue to get your Rx. You can resubmit in your patient portal if necessary."
        hasCompleted
      />
      {asyncMentalHealth ? (
        <TextItem
          header="Consider a Zealthy Mental Health Coach"
          body="While you wait for your provider to review your prescription request, you can get started with unlimited messaging and optional video or phone calls with an expert Zealthy mental health coach."
          hasCompleted={false}
        />
      ) : null}
      {enclomiphene && labKitInvoice?.length ? (
        <TextItem
          header="Receive and send lab kit"
          body="You’ll receive your lab kit within the next 3-4 business days."
          body2="Make sure to follow the instructions on the package, register your kit and ship it. The instructions will tell you to complete your labs and then ship it by scheduling pickup online or by phone with UPS, which you will be able to do from a QR code that you’ll receive in your kit. The box should have the pre-printed label for UPS shipping."
          body3="Results are typically available within 5 to 7 business days of the lab processing your sample."
          hasCompleted={false}
        />
      ) : null}
      <Stack direction="row">
        <UncompletedSign />
        <Stack direction="column">
          <Typography variant="h2" marginBottom="8px">
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
              fontWeight: '300',
              marginBottom: '16px',
            }}
          >
            {enclomiphene
              ? 'Your Zealthy provider will review your labs first then will review your prescription request.'
              : 'Your Zealthy provider will review your order.'}
          </Typography>
          <List
            sx={{
              listStyleType: 'disc',
              pl: 3,
              marginBottom: '8px',
            }}
            disablePadding
          >
            {enclomiphene ? (
              <ListItem sx={{ display: 'list-item', padding: 0 }}>
                <Typography>{'Review your lab results'}</Typography>
              </ListItem>
            ) : null}
            <ListItem sx={{ display: 'list-item', padding: 0 }}>
              <Typography>{'Review your medical history'}</Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', padding: 0 }}>
              <Typography>
                {'Determine if a prescription is right for you'}
              </Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', padding: 0 }}>
              <Typography>
                {'Leave you a message in your account regarding your treatment'}
              </Typography>
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
      <TextItem
        header="Treatment Shipped"
        body="If approved, your prescription is charged to the card you provided and shipped to you discreetly."
        hasCompleted={false}
        hasNext={false}
      />
    </Stack>
  );
};

export default AsyncWhatHappensNext;
