import {
  Box,
  Button,
  Container,
  IconButton,
  ListItemButton,
  Modal,
  Typography,
} from '@mui/material';
import { Stack } from '@mui/system';
import { useIntakeState } from '@/components/hooks/useIntake';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import Close from '@/components/shared/icons/Close';
import CheckMarkIcon from '@/components/shared/icons/CheckMarkCircleGreen';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import DocumentCards from '@/components/shared/DocumentCards';
import { UploadingDocumentType } from '@/components/screens/PatientPortal/components/DocumentsUpload/types';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { FileObject } from '@supabase/storage-js';
import { useSearchParams } from 'next/navigation';
import Router from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage, usePatient } from '@/components/hooks/data';
import { useUploadDocument } from '@/components/hooks/useUploadDocument';
import BasicModal from '@/components/shared/BasicModal';

const documents = (
  patient_id: number,
  language: string,
  documentLabelText: string,
  specificCare: string | null | undefined
): UploadingDocumentType[] => {
  const timestamp = new Date().getTime();
  return [
    {
      label:
        language === 'esp'
          ? 'Documentos del laboratorio'
          : 'Lab work documents',
      folder:
        specificCare === 'Enclomiphene'
          ? `patient-${patient_id}/enclomiphene-labs`
          : specificCare === 'Prep'
          ? `patient-${patient_id}/prep-labs`
          : `patient-${patient_id}/lab-work`,
      items: [
        {
          label: `${documentLabelText} 1`,
          fileName: `lab-work-${timestamp}`,
        },
        {
          label: `${documentLabelText} 2`,
          fileName: `lab-work-${timestamp}`,
        },
        {
          label: `${documentLabelText} 3`,
          fileName: `lab-work-${timestamp}`,
        },
        {
          label: `${documentLabelText} 4`,
          fileName: `lab-work-${timestamp}`,
        },
        {
          label: `${documentLabelText} 5`,
          fileName: `lab-work-${timestamp}`,
        },
        {
          label: `${documentLabelText} 6`,
          fileName: `lab-work-${timestamp}`,
        },
        {
          label: `${documentLabelText} 7`,
          fileName: `lab-work-${timestamp}`,
        },
        {
          label: `${documentLabelText} 8`,
          fileName: `lab-work-${timestamp}`,
        },
        {
          label: `${documentLabelText} 9`,
          fileName: `lab-work-${timestamp}`,
        },
        {
          label: `${documentLabelText} 10`,
          fileName: `lab-work-${timestamp}`,
        },
      ],
    },
  ];
};

interface LabOrBloodTestsProps {
  nextPage: (nextPage?: string, variant?: string) => void;
}
const LabOrBloodTests = ({ nextPage }: LabOrBloodTestsProps) => {
  const { data: patient } = usePatient();
  const { specificCare, variant } = useIntakeState();
  const [page, setPage] = useState('home');
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const language = useLanguage();

  const handleLabUploadPage = () => {
    setPage('upload');
  };

  const onSkip = useCallback(() => {
    if (variant === '5071-Variation-1-no-ins') {
      Router.push(
        '/post-checkout/questionnaires-v2/identity-verification/IDENTITY-V-Q1'
      );
      return;
    }
    nextPage();
  }, [nextPage, variant]);

  useEffect(() => {
    if (specificCare === 'Enclomiphene') {
      setPage('upload');
    }
  }, [specificCare]);

  useEffect(() => {
    if (specificCare === 'Enclomiphene') {
      return;
    }
    // trigger after 90 seconds
    const timeout = setTimeout(() => {
      setShowTimeoutModal(true);
    }, 90000);
    return () => clearTimeout(timeout);
  }, []);
  ////

  const supabase = useSupabaseClient<Database>();
  const searchParams = useSearchParams();
  const [isModal, setIsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visibilityBase, setVisibleBase] = useState(0);
  const [visible, setVisible] = useState(0);
  const { listFilesInFolder } = useUploadDocument();
  const labOrderId = searchParams?.get('id');
  const toggleModal = () => setIsModal(!isModal);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  let documentLabelText: string;
  if (language === 'esp') {
    documentLabelText = 'Documento';
  } else {
    documentLabelText = 'Document';
  }

  const documentsToUploads = useMemo(() => {
    if (!patient) return [];
    const docs = documents(
      patient.id,
      language,
      documentLabelText,
      specificCare
    )[0];

    return [
      {
        ...docs,
        items: docs.items.slice(0, visible),
      },
    ];
  }, [patient, visible, language, documentLabelText, specificCare]);

  const handleVisibleUp = useCallback(
    () =>
      setVisible(visible => {
        if (visible === 10) return visible;
        return visible + 1;
      }),
    []
  );

  const handleVisibleDown = useCallback(
    () =>
      setVisible(visible => {
        if (visible === visibilityBase) return visible;
        return visible - 1;
      }),
    [visibilityBase]
  );

  const handleVisibilityBase = useCallback((files: FileObject[]) => {
    const base = Math.max(files.length, 2);
    setVisibleBase(base);
    setVisible(base);
  }, []);

  async function handleLabUpload() {
    toggleModal();

    if (specificCare === 'Enclomiphene') {
      window?.freshpaint?.track('enclomiphene-labs-uploaded');

      // check to see if we already have tasks for ENCLOMIPHENE_REVIEW_LABS
      // skip adding if already exists else add

      const { data: existingTasks } = await supabase
        .from('task_queue')
        .select('id')
        .eq('task_type', 'ENCLOMIPHENE_REVIEW_LABS')
        .eq('patient_id', patient?.id!);

      if (existingTasks && existingTasks.length > 0) {
        console.log('Lab already exists for patient');
        return;
      } else {
        await supabase.from('task_queue').insert({
          task_type: 'ENCLOMIPHENE_REVIEW_LABS',
          patient_id: patient?.id,
          queue_type: 'Provider (QA)',
          note: 'Enclomiphene - review labs & prescribe enclomiphene if clinically appropriate',
        });
        await supabase.from('task_queue').insert({
          task_type: 'PRESCRIPTION_REQUEST',
          patient_id: patient?.id,
          queue_type: 'Provider (QA)',
        });
      }
    }

    if (labOrderId) {
      setLoading(true);
      await supabase
        .from('lab_order')
        .update({ status: 'UPLOADED' })
        .eq('id', Number(labOrderId));

      setLoading(false);
    }
  }

  const handleOnNext = () => {
    if (variant === '5071-Variation-1-no-ins') {
      Router.push(
        '/post-checkout/questionnaires-v2/identity-verification/IDENTITY-V-Q1'
      );
      return;
    }

    nextPage();
  };

  useEffect(() => {
    listFilesInFolder(documentsToUploads?.[0]?.folder).then(
      ({ data }: { data: any }) => handleVisibilityBase(data || [])
    );
  }, [documentsToUploads, handleVisibilityBase, listFilesInFolder]);

  const handleHomePage = () => {
    setPage('home');
  };

  const handleGoBack = () => {
    Router.back();
  };

  let bloodTestText = 'Do you have lab or blood tests from the past 12 months?';
  let labWorkInfo =
    'Lab work provides a baseline for your Care Team to understand your treatment progress and tailor it accordingly.';
  let insuranceInfo =
    'It can also help during the insurance coverage process by showing documentation for your medical history.';
  let testTypesInfo =
    "If you have recent lab results, we'll ask you to upload them next. Your tests should include a HbA1C, a lipid panel, and a metabolic panel.";
  let yesUploadLabs = 'Yes, I have recent labs I can upload.';
  let noRecentLabs = "No, I don't have recent labs.";
  let skipUploadLater = 'Skip and upload later.';
  let modalTitle = "It's okay - you can continue without adding lab work.";
  let modalSubtitle1 =
    "If you don't have your lab work handy, you should continue anyways.";
  let modalSubtitle2 =
    'You can always add it to your profile later but we want to make sure you finish your intake so your provider can review your responses and get you started on a treatment plan.';
  let modalContinue = 'Yes, continue';
  let modalGoBack = 'Go back and add lab work now';
  let submit = 'Submit';
  let goBack = 'Go back';
  let titleText = 'We need a copy of your most recent lab work.';
  let descriptionText = `This will only take a minute of your time. Take or upload a photo of
            your most recent lab work. Please ensure your photo isn't blurry,
            dark, or cutoff.`;
  let successMessage = 'Your lab work has been successfully submitted!';
  let goHomeButtonText = 'Go back home';
  let continueText = 'Continue';
  let uploadRecentLabWork =
    'This will only take a minute of your time. Upload your most recent lab work.';

  if (language === 'esp') {
    bloodTestText =
      '¿Tiene exámenes de laboratorio o análisis de sangre de los últimos 12 meses?';
    labWorkInfo =
      'Los análisis de laboratorio proporcionan una base para que su equipo de atención comprenda el progreso del tratamiento y lo adapte en consecuencia.';
    insuranceInfo =
      'También puede ayudar durante el proceso de cobertura del seguro al mostrar documentación de su historial médico.';
    testTypesInfo =
      'Si tiene resultados de laboratorio recientes, le pediremos que los suba a continuación. Sus pruebas deben incluir una HbA1C, un panel de lípidos y un panel metabólico.';
    yesUploadLabs = 'Sí, tengo análisis recientes que puedo subir.';
    noRecentLabs = 'No, no tengo análisis recientes.';
    skipUploadLater = 'Omitir y subir más tarde.';
    modalTitle =
      'Está bien - puede continuar sin agregar los análisis de laboratorio.';
    modalSubtitle1 =
      'Si no tiene sus análisis de laboratorio a mano, debería continuar de todos modos.';
    modalSubtitle2 =
      'Siempre puede agregarlo a su perfil más tarde, pero queremos asegurarnos de que termine su admisión para que su proveedor pueda revisar sus respuestas y comenzar con un plan de tratamiento.';
    modalContinue = 'Sí, continuar';
    modalGoBack = 'Volver y agregar análisis de laboratorio ahora';
    goBack = 'Regresar';
    submit = 'Subir';
    uploadRecentLabWork =
      'Esto solo tomará un minuto de su tiempo. Suba sus análisis de laboratorio más recientes.';
    titleText =
      'Necesitamos una copia de sus análisis de laboratorio más recientes.';
    descriptionText = `Esto solo tomará un minuto de su tiempo. Tome o suba una foto de
            sus análisis de laboratorio más recientes. Por favor, asegúrese de que su foto no esté borrosa,
            oscura o recortada.`;
    successMessage = '¡Sus análisis de laboratorio se han enviado con éxito!';
    goHomeButtonText = 'Volver al inicio';
    continueText = 'Continua';
  }

  return (
    <Container maxWidth="xs">
      {page === 'home' && (
        <>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginBottom: '3rem',
            }}
          >
            <Typography variant="h2">{bloodTestText}</Typography>
            <Typography variant="body1">
              {`${labWorkInfo} ${patient?.insurance_skip ? '' : insuranceInfo}`}
            </Typography>
            <Typography variant="body1">{testTypesInfo}</Typography>
          </Box>
          <Stack gap={2}>
            <ListItemButton
              onClick={handleLabUploadPage}
              sx={{
                border: '1px solid #00000033',
                borderRadius: '12px',
                paddingX: { md: '24px', xs: '16px' },
                paddingY: '20px',
              }}
            >
              {yesUploadLabs}
            </ListItemButton>
            <ListItemButton
              onClick={onSkip}
              sx={{
                border: '1px solid #00000033',
                borderRadius: '12px',
                paddingX: { md: '24px', xs: '16px' },
                paddingY: '20px',
              }}
            >
              {noRecentLabs}
            </ListItemButton>
            <ListItemButton
              onClick={onSkip}
              sx={{
                border: '1px solid #00000033',
                borderRadius: '12px',
                paddingX: { md: '24px', xs: '16px' },
                paddingY: '20px',
              }}
            >
              {skipUploadLater}
            </ListItemButton>
          </Stack>
        </>
      )}
      {page === 'upload' && (
        <Stack>
          <Stack gap={2} sx={{ marginBottom: '2.5rem' }}>
            <Typography variant="h2">{titleText}</Typography>
            <Typography>{uploadRecentLabWork}</Typography>
          </Stack>

          {visible > 0 ? (
            <Stack gap="8px">
              {documentsToUploads.map(document => (
                <DocumentCards
                  key={document.label}
                  document={document}
                  setIsDisabled={setIsDisabled}
                />
              ))}
              <Stack direction="row" alignSelf="flex-end" gap="8px">
                <IconButton onClick={handleVisibleUp} disabled={visible === 10}>
                  <AddIcon fontSize="large" />
                </IconButton>
                <IconButton
                  onClick={handleVisibleDown}
                  disabled={visible === 2}
                >
                  <RemoveIcon fontSize="large" />
                </IconButton>
              </Stack>
            </Stack>
          ) : null}

          <LoadingButton
            loading={loading}
            disabled={loading || isDisabled}
            onClick={handleLabUpload}
            sx={{ margin: '1.5rem 0' }}
          >
            {submit}
          </LoadingButton>
          <Button onClick={handleGoBack}>{goBack}</Button>
          <Modal onClose={handleOnNext} open={isModal}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%,-50%)',
                backgroundColor: 'white',
                px: 4,
                py: 12,
                borderRadius: 2,
                maxWidth: '476px',
                width: 'calc(100% - 2rem)',
              }}
            >
              <IconButton
                onClick={handleOnNext}
                sx={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                }}
              >
                <Close />
              </IconButton>

              <Stack gap={4} alignItems="center">
                <CheckMarkIcon />
                <Typography
                  textAlign="center"
                  lineHeight="24px"
                  fontSize={20}
                  fontWeight={700}
                >
                  {successMessage}
                </Typography>
                <Button onClick={handleOnNext}>{continueText}</Button>
              </Stack>
            </Box>
          </Modal>
        </Stack>
      )}
      <BasicModal isOpen={showTimeoutModal} useMobileStyle={false}>
        <Stack textAlign="center" gap={3}>
          <Typography variant="h2">{modalTitle}</Typography>
          <Typography variant="h5">{modalSubtitle1}</Typography>
          <Typography variant="h5">{modalSubtitle2}</Typography>
          <Stack gap={1}>
            <Button fullWidth onClick={onSkip}>
              {modalContinue}
            </Button>
            <Button
              fullWidth
              color="grey"
              onClick={() => setShowTimeoutModal(false)}
            >
              {modalGoBack}
            </Button>
          </Stack>
        </Stack>
      </BasicModal>
    </Container>
  );
};

export default LabOrBloodTests;
