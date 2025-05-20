import { useMemo } from 'react';
import {
  Container,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  usePatient,
  usePatientPrescriptionRequest,
  usePatientCompletedVisits,
  usePatientLabWorks,
} from '@/components/hooks/data';
import { UploadingDocumentType } from '../DocumentsUpload/types';
import DocumentCards from '@/components/shared/DocumentCards';
import Loading from '@/components/shared/Loading/Loading';

const documents = (patient_id: number): UploadingDocumentType[] => [
  {
    label: 'Documents',
    folder: `patient-${patient_id}/documents`,
    items: [
      {
        label: 'Document 1',
        fileName: 'document-1',
      },
      {
        label: 'Document 2',
        fileName: 'document-2',
      },
      {
        label: 'Document 3',
        fileName: 'document-3',
      },
    ],
  },
];

const labDocumentsUpload = (patient_id: number): UploadingDocumentType[] => [
  {
    label: 'Labs',
    folder: `patient-${patient_id}/enclomiphene-labs`,
    items: [
      {
        label: 'Lab Results',
        fileName: 'Lab work',
      },
    ],
  },
];

const labDocumentsUploadPrep = (
  patient_id: number
): UploadingDocumentType[] => [
  {
    label: 'Labs',
    folder: `patient-${patient_id}/prep-labs`,
    items: [
      {
        label: 'Lab Results',
        fileName: 'Lab work',
      },
    ],
  },
];

interface DocumentsUploadProps {}

const NoInsuranceDocumentsUpload = ({}: DocumentsUploadProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: patient, isLoading } = usePatient();
  const { data: prescriptionRequest } = usePatientPrescriptionRequest();
  const { data: labWorks } = usePatientLabWorks();
  const { data: onlineVisits = [] } = usePatientCompletedVisits();
  const labWorksLength = labWorks?.length || 0;
  const isEnclomiphenePR = prescriptionRequest?.some(pr =>
    pr?.specific_medication?.includes('Enclomiphene')
  );

  const isPrepPatient = useMemo(() => {
    return onlineVisits.some(v => v.specific_care === 'Prep');
  }, [onlineVisits]);

  const documentsToUploads = useMemo(() => {
    if (!patient) return [];
    return documents(patient.id);
  }, [patient]);

  const enclomipheneDocumentsToUploads = useMemo(() => {
    if (!patient) return [];
    return labDocumentsUpload(patient.id);
  }, [patient]);

  const prepDocumentsToUploads = useMemo(() => {
    if (!patient) return [];
    return labDocumentsUploadPrep(patient.id);
  }, [patient]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Container
      maxWidth={isMobile ? 'xs' : 'sm'}
      sx={{ marginTop: `${isMobile ? '-25px' : '0px'}` }}
    >
      <Typography mb={'3rem'} variant="h2">
        Upload Your Documents
      </Typography>
      {isEnclomiphenePR ? (
        <Stack gap={6} sx={{ marginBottom: `${isMobile ? '65px' : '0px'}` }}>
          {enclomipheneDocumentsToUploads.map(document => (
            <DocumentCards
              key={document.label}
              document={document}
              patient={patient!}
            />
          ))}
        </Stack>
      ) : null}
      {isPrepPatient ? (
        <Stack gap={6} sx={{ marginBottom: `${isMobile ? '65px' : '0px'}` }}>
          {prepDocumentsToUploads.map(document => (
            <DocumentCards
              key={document.label}
              document={document}
              patient={patient!}
            />
          ))}
        </Stack>
      ) : null}
      <br></br>
      <Stack gap={6} sx={{ marginBottom: `${isMobile ? '65px' : '0px'}` }}>
        {documentsToUploads.map(document => (
          <DocumentCards
            key={document.label}
            document={document}
            patient={patient!}
          />
        ))}
      </Stack>
    </Container>
  );
};

export default NoInsuranceDocumentsUpload;
