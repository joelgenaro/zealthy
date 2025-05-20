import {
  FormControl,
  Modal,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';
import {
  useInsuranceActions,
  useInsuranceAsync,
  useInsuranceState,
} from '@/components/hooks/useInsurance';
import { DocumentStatus, ExtractedFieldDto } from 'butler-sdk';
import { InsuranceProvider } from '@/context/AppContext/reducers/types/insurance';
import InsuranceProviderSelector from '@/components/screens/PatientProfile/components/InsuranceProviderSelector/InsuranceProviderSelector';
import LoadingModal from '@/components/shared/Loading/LoadingModal';
import ErrorMessage from '@/components/shared/ErrorMessage/ErrorMessage';
import SuccessCheckMarkIcon from '@/components/shared/icons/SuccessCheckMarkIcon';
import ImageUploader, {
  FileType,
} from '@/components/shared/ImageUploader/ImageUploader';
import DOMPurify from 'dompurify';

interface MainModalProps {
  isOpen: boolean;
  handleClose: (close: boolean) => void;
}

interface CardProps {
  card: FileType | null;
  handleSetCard: (card: FileType | null) => void;
  handleChange: () => void;
  uploaderTitle: string;
  cardTitle: string;
}

interface InsuranceFormProps {
  title: string;
  description?: string;
  closePrevModal: () => void;
  handleSuccess: () => void;
  handleError: (error: string) => void;
  handleSetLoading: (val: boolean) => void;
}

interface InsuranceCaptureProps {
  handleOpenManually: (open: boolean) => void;
  handleOpenVerifyModal: () => void;
  handleCaptureChange: () => void;
  clearState: boolean;
}

interface ErrorModalProps {
  handleContinue: () => void;
  handleStateClear: () => void;
  isMobile: boolean;
}

const mapResponseToDetails = (response: ExtractedFieldDto[]) => {
  const memberName =
    response.find(field => field.fieldName === 'Member Name')?.value || '';
  const member_id =
    response.find(field => field.fieldName === 'ID Number')?.value || '';

  return {
    policyholder_first_name: memberName.split(' ')[0],
    policyholder_last_name: memberName.split(' ')[1],
    member_id,
  };
};

const InsuranceCapture = ({
  handleOpenManually,
  handleCaptureChange,
  handleOpenVerifyModal,
  clearState,
}: InsuranceCaptureProps) => {
  const { extractDataFromCard } = useInsuranceAsync();
  const [frontOfCard, setFrontOfCard] = useState<FileType | null>(null);
  const [backOfCard, setBackOfCard] = useState<FileType | null>(null);
  const [error, setError] = useState('');
  const [frontSideModal, setFrontSideModal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [addInsuranceModal, setAddInsuranceModal] = useState(true);
  const { addInsurancePolicy } = useInsuranceActions();

  const frontOfCardTitle = 'Provide Zealthy with your insurance information.';
  const backOfCardTitle = 'Now provide a photo of the back of your card.';

  useEffect(() => {
    if (clearState) {
      setFrontOfCard(null);
      setBackOfCard(null);
      setError('');
      setFrontSideModal(true);
      setAddInsuranceModal(true);
      setLoading(false);
    }
  }, [clearState]);

  const handleSetCard = (card: FileType | null) => {
    if (!card) return;
    if (card.name === 'Front-of-card') {
      setFrontOfCard(card);
    } else if (card.name === 'Back-of-card') {
      setBackOfCard(card);
    }
  };

  const handleSubmit = async () => {
    if (!frontOfCard) {
      setError('Please upload front of the card');
      return;
    }

    if (!backOfCard) {
      setError('Please upload back of the card');
      return;
    }

    try {
      setLoading(true);
      setAddInsuranceModal(false);
      // extract data
      const { data } = await extractDataFromCard(frontOfCard);

      // update insurance reducer and navigate to next page
      if (data && data.documentStatus === DocumentStatus.Completed) {
        addInsurancePolicy(mapResponseToDetails(data.formFields!));
        setLoading(false);
        handleOpenVerifyModal();
      } else {
        // Router.push(Pathnames.INSURANCE_UNSUPPORTED);
      }
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const handleChange = () => {
    handleOpenManually(true);
    handleCaptureChange();
  };

  const AddInsuranceFlow = (
    <>
      {frontSideModal ? (
        <InsuranceCardSide
          card={frontOfCard}
          handleSetCard={handleSetCard}
          uploaderTitle="Front of card"
          cardTitle={frontOfCardTitle}
          handleChange={handleChange}
        />
      ) : (
        <InsuranceCardSide
          card={backOfCard}
          handleSetCard={handleSetCard}
          uploaderTitle="Back of card"
          cardTitle={backOfCardTitle}
          handleChange={handleChange}
        />
      )}
      {frontSideModal ? (
        <Button
          disabled={!frontOfCard}
          onClick={() => setFrontSideModal(false)}
        >
          Next
        </Button>
      ) : (
        <Button disabled={!backOfCard} onClick={handleSubmit}>
          Verify insurance information
        </Button>
      )}
    </>
  );

  return (
    <Container maxWidth="sm">
      <Grid
        container
        margin="0 auto"
        maxWidth="29rem"
        direction="column"
        gap="48px"
      >
        {addInsuranceModal ? AddInsuranceFlow : null}
        {loading && (
          <LoadingModal
            title="Submitting insurance information..."
            description="This will take a few seconds."
          />
        )}
      </Grid>
    </Container>
  );
};

const InsuranceCardSide = ({
  card,
  handleSetCard,
  uploaderTitle,
  cardTitle,
  handleChange,
}: CardProps) => {
  return (
    <Grid
      container
      margin="0 auto"
      maxWidth="29rem"
      direction="column"
      gap="48px"
    >
      <Grid container direction="column" gap="16px">
        <Typography variant="h2">{cardTitle}</Typography>
        <Typography>
          This will only take a minute of your time. Take photos of the front
          and back of your insurance card or, if easier,{' '}
          <Link href="" onClick={handleChange}>
            enter your details manually.
          </Link>
        </Typography>
      </Grid>
      <ImageUploader
        title={uploaderTitle}
        subtitle=""
        setFilePath={handleSetCard}
        uploadedPhoto={card}
      />
    </Grid>
  );
};

const InsuranceForm = ({
  title,
  closePrevModal,
  handleSuccess,
  handleError,
  handleSetLoading,
}: InsuranceFormProps) => {
  const {
    member_id,
    policyholder_first_name,
    policyholder_last_name,
    payer,
    is_dependent,
  } = useInsuranceState();
  const { rteVerification, lookUpPayer, createInsurancePolicy } =
    useInsuranceAsync();
  const [error, setError] = useState('');

  const {
    addInsuranceProvider,
    addMemberId,
    addPolicyholderFirstName,
    addPolicyholderLastName,
    addUserIsDependent,
  } = useInsuranceActions();

  const handleInsuranceProviderChange = (value: InsuranceProvider) => {
    addInsuranceProvider(value);
    setError('');
  };

  const handleMemberIDChange = (e: ChangeEvent<HTMLInputElement>) =>
    addMemberId(
      DOMPurify.sanitize(e.target.value, {
        USE_PROFILES: { html: false },
      })
    );

  const handleFirstNameChange = (e: ChangeEvent<HTMLInputElement>) =>
    addPolicyholderFirstName(
      DOMPurify.sanitize(e.target.value, {
        USE_PROFILES: { html: false },
      })
    );

  const handleLastNameChange = (e: ChangeEvent<HTMLInputElement>) =>
    addPolicyholderLastName(
      DOMPurify.sanitize(e.target.value, {
        USE_PROFILES: { html: false },
      })
    );

  const handleIsUserDependent = (e: ChangeEvent<HTMLInputElement>) =>
    addUserIsDependent(e.target.checked);

  const handleSubmit = async () => {
    if (!payer) {
      setError('Please select payer from the list');
      return;
    }

    try {
      closePrevModal();
      handleSetLoading(true);
      // verify eligibility
      const { data } = await lookUpPayer(payer.name).then(({ data }) =>
        rteVerification(data.data.lookup[0].payerId)
      );
      const plan: any = data.items
        ?.filter(
          (t: any) =>
            t.type === 'ACTIVE_COVERAGE' &&
            t.serviceTypeCodes.includes('HEALTH_BENEFIT_PLAN_COVERAGE')
        )
        ?.slice(-1)?.[0];

      const outOfNetwork = plan.messages.some((e: string) =>
        e.includes('PROVIDER IS OUT NETWORK FOR MEMBER')
      );

      const coPay = data.items
        ?.filter(
          (c: any) =>
            c.type === 'COPAYMENT' &&
            c.serviceTypeCodes.includes('PROFESSIONAL_VISIT_OFFICE') &&
            (c.inPlanNetworkType === 'YES' || c.inPlanNetworkType === 'NA') &&
            !c.messages.some((e: any) => e.includes('AFTER DEDUCTIBLE')) &&
            !c.messages.some((e: any) => e.includes('VALUE CHOICE PCP'))
        )
        .reduce(function (min: any, obj: any) {
          var amount = parseFloat(obj.benefitAmount.amount);
          return amount < min ? amount : min;
        }, Infinity);
      // create policy
      createInsurancePolicy({
        plan_start: plan.eligibilityFromDate,
        plan_name: plan.coverageDescription,
        plan_status: plan.type,
        plan_type: plan.planType,
        member_obligation: coPay,
        out_of_network: outOfNetwork || payer.name !== 'Aetna',
      });
      handleSetLoading(false);
      handleSuccess();
    } catch (err) {
      handleSetLoading(false);
      handleError((err as Error).message);
      setError(
        "We're having trouble validating your insurance right now. Please feel free to skip this step and you'll be able to work with a Zealthy coordinator to add it later."
      );
    }
  };

  return (
    <Container maxWidth="sm">
      <Grid container direction="column" gap="48px">
        <Grid container direction="column" gap="16px">
          <Typography variant="h2">{title}</Typography>
        </Grid>
        <FormControl>
          <Grid container direction="column" gap="48px">
            <Grid container direction="column" gap="16px">
              <TextField
                required
                fullWidth
                label="First name on insurance card"
                id="insurance-first-name"
                onChange={handleFirstNameChange}
                value={policyholder_first_name}
              />
              <TextField
                required
                fullWidth
                label="Last name on insurance card"
                id="insurance-last-name"
                onChange={handleLastNameChange}
                value={policyholder_last_name}
              />
              <InsuranceProviderSelector
                isRequired
                setProvider={handleInsuranceProviderChange}
              />
              <TextField
                required
                fullWidth
                label="Member ID"
                id="insurance-member-id"
                onChange={handleMemberIDChange}
                value={member_id}
              />
            </Grid>
            <Grid container direction="column" gap="16px">
              <Box padding="7.5px" borderRadius="4px" color="#00000099">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={is_dependent}
                      onChange={handleIsUserDependent}
                    />
                  }
                  label="I am a dependent on this insurance policy."
                />
              </Box>
              {error.length ? <ErrorMessage>{error}</ErrorMessage> : null}
              <Button onClick={handleSubmit}>
                Submit insurance information
              </Button>
            </Grid>
          </Grid>
        </FormControl>
      </Grid>
    </Container>
  );
};

const InsuranceSuccessModal = ({ isMobile }: { isMobile: boolean }) => (
  <Container maxWidth="sm" sx={isMobile ? { padding: '0 30px' } : {}}>
    <Stack justifyContent="center" alignItems="center" spacing={6} gap="25px">
      <Grid
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SuccessCheckMarkIcon />
      </Grid>
      <Typography>
        <strong>Congratulations!</strong> You are eligible to use your insurance
        to pay for care at Zealthy.
      </Typography>
    </Stack>
  </Container>
);

const InsuranceErrorModal = ({
  handleContinue,
  handleStateClear,
  isMobile,
}: ErrorModalProps) => (
  <Container maxWidth="sm">
    <Grid
      container
      direction="column"
      sx={isMobile ? { padding: '0 20px' } : {}}
    >
      <Grid
        sx={{
          paddingBottom: 10,
        }}
      >
        <Typography variant="h2">
          We are unable to verify your insurance information at this time.
        </Typography>
      </Grid>
      <Stack gap="24px">
        <Button onClick={handleStateClear} color="primary">
          Enter insurance details again
        </Button>
        <Button onClick={handleContinue} color="grey">
          Continue without insurance
        </Button>
      </Stack>
    </Grid>
  </Container>
);

const InsuranceCaptureModal = ({ isOpen, handleClose }: MainModalProps) => {
  const [enterManuallyModal, setEnterManuallyModal] = useState(false);
  const [addPhotoModal, setAddPhotoModal] = useState(true);
  const [clearPhotoModalState, setClearPhotoModalState] = useState(false);
  const [successSubmit, setSuccessSubmit] = useState(false);
  const [verifyInsuranceModal, setVerifyInsuranceModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleOpenManually: (open: boolean) => void = value => {
    setEnterManuallyModal(value);
  };

  const handleCaptureChange = () => {
    setAddPhotoModal(false);
  };

  const handleSuccess = () => {
    setSuccessSubmit(true);
  };

  const handleError = (err: string) => {
    setError(err);
  };

  const handleSetLoading = (val: boolean) => {
    setLoading(val);
  };

  const handleContinue = () => {
    clearState();
    handleClose(false);
  };

  const clearState = () => {
    setEnterManuallyModal(false);
    setAddPhotoModal(true);
    setSuccessSubmit(false);
    setVerifyInsuranceModal(false);
    setLoading(false);
    setError('');
    setClearPhotoModalState(true);
  };

  const mobileSx = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    bgcolor: 'background.default',
    outline: 'none',
  };

  const webSx = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.default',
    minWidth: 300,
    minHeight: 300,
    p: 4,
    outline: 'none',
    borderRadius: 5,
  };

  return (
    <Modal open={isOpen} onClose={handleContinue}>
      <Stack
        justifyContent="center"
        alignItems="center"
        spacing={6}
        sx={isMobile ? mobileSx : webSx}
      >
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <IconButton onClick={() => handleClose(false)}>
            <CloseIcon />
          </IconButton>
        </div>
        {enterManuallyModal ? (
          <InsuranceForm
            title="Provide Zealthy with your insurance information."
            closePrevModal={() => setEnterManuallyModal(false)}
            handleSuccess={handleSuccess}
            handleError={handleError}
            handleSetLoading={handleSetLoading}
          />
        ) : null}
        {verifyInsuranceModal ? (
          <InsuranceForm
            title="Double-check your captured insurance info."
            closePrevModal={() => setVerifyInsuranceModal(false)}
            handleSuccess={handleSuccess}
            handleError={handleError}
            handleSetLoading={handleSetLoading}
          />
        ) : null}
        {addPhotoModal ? (
          <InsuranceCapture
            handleOpenManually={handleOpenManually}
            handleCaptureChange={handleCaptureChange}
            clearState={clearPhotoModalState}
            handleOpenVerifyModal={() => setVerifyInsuranceModal(true)}
          />
        ) : null}
        {successSubmit ? <InsuranceSuccessModal isMobile={isMobile} /> : null}
        {error.length ? (
          <InsuranceErrorModal
            isMobile={isMobile}
            handleContinue={handleContinue}
            handleStateClear={clearState}
          />
        ) : null}
        {loading && (
          <LoadingModal
            title="Submitting insurance information..."
            description="This will take a few seconds."
          />
        )}
      </Stack>
    </Modal>
  );
};

export default InsuranceCaptureModal;
