import Head from 'next/head';
import Router from 'next/router';
import Persona, { Client } from 'persona';
import { ReactElement, useCallback, useState } from 'react';
import { Container, Button, Stack, Typography } from '@mui/material';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { getPatientPortalProps } from '@/lib/auth';
import Footer from '@/components/shared/layout/Footer';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import CheckmarkList from '@/components/shared/CheckmarkList';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import Loading from '@/components/shared/Loading/Loading';
import {
  PrescriptionRequestProps,
  useFutureNotifications,
  useLanguage,
  usePatient,
} from '@/components/hooks/data';
import { Pathnames } from '@/types/pathnames';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { toast } from 'react-hot-toast';
import { Database } from '@/lib/database.types';
import { prescriptionRequestedEvent } from '@/utils/freshpaint/events';
import { useVWO } from '@/context/VWOContext';
import { format } from 'date-fns';
import { useUpdatePatient } from '@/components/hooks/mutations';
import medicationAttributeName from '@/utils/medicationAttributeName';
import { useVWOVariationName } from '@/components/hooks/data';
import ImageUploader, {
  FileType,
} from '@/components/shared/ImageUploaderControlled';
import { useUploadDocument } from '@/components/hooks/useUploadDocument';
import ErrorMessage from '@/components/shared/ErrorMessage';
import Link from '@mui/material/Link';

interface PhotoIdentificationProps {
  nextPage: (nextPage?: string) => void;
}
function isBlob(file: any): file is Blob {
  return file instanceof Blob;
}
function isFile(file: any): file is File {
  return file instanceof File;
}
const convertToBlob = async (file: FileType['fileToUpload']): Promise<Blob> => {
  if (isBlob(file)) {
    return file;
  } else if (typeof file === 'string') {
    const response = await fetch(file);
    return await response.blob();
  } else if (isFile(file)) {
    return file;
  }
  throw new Error('Unsupported file type');
};

const IdentityVerificationPage = () => {
  const user = useUser();
  const { data: notifications } = useFutureNotifications('MOBILE_DOWNLOAD');
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const [loadingPersona, setLoadingPersona] = useState(false);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();
  const vwoClient = useVWO();
  const updatePatient = useUpdatePatient();
  const language = useLanguage();

  const [file, setFile] = useState<FileType | null>(null);
  const [error, setError] = useState('');
  const { uploadFile } = useUploadDocument();
  const { data: variant5484 } = useVWOVariationName('5484');
  const { data: variant5871 } = useVWOVariationName('5871_new');

  const handleNext = () => Router.push(Pathnames.PATIENT_PORTAL);

  const deleteFile = () => {
    setFile(null);
    handleImage(null);
  };

  let errorMsg = 'Please choose the image';
  if (language === 'esp') {
    errorMsg = 'Por favor seleccione una imagen';
  }

  const onConfirm = useCallback(async () => {
    if (!file) {
      setError(errorMsg);
      return;
    }
    setLoading(true);

    const folder = `patient-${patient?.id}/identification`;
    const blob = await convertToBlob(file.fileToUpload);
    return uploadFile(blob, `${folder}/front-of-card`)
      .then(async () => {
        await supabase
          .from('patient')
          .update({
            has_verified_identity: true,
          })
          .eq('id', patient?.id!);
        setLoading(false);
        handleNext();
      })
      .catch((err: any) => {
        setError((err as Error).message);
      })
      .finally(() => setLoading(false));
  }, [
    file,
    language,
    handleNext,
    patient?.id,
    supabase,
    uploadFile,
    variant5484?.variation_name,
    variant5871?.variation_name,
  ]);

  const handleImage = useCallback((image: FileType | null) => {
    setFile(image);
    setError('');
  }, []);

  type PersonaResult = {
    inquiryId: string;
    status: string;
  };

  const onComplete = useCallback(
    async ({ inquiryId, status }: PersonaResult) => {
      try {
        setLoading(true);
        toast.success('Identity verified successfully!');
        await updatePatient.mutateAsync({
          has_verified_identity: true,
          persona_inquiry_id: inquiryId,
        });
        await supabase
          .from('patient')
          .update({
            has_verified_identity: true,
          })
          .eq('id', patient?.id!);

        // Check if it actually set to true
        const { data: updatedPatient, error } = await supabase
          .from('patient')
          .select('has_verified_identity')
          .eq('id', patient?.id!)
          .single();

        if (error) {
          console.error('Error fetching updated patient:', error);
        } else if (updatedPatient?.has_verified_identity) {
          window?.freshpaint?.track('weight-loss-completed-ID-verification');
        }

        if (!notifications) {
          await supabase.from('notifications').insert({
            display_at: new Date().toISOString(),
            recipient_id: patient?.profile_id!,
            sender_id: patient?.profile_id!,
            type: 'MOBILE_DOWNLOAD',
          });
        }

        const isBundled = await supabase
          .from('patient_subscription')
          .select('*')
          .eq('patient_id', patient?.id!)
          .in('price', [297, 217, 446, 349, 449, 718, 891])
          .then(({ data }) => !!(data || []).length);

        await supabase
          .from('prescription_request')
          .update({ status: 'REQUESTED' })
          .filter(
            'status',
            'in',
            '("APPROVED - Pending ID","REQUESTED - ID must be uploaded")'
          )
          .eq('patient_id', patient?.id!)
          .select()
          .then(({ data }) => (data || []) as PrescriptionRequestProps[])
          .then(req => {
            req.map(async r => {
              const addToQueue = await supabase
                .from('task_queue')
                .insert({
                  task_type: 'PRESCRIPTION_REQUEST',
                  patient_id: patient?.id,
                  queue_type: 'Provider (QA)',
                  note: 'Please verify that the patient ID matches their information, if so prescribe the requested medication.',
                })
                .select()
                .maybeSingle()
                .then(({ data }) => data);
              await supabase
                .from('task_queue')
                .update({
                  completed_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"),
                  action_taken: 'ID UPLOADED',
                })
                .eq('patient_id', patient?.id!)
                .eq('task_type', 'PRESCRIPTION_REQUEST_ID_REQUIRED');
              await supabase
                .from('prescription_request')
                .update({ queue_id: addToQueue?.id })
                .eq('id', r?.id);

              prescriptionRequestedEvent(
                patient?.profiles?.email!,
                medicationAttributeName(r.specific_medication || '') || r.note!,
                r?.note?.includes('3 months') ? '3-month' : '1-month'
              );
            });
          });
        handleNext();
      } catch (err) {
        setLoading(false);
        console.error('id_Ver_oncomplete_err', err as any);
      }
    },
    [user, updatePatient, supabase, patient?.id, patient?.profiles?.email]
  );

  return (
    <Container maxWidth="xs">
      <Stack gap={isMobile ? '1.5rem' : '1rem'}>
        <Typography variant="h2">
          {file ? 'Review and confirm your ID' : 'Identification'}
        </Typography>
        <Typography>
          For your security and to comply with telemedicine regulation, you must
          verify your identify with a photo ID. Any ID with your name and photo
          will be sufficient.
        </Typography>
        <Typography>
          Examples: Driver’s License, Passport, School ID, Consular ID
        </Typography>
      </Stack>
      <Stack mt={6} gap={1}>
        <Typography variant="h3">Upload your ID</Typography>
        <ImageUploader
          title={null}
          subtitle={null}
          name={'id-card'}
          showConfirmationText={false}
          setFilePath={handleImage}
          file={file}
          setFile={setFile}
          subImageTextOne={`Take a photo of your ID`}
          subImageTextTwo={`Upload a photo of your ID`}
          subImageTextMobile={`Add photo ID`}
        />
        {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        {file && (
          <Stack mt={3} alignItems="center" gap={5}>
            <LoadingButton loading={loading} fullWidth onClick={onConfirm}>
              Use this ID
            </LoadingButton>
            <Link
              style={{ cursor: 'pointer', fontWeight: '600' }}
              onClick={() => deleteFile()}
            >
              Discard changes
            </Link>
          </Stack>
        )}
      </Stack>
    </Container>
  );

  // const openPersona = () => {
  //   setLoadingPersona(true);
  //   const client: Client = new Persona.Client({
  //     templateId: 'itmpl_kvAd3iMoqzRmRr8tsUeAqqcX',
  //     referenceId: user!.id,
  //     environmentId: process.env.NEXT_PUBLIC_PERSONA_ENVIRONMENT_ID,
  //     language: language === 'esp' ? 'es' : 'en',
  //     onReady: () => {
  //       setLoadingPersona(false);
  //       client.open();
  //     },
  //     onComplete,
  //     onCancel: ({ inquiryId, sessionToken }) => console.info('onCancel'),
  //     onError: (error) => console.error('open_persona_err', error),
  //   });
  // };

  // return (
  //   <>
  //     <Head>
  //       <title>Verify Identity | Zealthy</title>
  //     </Head>
  //     <Container maxWidth="sm">
  //       {loading ? (
  //         <Loading />
  //       ) : (
  //         <Stack gap={isMobile ? '1.5rem' : '1rem'}>
  //           <Typography variant="h2">
  //             Verify your identity to receive your treatment plan.
  //           </Typography>
  //           <Typography>
  //             To access treatment, we need a{' '}
  //             <b>photo of your driver’s license or passport</b>. Telemedicine
  //             law requires us to verify your identity with a photo ID before
  //             beginning a treatment plan, including prescription medication.
  //           </Typography>
  //           <Stack gap={isMobile ? '1.5rem' : '3rem'}>
  //             <CheckmarkList
  //               header="Ensure that..."
  //               listItems={[
  //                 'Your photo ID isn’t blurry or dark',
  //                 "Your ID isn't cut off",
  //                 'Your ID is government issued and not expired',
  //               ]}
  //             />
  //             {patient?.has_verified_identity ? (
  //               <>
  //                 <Typography color="green" textAlign="center">
  //                   Good news! You have already verified your identity.
  //                   <br /> Please click <b>Go home</b> to return to the home
  //                   page
  //                 </Typography>
  //                 <Button onClick={handleNext} fullWidth>
  //                   Go home
  //                 </Button>
  //               </>
  //             ) : (
  //               <Stack gap={2}>
  //                 <LoadingButton loading={loadingPersona} onClick={openPersona}>
  //                   Begin verification
  //                 </LoadingButton>
  //               </Stack>
  //             )}
  //           </Stack>
  //         </Stack>
  //       )}
  //     </Container>
  //     <Footer />
  //   </>
  // );
};

export const getServerSideProps = getPatientPortalProps;

IdentityVerificationPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default IdentityVerificationPage;
