import ErrorMessage from '@/components/shared/ErrorMessage';
import { Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  UploadedDocType,
  UploadingDocType,
  UploadingDocumentType,
  Uploads,
} from '../../screens/PatientPortal/components/DocumentsUpload/types';
import UploadedCard from '../UploadedCard/UploadedCard';
import UploadingCard from '../UploadingCard/UploadingCard';
import { useUploadDocument } from '@/components/hooks/useUploadDocument';
import {
  PatientProps,
  useActivePatientSubscription,
  useLanguage,
  usePatientCareTeam,
  usePatientCompletedVisits,
  useVWOVariationName,
} from '@/components/hooks/data';
import { format, isToday } from 'date-fns';
import axios from 'axios';
import {
  useCreatePatientTask,
  useUpdatePatient,
} from '@/components/hooks/mutations';
import { useRouter } from 'next/router';
import { useMutatePatientActionItems } from '@/components/hooks/useMutatePatientActionItems';
import { insuranceInformationUpdated } from '@/utils/freshpaint/events';
import { useIntakeState } from '@/components/hooks/useIntake';
import getConfig from '../../../../config';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';

function pathToUpload(path: string) {
  return path.substring(0, path.lastIndexOf('.')) || path;
}

interface DocumentCardsProps {
  patient?: PatientProps;
  document: UploadingDocumentType;
  refetch?: () => void;
  onUploadSuccess?: (fileName: string) => void;
  setIsDisabled?: (v: boolean) => void;
}

const DocumentCards = ({
  patient,
  document: { folder, items, label },
  refetch,
  onUploadSuccess,
  setIsDisabled,
}: DocumentCardsProps) => {
  const [error, setError] = useState('');
  const [uploads, setUploads] = useState<Uploads[]>([]);
  const { fetchFiles } = useUploadDocument();
  const { data: patientCareTeam } = usePatientCareTeam();
  const [hasUploadedInsuranceToday, setHasUploadedInsuranceToday] =
    useState(false);
  const { data: patientSubscriptions } = useActivePatientSubscription();
  const router = useRouter();
  const care = router.query.care;
  const { updateActionItem } = useMutatePatientActionItems();
  const updatePatient = useUpdatePatient();
  const language = useLanguage();
  const { specificCare } = useIntakeState();
  const { data: onlineVisits = [] } = usePatientCompletedVisits();
  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;
  const createTask = useCreatePatientTask();
  const isPrepPatient = useMemo(() => {
    return onlineVisits.some(v => v.specific_care === 'Prep');
  }, [onlineVisits]);

  const isWLPatient = useMemo(() => {
    return onlineVisits.some(
      v => v.specific_care === SpecificCareOption.WEIGHT_LOSS
    );
  }, [onlineVisits]);

  const hasActiveWeightLoss = patientSubscriptions?.some(
    sub =>
      (sub?.subscription?.id === 4 &&
        ['active', 'trialing'].includes(sub?.status)) ||
      (sub?.subscription?.name === 'Zealthy Weight Loss Access' &&
        ['active', 'trialing'].includes(sub?.status)) ||
      (sub?.subscription?.name === 'Zealthy 3-Month Weight Loss' &&
        ['active', 'trialing'].includes(sub?.status)) ||
      (sub?.subscription?.name === 'Zealthy 3-Month Weight Loss [IN]' &&
        ['active', 'trialing'].includes(sub?.status))
  );
  const uploadedDocs = useMemo(() => {
    return uploads
      .filter(upload => upload.isUploaded)
      .map(upload => ({
        label: upload.label,
        pathToFile: upload.pathToFile!,
        created_at: upload.created_at!,
      }))
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [uploads]);
  const uploadingDocs = useMemo(() => {
    return uploads
      .filter(upload => !upload.isUploaded)
      .map(upload => ({
        label: upload.label,
        pathToUpload: upload.pathToUpload!,
      }));
  }, [uploads]);
  const addUploaded = useCallback(
    async (uploading: UploadingDocType, path: string) => {
      setUploads(prev =>
        prev
          .filter(upload => upload.label !== uploading.label)
          .concat({
            pathToFile: path,
            label: uploading.label,
            isUploaded: true,
            created_at: new Date().toISOString(),
          })
      );
      if (onUploadSuccess) {
        onUploadSuccess(uploading.label);
      }
      if (
        window.location.pathname.includes('patient-portal') &&
        ['Insurance card front', 'Pharmacy benefits card front'].includes(
          uploading.label
        )
      ) {
        createTask.mutate({
          patient_id: patient?.id!,
          task_type: 'INSURANCE_UPLOAD',
          queue_type: 'Coordinator',
          note: 'The patient has uploaded a new document to the “SECTION ADDED TO” section. Please review and submit a prior authorization.',
        });
        if (patient?.insurance_info_requested) {
          insuranceInformationUpdated(
            patient.profiles.id,
            patient.profiles.email
          );
          await updatePatient.mutateAsync({
            insurance_info_requested: false,
          });
        }
        await updateActionItem({
          completed: true,
          patient_id: patient?.id!,
          completed_at: new Date().toISOString(),
          type: 'INSURANCE_INFO_REQUESTED',
        });
      }
      if (
        window.location.pathname.includes('patient-portal') &&
        ['Lab Results']?.includes(uploading?.label)
      ) {
        window?.freshpaint?.track('enclomiphene-labs-uploaded');
        if (isPrepPatient || specificCare === 'Prep') {
          await createTask.mutate({
            task_type: 'PREP_REVIEW_LABS',
            patient_id: patient?.id!,
            queue_type: 'Provider (QA)',
            note: 'Prep - review labs & prescribe truvada if clinically appropriate',
          });
        } else {
          await createTask.mutate({
            task_type: 'ENCLOMIPHENE_REVIEW_LABS',
            patient_id: patient?.id!,
            queue_type: 'Provider (QA)',
            note: 'Enclomiphene - review labs & prescribe enclomiphene if clinically appropriate',
          });
          createTask.mutate({
            task_type: 'PRESCRIPTION_REQUEST',
            patient_id: patient?.id!,
            queue_type: 'Provider (QA)',
          });
          updateActionItem({
            patient_id: patient?.id!,
            completed_at: new Date().toISOString()!,
            completed: true,
            type: 'ENCLOMIPHENE_LAB_RESULT',
          });
        }
      }
      refetch?.();
    },
    [
      createTask,
      isPrepPatient,
      onUploadSuccess,
      patient,
      refetch,
      specificCare,
      updateActionItem,
      updatePatient,
    ]
  );
  const removedUploaded = useCallback(
    (uploaded: UploadedDocType) => {
      setUploads(prev =>
        prev
          .filter(upload => upload.label !== uploaded.label)
          .concat({
            pathToUpload: pathToUpload(uploaded.pathToFile),
            isUploaded: false,
            label: uploaded.label,
          })
      );
      setHasUploadedInsuranceToday(false);
      refetch?.();
    },
    [refetch]
  );
  useEffect(() => {
    fetchFiles(folder)
      .then(files => {
        return items.map(item => {
          const file = files.find(file => file.name.includes(item.fileName));
          return {
            ...item,
            isUploaded: !!file,
            ...file,
          };
        });
      })
      .then(uploadMappings =>
        setUploads(
          uploadMappings.map((upload): Uploads => {
            if (upload.isUploaded) {
              if (isToday(new Date(upload.created_at!))) {
                setHasUploadedInsuranceToday(true);
              }
              return {
                label: upload.label,
                created_at: upload.created_at!,
                isUploaded: true,
                pathToFile: `${folder}/${upload.name}`,
              };
            } else {
              return {
                label: upload.label,
                isUploaded: false,
                pathToUpload: `${folder}/${upload.fileName}`,
              };
            }
          })
        )
      )
      .catch(err => {
        console.error('Error fetching files:', err);
      });
  }, [items.length]);
  useEffect(() => {
    if (
      uploads.find(
        u =>
          u.created_at &&
          isToday(new Date(u.created_at)) &&
          !hasUploadedInsuranceToday &&
          hasActiveWeightLoss &&
          window.location.pathname.includes('patient-portal') &&
          ['Insurance card front', 'Pharmacy benefits card front'].includes(
            u.label
          )
      )
    ) {
      const cardType = uploads.find(
        u => u.created_at && isToday(new Date(u.created_at))
      )?.label;
      if (cardType) {
        appendData(cardType);
      }
      setHasUploadedInsuranceToday(true);
    }
  }, [uploads, hasActiveWeightLoss]);
  useEffect(() => {
    if (uploadedDocs.length === 0) {
      setIsDisabled?.(true);
    } else {
      setIsDisabled?.(false);
    }
  }, [uploadedDocs, setIsDisabled]);
  async function appendData(value: string) {
    try {
      const coordinator = patientCareTeam?.find(t => t.role === 'Coordinator');
      await axios.post('/api/google/append-spreadsheet-data', {
        sheetId: '155MnqRDdg-fHJ92ycPdOGPcbldcCENKa-UHZPzOylRo',
        range: 'Zap Sheet!A1:E1',
        data: [
          format(new Date(), 'M/d/yyyy'),
          `https://clinician-portal.getzealthy.com/patient/${patient?.id}`,
          `${coordinator?.clinician?.profiles?.first_name} ${coordinator?.clinician?.profiles?.last_name}`,
          `${coordinator?.clinician?.profiles?.email}`,
          `${value}`,
        ],
      });
    } catch (err) {
      console.error('Error appending data:', err);
    }
  }
  const shouldShowGovtInsuranceInfo =
    isWLPatient &&
    label === 'Insurance card' &&
    !patient?.insurance_skip &&
    uploadedDocs.length < 2;
  let govtInsuranceText = `${siteName}'s weight loss program is not available to those who have government insurance, such as Medicare, Medicaid, or Tricare.`;
  if (language === 'esp') {
    govtInsuranceText = `El programa de pérdida de peso de ${siteName} no está disponible para aquellos que tienen seguro gubernamental, como Medicare, Medicaid o Tricare.`;
  }
  return (
    <Stack direction="column" gap="16px">
      {shouldShowGovtInsuranceInfo &&
        (!router.asPath.includes('prep') || !isPrepPatient) && (
          <Typography>{govtInsuranceText}</Typography>
        )}
      <Typography variant="h3">{label}</Typography>
      {uploadedDocs.map(document => (
        <UploadedCard
          key={document.label}
          card={document}
          onUpdate={removedUploaded}
          refetch={refetch}
          onError={setError}
        />
      ))}
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
      {uploadingDocs.map(doc => (
        <UploadingCard
          refetch={refetch}
          onError={setError}
          key={doc.label}
          card={doc}
          onUpdate={addUploaded}
        />
      ))}
    </Stack>
  );
};

export default DocumentCards;
