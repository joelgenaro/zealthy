import { useEffect, useState } from 'react';
import { Stack, Typography } from '@mui/material';
import { usePatient } from '@/components/hooks/data';
import { useUploadDocument } from '@/components/hooks/useUploadDocument';
import { UploadedDocType } from '../PatientPortal/components/DocumentsUpload/types';
import LabResult from './components/LabResult';
import Loading from '@/components/shared/Loading/Loading';

const LabResults = () => {
  const { data: patient } = usePatient();
  const { fetchFiles } = useUploadDocument();
  const [docs, setDocs] = useState<UploadedDocType[]>([]);
  const [loading, setLoading] = useState(true);

  const folder =
    `patient-${patient?.id}/lab-work` || `patient-${patient?.id}/enclomiphene`;

  useEffect(() => {
    if (patient?.id && !docs.length) {
      fetchFiles(folder)
        .then(labs => {
          if (!labs.length) {
            return;
          }
          setDocs(
            labs.map(lab => ({
              created_at: lab.created_at,
              pathToFile: `${folder}/${lab.name}`,
              label: lab.name,
            }))
          );
        })
        .finally(() => setLoading(false));
    }
  }, [fetchFiles, patient, docs]);

  return (
    <Stack gap={{ md: 5.5, xs: 3 }}>
      <Typography variant="h2">Lab results.</Typography>
      <Stack gap={2}>
        {loading ? (
          <Loading />
        ) : !docs.length ? (
          <Typography variant="body1">
            {
              'You do not have any lab results within the Zealthy system at this time.'
            }
          </Typography>
        ) : (
          docs.map((doc, index) => <LabResult key={'doc-' + index} lab={doc} />)
        )}
      </Stack>
    </Stack>
  );
};

export default LabResults;
