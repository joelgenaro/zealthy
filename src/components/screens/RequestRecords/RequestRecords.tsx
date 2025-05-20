import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Stack, ListItemButton, Typography, Button } from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { Pathnames } from '@/types/pathnames';
import ObtainAndSendReportForm from './components/ObtainAndSendReportForm';
import RecordNeedForm from './components/RecordNeedForm';
import RecordRangeForm from './components/RecordRangeForm';
import SubmitRequestForm from './components/SubmitRequestForm';
import _map from 'lodash/map';
import { usePatient } from '@/components/hooks/data';

export type FormType = {
  label: string;
  value: string;
  desc: string;
  successMsg: string;
};
interface FormData {
  institution: string | null;
  address: string | null;
  email: string | null;
  phone_number: string | null;
  fax: string | null;
  medical_records: string | null;
  start_date: string | null;
  end_date: string | null;
  signature: string | null;
}

const Forms: FormType[] = [
  {
    label: 'Obtain medical records',
    desc: 'Obtain medical records from',
    value: 'Obtain',
    successMsg:
      "Your request has been successfully submitted! Zealthy will notify you once we've obtained your records.",
  },
  {
    label: 'Send medication records',
    desc: 'Send medical records to',
    value: 'Send',
    successMsg:
      'Your request has been successfully submitted! Your medical records will be sent out shortly.',
  },
];
const RequestRecords = () => {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const [selectedForm, setSelectedForm] = useState<FormType | null>(null);
  const [formStep, setFormStep] = useState(1);
  const [selected, setSelected] = useState<FormType>({
    label: '',
    desc: '',
    value: '',
    successMsg: '',
  });
  const [formData, setFormData] = useState<FormData>({
    institution: '',
    address: '',
    email: '',
    phone_number: '',
    fax: '',
    medical_records: '',
    start_date: '',
    end_date: '',
    signature: '',
  });
  const [loading, setLoading] = useState(false);

  const handleOnChange = (value: FormType) => {
    setSelected(value);
  };
  const router = useRouter();

  const handleSelectForm = (form_type: FormType) => setSelectedForm(form_type);
  const handleNextStep = (data: object) => {
    setFormData({ ...formData, ...data });
    setFormStep(formStep + 1);
  };
  const handleSignatureStep = (data: object) => {
    setLoading(true);
    setFormData({ ...formData, ...data });
  };
  const handleBackToHome = async () => {
    setLoading(false);
  };

  useEffect(() => {
    if (formData?.signature) {
      handleBackToHome();
    }
  }, [formData]);

  if (selectedForm) {
    switch (formStep) {
      case 1:
        return (
          <ObtainAndSendReportForm
            type={selectedForm}
            onSubmit={handleNextStep}
          />
        );
      case 2:
        return <RecordNeedForm type={selectedForm} onSubmit={handleNextStep} />;
      case 3:
        return (
          <RecordRangeForm type={selectedForm} onSubmit={handleNextStep} />
        );
      case 4:
        return (
          <SubmitRequestForm
            type={selectedForm}
            onAddSignature={handleSignatureStep}
            onSubmit={handleBackToHome}
            loading={loading}
            goBack={() => router.push(Pathnames.PATIENT_PORTAL_MY_HEALTH)}
          />
        );
    }
  }

  return (
    <Stack gap={{ md: 5.5, xs: 3 }}>
      <Typography variant="h2">
        Are you looking to obtain or send medical records?
      </Typography>
      <Stack gap={2}>
        {_map(Forms, (form, index) => (
          <ListItemButton
            onClick={() => handleOnChange(form)}
            sx={{
              border: `1px solid ${
                selected?.value === form.value ? '#1B1B1B' : '#00000033'
              }`,
              borderRadius: '12px',
              paddingX: { md: '24px', xs: '16px' },
              paddingY: '20px',
            }}
          >
            {form.label}
          </ListItemButton>
        ))}
      </Stack>
      <Button onClick={() => handleSelectForm(selected)}>Continue</Button>
    </Stack>
  );
};

export default RequestRecords;
