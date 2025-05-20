import { Box, List, ListItem, TextField, Typography } from '@mui/material';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { usePatient } from '@/components/hooks/data';
import { useIntakeState } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import DOMPurify from 'dompurify';

interface AddWeighLossCoachingProps {
  onNext: () => void;
}

const agreement = (
  payerName: string
) => `${payerName} Florida members are eligible for Z-Plan, Zealthy’s Access Only Program for ${payerName} Members including:

- Access to scheduling with doctors or medical professionals who can consider your request for GLP-1s or similar medications and provide a prescription if medically appropriate
- Assistance with prior authorization if your ${payerName} plan will cover the medication; if and only if ${payerName} will not cover your medication, assistance with affordable out of pocket medication options
- Unlimited messaging with an unlicensed coach who can help you build customized plan
- Tracking your weight loss progress and goals

Z-Plan by Zealthy is $79/month and does not cover your visits with a provider, which should be covered by your ${payerName} plan. For a limited time, the first month of access is only $39. You will be automatically charged every month, but if you choose to cancel your membership then you will still have access to your weight loss subscription for the remaining days of the membership. Zealthy will refund patients if the health care provider ceases to offer health care services for any reason. Zealthy allows the party to terminate the agreement by giving the party at least 30 days’ advance written notice.

This agreement is not health insurance and the health care provider will not file any claims against the patient’s health insurance policy or plan for reimbursement of any health care services covered by the agreement. This agreement does not qualify as minimum essential coverage to satisfy the individual shared responsibility provision of the Patient Protection and Affordable Care Act, 26 U.S.C. s. 5000A. This agreement is not workers’ compensation insurance and does not replace an employer’s obligations under chapter 440.
`;
const WeightLossAgreement = ({ onNext }: AddWeighLossCoachingProps) => {
  const supabase = useSupabaseClient<Database>();
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const { potentialInsurance } = useIntakeState();
  const { data: patient } = usePatient();
  const { specificCare } = useIntakeState();

  const handleSignature = (e: ChangeEvent<HTMLInputElement>) =>
    setSignature(e.target.value);

  const payerName = useMemo(() => {
    return potentialInsurance === 'Medicaid Access Florida'
      ? 'Medicaid'
      : 'Medicare';
  }, [potentialInsurance]);

  const handleContinue = useCallback(async () => {
    if (signature.length === 0) {
      return toast.error('You must sign document to continue');
    }
    setLoading(true);

    supabase.from('medicare_agreement').insert({
      patient_id: patient?.id,
      agreement: agreement(payerName),
      patient_signature: DOMPurify.sanitize(signature, {
        USE_PROFILES: { html: false },
      }),
      patient_date_signed: new Date().toISOString(),
    });

    if (specificCare === SpecificCareOption.WEIGHT_LOSS_ACCESS) {
      return Router.push(Pathnames.CHECKOUT);
    }

    onNext();
    setLoading(false);
  }, [signature, supabase, patient?.id, payerName, specificCare, onNext]);

  const listItems = [
    'Access to scheduling with doctors or medical professionals who can consider your request for GLP-1s or similar medications and provide a prescription if medically appropriate',
    `Assistance with prior authorization if your ${payerName} plan will cover the medication; if and only if ${payerName} will not cover your medication, assistance with affordable out of pocket medication options`,
    'Unlimited messaging with an unlicensed coach who can help you build customized plan',
    'Tracking your weight loss progress and goals',
  ];
  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Typography variant="body1">
          {`${payerName} Florida members are eligible for the Weight Loss Access Membership including:`}
        </Typography>
        <List
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '0',
            margin: '0.3rem 0 0 0.3rem',
            listStyleType: 'disc',
          }}
        >
          {listItems.map(item => (
            <ListItem
              key={item}
              sx={{
                display: 'list-item',
                padding: '0',
                marginLeft: '1rem',
                gap: '16px',
              }}
            >
              <Typography>{item}</Typography>
            </ListItem>
          ))}
        </List>
        <Typography variant="body1">
          {`Z-Plan, Zealthy’s weight loss access program is $79/month and does not cover your visits with a provider, which should be covered by your ${payerName} plan. For a limited time, the first month of access is only $39. You will be automatically charged every month, but if you choose to cancel your membership then you will still have access to your weight loss subscription for the remaining days of the membership. Zealthy will refund patients if the health care provider ceases to offer health care services for any reason. Zealthy allows the party to terminate the agreement by giving the party at least 30 days’ advance written notice.`}
        </Typography>
        <Typography variant="body1">
          {`This agreement is not health insurance and the health care provider will not file any claims against the patient’s health insurance policy or plan for reimbursement of any health care services covered by the agreement. This agreement does not qualify as minimum essential coverage to satisfy the individual shared responsibility provision of the Patient Protection and Affordable Care Act, 26 U.S.C. s. 5000A. This agreement is not workers’ compensation insurance and does not replace an employer’s obligations under chapter 440.`}
        </Typography>
        <Typography variant="subtitle1">
          Please type your full name to sign this agreement consenting to the
          terms above.
        </Typography>
        <TextField
          sx={{
            '& .MuiInputBase-input': {
              fontFamily: 'cursive !important',
            },
          }}
          value={signature}
          placeholder="X___________________________________________________"
          onChange={handleSignature}
        />
      </Box>
      <LoadingButton
        loading={loading}
        disabled={loading}
        onClick={handleContinue}
      >
        Continue
      </LoadingButton>
    </>
  );
};

export default WeightLossAgreement;
