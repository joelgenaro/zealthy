import Router from 'next/router';
import { useState } from 'react';
import {
  Typography,
  Stack,
  Button,
  IconButton,
  Modal,
  Box,
} from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { Pathnames } from '@/types/pathnames';
import Close from '@/components/shared/icons/Close';
import CheckMarkIcon from '@/components/shared/icons/CheckMarkCircleGreen';
import ImageUploader, {
  FileType,
} from '@/components/shared/ImageUploader/ImageUploader';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/components/hooks/data';

interface MediaParams {
  patient_canvas_id: string | null;
  image: {
    type: string;
    name: string;
    fileToUpload: string;
  };
}
const LabWorkSubmit = () => {
  const supabase = useSupabaseClient<Database>();
  const searchParams = useSearchParams();
  const [document, setDocument] = useState<FileType | null>(null);
  const [isModal, setIsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const labOrderId = searchParams?.get('id');
  const toggleModal = () => setIsModal(!isModal);
  const language = useLanguage();

  async function handleLabUpload() {
    if (!document) alert('Please upload a photo before submitting!');
    if (document) {
      setLoading(true);

      toggleModal();

      if (labOrderId) {
        await supabase
          .from('lab_order')
          .update({ status: 'UPLOADED' })
          .eq('id', labOrderId);
      }
    }
    setLoading(false);
  }

  let titleText = 'We need a copy of your most recent lab work.';
  let descriptionText = `This will only take a minute of your time. Take or upload a photo of
            your most recent lab work. Please ensure your photo isn't blurry,
            dark, or cutoff.`;
  let submitButtonText = 'Submit';
  let successMessage = 'Your lab work has been successfully submitted!';
  let goHomeButtonText = 'Go back home';

  if (language === 'esp') {
    titleText =
      'Necesitamos una copia de sus análisis de laboratorio más recientes.';
    descriptionText = `Esto solo tomará un minuto de su tiempo. Tome o suba una foto de
            sus análisis de laboratorio más recientes. Por favor, asegúrese de que su foto no esté borrosa,
            oscura o recortada.`;
    submitButtonText = 'Enviar';
    successMessage = '¡Sus análisis de laboratorio se han enviado con éxito!';
    goHomeButtonText = 'Volver al inicio';
  }

  return (
    <>
      <Stack gap={{ sm: 6, xs: 3 }}>
        <Stack gap={2}>
          <Typography variant="h2">{titleText}</Typography>
          <Typography>{descriptionText}</Typography>
        </Stack>

        <ImageUploader
          title=""
          subtitle=""
          setFilePath={setDocument}
          uploadedPhoto={document}
        />

        <LoadingButton
          loading={loading}
          disabled={loading}
          onClick={handleLabUpload}
          sx={{ marginBottom: '24px' }}
        >
          {submitButtonText}
        </LoadingButton>
      </Stack>

      <Modal
        onClose={() => Router.push(Pathnames.PATIENT_PORTAL)}
        open={isModal}
      >
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
            onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}
            sx={{ position: 'absolute', top: 20, right: 20 }}
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
            <Button onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}>
              {goHomeButtonText}
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  );
};

export default LabWorkSubmit;
