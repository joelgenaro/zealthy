import {
  useLanguage,
  usePatient,
  usePatientDocuments,
  useVWOVariationName,
} from '@/components/hooks/data';
import {
  Box,
  Button,
  Container,
  Modal,
  Stack,
  Typography,
} from '@mui/material';
import DocumentCards from '@/components/shared/DocumentCards';
import { useEffect, useMemo, useState } from 'react';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { useCalculateSpecificCare } from '@/components/hooks/useCalculateSpecificCare';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import BasicModal from '@/components/shared/BasicModal';
import { usePatientActions } from '@/components/hooks/usePatient';
import getConfig from '../../../../../../config';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import router, { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';

interface InsuranceInformationProps {
  nextPage: (insuranceChoice?: string) => void;
}

const InsuranceInformation = ({ nextPage }: InsuranceInformationProps) => {
  const supabase = useSupabaseClient();
  const { data: patient } = usePatient();
  const { updatePatient } = usePatientActions();
  const { data: documents, refetch } = usePatientDocuments();
  const [openModal, setOpenModal] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const { specificCare, potentialInsurance } = useIntakeState();
  const { addVariant } = useIntakeActions();
  const { variant } = useIntakeState();
  const calculatedSpecificCare = useCalculateSpecificCare();
  const { data: variation5071 } = useVWOVariationName('5071');
  const language = useLanguage();
  const router = useRouter();
  const isBrandNameGlp1 = router.asPath.includes(
    '/patient-portal/weight-loss-treatment/glp1'
  );
  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  useEffect(() => {
    if (
      specificCare === 'Weight loss' ||
      calculatedSpecificCare === 'Weight loss'
    ) {
      window.freshpaint?.track('weight-loss-post-checkout-insurance');
    }
  }, [calculatedSpecificCare, specificCare]);

  useEffect(() => {
    window.freshpaint?.track('post-checkout-insurance');
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowTimeoutModal(true);
    }, 90000);
    return () => clearTimeout(timeout);
  }, []);

  const [locallyUploadedDocs, setLocallyUploadedDocs] = useState<string[]>([]);

  const hasInsuranceDocServer = useMemo(() => {
    if (!documents || documents.length === 0) return false;
    return documents.some(doc => {
      const name = doc.name ?? '';
      return name.includes('front') || name.includes('back');
    });
  }, [documents]);

  const hasInsuranceDoc = useMemo(() => {
    return hasInsuranceDocServer || locallyUploadedDocs.length > 0;
  }, [hasInsuranceDocServer, locallyUploadedDocs]);

  const insuranceAndPharmacy = useMemo(() => {
    if (!patient) return [];
    const labels =
      language === 'esp'
        ? {
            insuranceCard: 'Tarjeta de seguro',
            secondaryInsuranceCard:
              'Tarjeta de seguro secundaria (solo si corresponde)',
            pharmacyBenefitsCard: 'Tarjeta de beneficios de farmacia',
            front: 'Frente',
            back: 'Reverso',
          }
        : {
            insuranceCard: 'Insurance card',
            secondaryInsuranceCard:
              'Secondary insurance card (only if applicable)',
            pharmacyBenefitsCard: 'Pharmacy benefits card',
            front: 'Front',
            back: 'Back',
          };
    return [
      {
        label: labels.insuranceCard,
        folder: `patient-${patient.id}/insurance-card`,
        items: [
          {
            label: `${labels.insuranceCard} ${labels.front}`,
            fileName: 'front',
          },
          {
            label: `${labels.insuranceCard} ${labels.back}`,
            fileName: 'back',
          },
        ],
      },
      {
        label: labels.secondaryInsuranceCard,
        folder: `patient-${patient.id}/secondary-insurance-card`,
        items: [
          {
            label: `${labels.insuranceCard} ${labels.front}`,
            fileName: 'front',
          },
          {
            label: `${labels.insuranceCard} ${labels.back}`,
            fileName: 'back',
          },
        ],
      },
      {
        label: labels.pharmacyBenefitsCard,
        folder: `patient-${patient.id}/pharmacy-card`,
        items: [
          {
            label: `${labels.pharmacyBenefitsCard} ${labels.front}`,
            fileName: 'front',
          },
          {
            label: `${labels.pharmacyBenefitsCard} ${labels.back}`,
            fileName: 'back',
          },
        ],
      },
    ];
  }, [patient, language]);

  async function handleContinue() {
    await supabase
      .from('patient')
      .update({ insurance_skip: false })
      .eq('id', patient?.id);
    if (
      variation5071?.variation_name === 'Variation-1' &&
      documents?.length === 0
    ) {
      await supabase.from('patient_action_item').insert({
        type: 'ADDITIONAL_PA_QUESTIONS',
        patient_id: patient?.id,
        title: 'Answer a few questions to get GLP-1 covered by insurance',
        body: 'Answer a few questions so your care team can submit a Prior Authorization to have your GLP-1 covered by insurance',
        is_required: true,
      });
      addVariant('5071-Variation-1-no-ins');
    }
    nextPage();
  }

  async function handleContinueWithoutUploading() {
    await supabase
      .from('patient')
      .update({ insurance_skip: false })
      .eq('id', patient?.id);
    if (
      variation5071?.variation_name === 'Variation-1' &&
      documents?.length === 0
    ) {
      await supabase.from('patient_action_item').insert({
        type: 'ADDITIONAL_PA_QUESTIONS',
        patient_id: patient?.id,
        title: 'Answer a few questions to get GLP-1 covered by insurance',
        body: 'Answer a few questions so your care team can submit a Prior Authorization to have your GLP-1 covered by insurance',
        is_required: true,
      });
      addVariant('5071-Variation-1-no-ins');
    }
    nextPage();
  }

  async function handleSkipInsurance() {
    window.freshpaint?.track('no-insurance');
    await supabase
      .from('patient')
      .update({ insurance_skip: true })
      .eq('id', patient?.id)
      .then(() =>
        updatePatient({
          insurance_skip: true,
        })
      );

    if (specificCare === SpecificCareOption.PREP) {
      router.back();
    } else {
      nextPage();
    }
  }

  function handleTimeoutContinue() {
    if (specificCare === SpecificCareOption.PREP) {
      handleSkip();
      return;
    }
    nextPage();
  }

  async function handleSkip() {
    await supabase
      .from('patient')
      .update({ insurance_skip: true })
      .eq('id', patient?.id)
      .then(() =>
        updatePatient({
          insurance_skip: true,
        })
      );

    if (
      specificCare === 'Weight loss' ||
      calculatedSpecificCare === 'Weight loss'
    ) {
      window.freshpaint?.track('weight-loss-skip-insurance');
    }

    nextPage();
  }

  let confirmText =
    'Confirm your insurance information, or let us know if you do not plan to use insurance.';
  let bundledPlanText =
    'If you would like to switch plans in the future for even cheaper care then please confirm that your insurance information is accurate and up to date. If you have a separate pharmacy benefits card, please confirm that information as well.';
  let regularPlanText =
    'Please confirm that your insurance information is accurate and up to date. If you have a separate pharmacy benefits card, please confirm that information as well.';
  let rxInfoText =
    'Please make sure that your Rx BIN, PCN, and Group ID (or Rx Group) numbers are clearly visible.';
  let governmentInsuranceText = `Remember that if you have government insurance, such as Medicare, Medicaid, or Tricare, you will not be eligible for the ${siteName} Weight Loss program.`;
  let blurryPhotoWarning =
    'Blurry photos or incorrect insurance or pharmacy benefits information may delay receiving a prescription.';
  let accurateInfoPrompt =
    'If everything looks accurate, click "Continue" below.';
  let continueButton = 'Continue';
  let continueWithoutUploadingButton = 'Continue without uploading';
  let skipInsuranceButton = 'I do not plan to use insurance';
  let modalTitle = `Proceeding without uploading your insurance card may lead to a delay with ${siteName} getting a GLP-1, such as Ozempic, Mounjaro, or Wegovy, covered by your insurance so that you can pay as little as $0 for your Rx.`;
  let modalRecommendation =
    "We recommend you go back to add insurance if you'd like us to help get your insurance to cover a GLP-1 without a delay.";
  let goBackToAddInsurance = 'Go back to add insurance';
  let continueWithoutInsurance = 'Continue without insurance';
  let timeoutModalTitle =
    'Continue without uploading insurance? You can always add it later.';
  let timeoutModalDescription = `As a ${siteName} weight loss member, you can start by ordering semaglutide, which is the main active ingredient in Wegovy and Ozempic, or tirzepatide, which is the main active ingredient in Mounjaro and Zepbound, without using insurance.`;
  let timeoutModalAdvice =
    "You should continue your intake if you don't have your insurance card handy, since your provider will not be able to review your responses until you have completed your intake.";
  let yesContinue = 'Yes, continue';
  let goBackAndAddInsurance = 'Go back and add insurance now';

  if (language === 'esp') {
    confirmText =
      'Confirme su información de seguro, o háganos saber si no planea usar seguro.';
    bundledPlanText =
      'Si desea cambiar de plan en el futuro para obtener atención aún más económica, confirme que su información de seguro sea precisa y esté actualizada. Si tiene una tarjeta de beneficios de farmacia separada, confirme también esa información.';
    regularPlanText =
      'Por favor, confirme que su información de seguro sea precisa y esté actualizada. Si tiene una tarjeta de beneficios de farmacia separada, confirme también esa información.';
    rxInfoText =
      'Asegúrese de que los números de Rx BIN, PCN y Group ID (o Rx Group) sean claramente visibles.';
    governmentInsuranceText = `Recuerde que si tiene un seguro gubernamental, como Medicare, Medicaid o Tricare, no será elegible para el programa de pérdida de peso de ${siteName}.`;
    blurryPhotoWarning =
      'Las fotos borrosas o la información incorrecta del seguro o de los beneficios de farmacia pueden retrasar la recepción de una receta.';
    accurateInfoPrompt =
      'Si todo parece correcto, haga clic en "Continuar" a continuación.';
    continueButton = 'Continuar';
    continueWithoutUploadingButton = 'Continuar sin cargar';
    skipInsuranceButton = 'No planeo usar seguro';
    modalTitle = `Continuar sin cargar su tarjeta de seguro puede llevar a un retraso en que ${siteName} obtenga la cobertura de un GLP-1, como Ozempic, Mounjaro o Wegovy, por su seguro para que pueda pagar tan poco como $0 por su receta.`;
    modalRecommendation =
      'Le recomendamos que vuelva a agregar el seguro si desea que le ayudemos a que su seguro cubra un GLP-1 sin demora.';
    goBackToAddInsurance = 'Volver a agregar seguro';
    continueWithoutInsurance = 'Continuar sin seguro';
    timeoutModalTitle =
      '¿Continuar sin cargar el seguro? Siempre puede agregarlo más tarde.';
    timeoutModalDescription = `Como miembro de pérdida de peso de ${siteName}, puede comenzar ordenando semaglutida, que es el ingrediente activo principal en Wegovy y Ozempic, o tirzepatida, que es el ingrediente activo principal en Mounjaro y Zepbound, sin usar seguro.`;
    timeoutModalAdvice =
      'Debe continuar con su admisión si no tiene su tarjeta de seguro a mano, ya que su proveedor no podrá revisar sus respuestas hasta que haya completado su admisión.';
    yesContinue = 'Sí, continuar';
    goBackAndAddInsurance = 'Volver y agregar seguro ahora';
  }

  return (
    <Container maxWidth="sm">
      {specificCare === 'Prep' && (
        <Typography variant="h2" sx={{ marginBottom: 5 }}>
          {confirmText}
        </Typography>
      )}
      {specificCare !== 'Prep' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginBottom: '3rem',
          }}
        >
          <Typography variant="h2">{confirmText}</Typography>
          <Typography variant="body1">
            {['Semaglutide Bundled', 'Tirzepatide Bundled'].includes(
              potentialInsurance || ''
            )
              ? bundledPlanText
              : regularPlanText}
          </Typography>
          <Typography variant="body1">{rxInfoText}</Typography>
          {calculatedSpecificCare === 'Weight loss' &&
            !specificCare?.includes('Weight loss access') && (
              <Typography variant="body1">{governmentInsuranceText}</Typography>
            )}
          <Typography variant="body1" sx={{ fontWeight: 700 }}>
            {blurryPhotoWarning}
          </Typography>
          <Typography variant="body1">{accurateInfoPrompt}</Typography>
        </Box>
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5rem',
          marginBottom: '3rem',
        }}
      >
        {insuranceAndPharmacy.map(docGroup => (
          <DocumentCards
            key={docGroup.label}
            refetch={refetch}
            document={docGroup}
            onUploadSuccess={fileName =>
              setLocallyUploadedDocs(prev =>
                prev.includes(fileName) ? prev : [...prev, fileName]
              )
            }
          />
        ))}
      </Box>
      <Button
        type="button"
        fullWidth
        sx={{ marginBottom: '1rem' }}
        onClick={handleContinue}
        disabled={!hasInsuranceDoc}
      >
        {continueButton}
      </Button>
      <Button
        type="button"
        color="grey"
        fullWidth
        sx={{ marginBottom: '1rem' }}
        onClick={handleContinueWithoutUploading}
      >
        {continueWithoutUploadingButton}
      </Button>
      {isBrandNameGlp1 ? null : (
        <Button
          type="button"
          color="grey"
          fullWidth
          sx={{ marginBottom: '1rem' }}
          onClick={handleSkipInsurance}
        >
          {skipInsuranceButton}
        </Button>
      )}
      <Modal open={openModal}>
        <Stack
          justifyContent="center"
          alignItems="center"
          spacing={3}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.default',
            maxWidth: 400,
            minWidth: 300,
            minHeight: 300,
            p: 4,
            outline: 'none',
            borderRadius: '8px',
          }}
        >
          <Typography variant="h4">{modalTitle}</Typography>
          <Typography variant="h4">{modalRecommendation}</Typography>
          <Stack width="100%" gap="1rem">
            <Button fullWidth onClick={() => setOpenModal(false)}>
              {goBackToAddInsurance}
            </Button>
            <Button fullWidth color="grey" onClick={handleSkip}>
              {continueWithoutInsurance}
            </Button>
          </Stack>
        </Stack>
      </Modal>
      <BasicModal isOpen={showTimeoutModal} useMobileStyle={false}>
        <Stack textAlign="center" gap={3}>
          <Typography variant="h2">{timeoutModalTitle}</Typography>
          {specificCare !== 'Prep' && (
            <Typography variant="h5">{timeoutModalDescription}</Typography>
          )}
          <Typography variant="h5">{timeoutModalAdvice}</Typography>
          <Button fullWidth onClick={handleTimeoutContinue}>
            {yesContinue}
          </Button>
          <Button
            fullWidth
            color="grey"
            onClick={() => setShowTimeoutModal(false)}
          >
            {goBackAndAddInsurance}
          </Button>
        </Stack>
      </BasicModal>
    </Container>
  );
};

export default InsuranceInformation;
