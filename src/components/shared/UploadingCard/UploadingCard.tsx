import Router from 'next/router';
import { toast } from 'react-hot-toast';
import { ChangeEventHandler, useCallback, useState, useMemo } from 'react';
import { Button, Stack, Typography, useTheme } from '@mui/material';
import Spinner from '@/components/shared/Loading/Spinner';
import WhiteBox from '@/components/shared/layout/WhiteBox';
import { UploadingDocType } from '../../screens/PatientPortal/components/DocumentsUpload/types';
import { useUploadDocument } from '@/components/hooks/useUploadDocument';
import { ExtractedFieldDto } from 'butler-sdk';
import { useInsuranceAsync } from '@/components/hooks/useInsurance';
import { resizeImage } from '@/utils/resizeImage';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import {
  useLanguage,
  usePatient,
  usePatientInsurance,
  usePatientLabWorks,
  usePatientCompletedVisits,
  usePatientDocuments,
} from '@/components/hooks/data';
import { capitalize } from '@/utils/capitalize';

const mapResponseToDetails = (response: ExtractedFieldDto[]) => {
  const insurer =
    response
      .find(field => field.fieldName === 'Insurer')
      ?.value.replace(/\W/g, '')
      .replace(/([a-z])([A-Z])/g, '$1 $2') || '';
  const memberName =
    response.find(field => field.fieldName === 'Member Name')?.value || '';
  const member_id =
    response.find(field => field.fieldName === 'ID Number')?.value || '';

  return {
    policyholder_first_name: memberName.split(' ')[0],
    policyholder_last_name: memberName.split(' ')[1],
    member_id,
    insurer,
  };
};

interface UploadingCardProps {
  card: UploadingDocType;
  onUpdate: (card: UploadingDocType, path: string) => void;
  onError: (message: string) => void;
  refetch?: () => void;
}

const UploadingCard = ({
  onError,
  onUpdate,
  card,
  refetch,
}: UploadingCardProps) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const { uploadFile } = useUploadDocument();
  const supabase = useSupabaseClient<Database>();
  const { extractDataFromCard } = useInsuranceAsync();
  const { label, pathToUpload } = card;
  const { data: patient } = usePatient();
  const { data: patientInsurances } = usePatientInsurance();
  const language = useLanguage();
  const { data: insurance } = usePatientDocuments();
  const { data: onlineVisits = [] } = usePatientCompletedVisits();
  const { data: insuranceDocuments } = usePatientDocuments();
  const insuranceDocumentsLength = insuranceDocuments?.length || 0;
  const prepMedicationId =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 508 : 472;

  const isPrepPatient = useMemo(() => {
    return onlineVisits.some(v => v.specific_care === 'Prep');
  }, [onlineVisits]);

  const primaryInsurance = useMemo(() => {
    return patientInsurances?.find(
      insurance => insurance.policy_type === 'Primary'
    );
  }, [patientInsurances]);

  const secondaryInsurance = useMemo(() => {
    return patientInsurances?.find(
      insurance => insurance.policy_type === 'Secondary'
    );
  }, [patientInsurances]);

  const insuranceId = useMemo(() => {
    if (pathToUpload.includes('secondary-insurance-card')) {
      return secondaryInsurance?.id;
    }

    if (pathToUpload.includes('insurance-card')) {
      return primaryInsurance?.id;
    }

    return;
  }, [pathToUpload, primaryInsurance, secondaryInsurance]);

  const uploadPhoto: ChangeEventHandler<HTMLInputElement> = useCallback(
    async e => {
      const file = e.target.files?.[0];
      if (!file) return;

      setLoading(true);

      if (
        isPrepPatient &&
        insuranceDocumentsLength > 0 &&
        patient?.status === 'ACTIVE'
      ) {
        const { data: taskResponse, error: taskError } = await supabase
          .from('task_queue')
          .insert({
            task_type: 'PRESCRIPTION_REQUEST',
            patient_id: patient?.id,
            queue_type: 'Provider (QA)',
          })
          .select()
          .maybeSingle();

        const { data: prescriptionReponse, error: prescriptionError } =
          await supabase.from('prescription_request').insert({
            patient_id: patient?.id,
            status: 'REQUESTED',
            region: patient?.region,
            shipping_method: 1,
            note: 'Truvada',
            total_price: 0,
            specific_medication: 'Truvada',
            medication_quantity_id: prepMedicationId,
            queue_id: taskResponse?.id,
          });
      }

      const { data, error } = await uploadFile(file, pathToUpload);

      const docData = data?.data;

      if (error) {
        onError(error.message);
        setLoading(false);
        return;
      }

      if (docData) {
        onError('');
        onUpdate(card, docData.path);
        if (Router.asPath.includes('/patient-portal')) {
          toast.success(`Successfully submitted:\n ${card.label}`, {
            duration: 5000,
          });
        }
        if (pathToUpload.includes('insurance-card')) {
          window.freshpaint?.track('insurance-document-added');
        }
      }

      if (
        pathToUpload.includes('insurance-card') ||
        pathToUpload.includes('secondary-insurance-card')
      ) {
        window.freshpaint?.track('insurance-document-added');

        if (file.type !== 'application/pdf' && pathToUpload.includes('front')) {
          // extract data
          const { data: document } = await resizeImage(file, 1024).then(
            data => {
              return extractDataFromCard({
                type: file.type,
                name: 'front.png',
                fileToUpload: data,
              });
            }
          );

          const details = mapResponseToDetails(document.formFields!);

          const payer = await supabase
            .from('payer')
            .select('*')
            .eq('name', capitalize(details.insurer))
            .limit(1)
            .maybeSingle()
            .then(({ data }) => data);

          if (payer && patient) {
            //create policy
            await supabase.from('insurance_policy').upsert({
              id: insuranceId,
              patient_id: patient.id,
              is_dependent: false,
              payer_id: payer.id,
              member_id: details.member_id,
              policyholder_first_name: details.policyholder_first_name,
              policyholder_last_name: details.policyholder_last_name,
              policy_type: pathToUpload.includes('secondary-insurance-card')
                ? 'Secondary'
                : 'Primary',
            });
          }
        }
      }

      refetch ? refetch() : null;
      setLoading(false);
    },
    [
      uploadFile,
      pathToUpload,
      refetch,
      onError,
      onUpdate,
      card,
      supabase,
      patient,
      extractDataFromCard,
      insuranceId,
    ]
  );

  let upload = 'Upload';

  if (language === 'esp') {
    upload = 'Subir';
  }

  return (
    <WhiteBox padding="24px">
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography color={theme.palette.primary.main} fontWeight="600">
          {label}
        </Typography>
        <Button component="label" variant="rounded" size="small">
          {loading ? <Spinner size="1.3em" color="inherit" /> : upload}
          <input type="file" hidden onChange={uploadPhoto} />
        </Button>
      </Stack>
    </WhiteBox>
  );
};

export default UploadingCard;
