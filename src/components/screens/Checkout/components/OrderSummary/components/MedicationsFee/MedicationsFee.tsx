import { useVisitActions } from '@/components/hooks/useVisit';
import { Order } from '@/components/screens/Checkout/types';
import WhiteBox from '@/components/shared/layout/WhiteBox';
import {
  Medication,
  MedicationType,
} from '@/context/AppContext/reducers/types/visit';
import {
  Box,
  Button,
  Divider,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import RemovingModal from '@/components/shared/RemovingModal';
import { Price } from '../Fee';
import ProviderReview from '@/components/shared/icons/ProviderReview';
import IntroductoryDose from '@/components/shared/icons/IntroductoryDose';
import { useIntakeSelect } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';

const Review = () => <ProviderReview width={24} height={28} />;
const Messages = () => {
  return (
    <svg
      width={24}
      height={21}
      viewBox="0 0 24 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.01726 0.0625H17.3968C18.227 0.0625 18.9815 0.402871 19.5288 0.951001C20.0754 1.49913 20.4148 2.25576 20.4148 3.08826V3.56567H20.982C21.8122 3.56567 22.5667 3.90604 23.114 4.45417C23.6606 5.0023 24 5.75892 24 6.59217V18.2827C24 18.6702 23.8905 19.0341 23.69 19.345L23.6892 19.3443C23.4894 19.6537 23.2044 19.9027 22.8525 20.0611C22.4976 20.221 22.1222 20.2711 21.7622 20.2166C21.4015 20.1613 21.0584 20.0015 20.766 19.7421L19.3297 18.4668C19.2504 18.3961 19.1666 18.3438 19.0778 18.3106C18.9911 18.2782 18.8934 18.2613 18.7839 18.2613H6.60242C5.77225 18.2613 5.01775 17.9209 4.47116 17.3728C4.0671 16.9676 3.77617 16.4482 3.65201 15.8691L3.23472 16.2397C2.94233 16.4998 2.59851 16.6596 2.23852 16.7141C1.87854 16.7694 1.50312 16.7193 1.14754 16.5587C0.794172 16.3988 0.508387 16.1505 0.310028 15.8426C0.301947 15.8301 0.293866 15.8168 0.287254 15.8043C0.101384 15.5022 0 15.1523 0 14.781V3.09047C0 2.25797 0.339415 1.50134 0.886005 0.953211C1.43259 0.405081 2.18709 0.0647103 3.018 0.0647103L3.01726 0.0625ZM4.14644 11.2608C3.83568 11.2608 3.58369 11.0081 3.58369 10.6972C3.58369 10.3856 3.83568 10.1329 4.14644 10.1329H12.7934C13.1035 10.1329 13.3555 10.3856 13.3555 10.6972C13.3555 11.0081 13.1035 11.2608 12.7934 11.2608H4.14644ZM4.14644 7.97723C3.83568 7.97723 3.58369 7.72453 3.58369 7.41363C3.58369 7.10199 3.83568 6.84929 4.14644 6.84929H16.2677C16.5784 6.84929 16.8304 7.10199 16.8304 7.41363C16.8304 7.72526 16.5784 7.97723 16.2677 7.97723H4.14644ZM4.14644 4.69361C3.83568 4.69361 3.58369 4.44091 3.58369 4.13C3.58369 3.81837 3.83568 3.56567 4.14644 3.56567H16.2677C16.5784 3.56567 16.8304 3.81837 16.8304 4.13C16.8304 4.44164 16.5784 4.69361 16.2677 4.69361H4.14644ZM20.4141 4.69361V11.7309C20.4141 12.5634 20.0747 13.32 19.5281 13.8689C18.9815 14.417 18.227 14.7574 17.3961 14.7574H5.21538C5.10591 14.7574 5.00747 14.7736 4.92151 14.8067C4.84731 14.8347 4.77679 14.876 4.7092 14.9298V15.234C4.7092 15.7557 4.92225 16.2301 5.26534 16.5742C5.60842 16.9182 6.08155 17.1319 6.60169 17.1319H18.7832C19.0249 17.1319 19.2541 17.1731 19.473 17.2564C19.689 17.3382 19.8881 17.4612 20.0718 17.624L21.508 18.9C21.6322 19.0105 21.7776 19.0783 21.9282 19.1012C22.0796 19.124 22.2383 19.1026 22.3904 19.0341C22.5461 18.9641 22.6681 18.8595 22.7489 18.7343L22.7496 18.7328L22.7489 18.7321C22.8297 18.6068 22.8738 18.4528 22.8738 18.2827V6.59217C22.8738 6.07056 22.6607 5.5961 22.3176 5.25205C21.9745 4.908 21.5014 4.69434 20.9813 4.69434H20.4141V4.69361ZM3.73797 14.2881C3.76074 14.2645 3.78499 14.2424 3.81144 14.2225L3.92678 14.1201C4.11044 13.9566 4.30954 13.8343 4.52553 13.7525C4.74372 13.6692 4.97294 13.628 5.21538 13.628H17.3961C17.9162 13.628 18.3894 13.4143 18.7325 13.0703C19.0755 12.7262 19.2886 12.2518 19.2886 11.7301V4.12927V3.08826C19.2886 2.56739 19.0755 2.0922 18.7325 1.74815C18.3894 1.40409 17.9162 1.19044 17.3961 1.19044H3.01653C2.49639 1.19044 2.02326 1.40409 1.68018 1.74815C1.33709 2.0922 1.12404 2.56666 1.12404 3.08826V14.7787C1.12404 14.9401 1.16371 15.0867 1.23497 15.2075L1.24966 15.2282C1.33195 15.3556 1.4539 15.4602 1.60818 15.5302C1.76025 15.5987 1.91968 15.6201 2.07102 15.5973C2.22236 15.5744 2.36709 15.5059 2.49125 15.3961L3.7387 14.2881H3.73797Z"
        fill="black"
      />
    </svg>
  );
};

const Delivery = () => {
  return (
    <svg
      width={24}
      height={25}
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23.9775 6.64447C23.9669 6.61815 23.953 6.59381 23.9353 6.57166C23.9316 6.56707 23.929 6.56214 23.925 6.55777C23.9068 6.53755 23.8863 6.51921 23.8624 6.50461C23.8571 6.50133 23.851 6.49996 23.8455 6.49707C23.8427 6.49561 23.8411 6.49295 23.8383 6.49156L12.6258 1.02906C12.5466 0.990314 12.4534 0.990314 12.3742 1.02906L1.16172 6.49156C1.15888 6.49295 1.15728 6.49561 1.15451 6.49707C1.14898 6.49996 1.14294 6.50133 1.13757 6.50461C1.11373 6.51921 1.09323 6.53755 1.07496 6.55777C1.071 6.56214 1.06835 6.56707 1.06468 6.57166C1.04699 6.59381 1.03304 6.61815 1.02255 6.64447C1.0199 6.65114 1.01678 6.65721 1.01462 6.66405C1.0059 6.69165 1 6.72022 1 6.75V17.9625C1 18.0703 1.06036 18.1691 1.15638 18.2183L12.3689 23.9683C12.3726 23.9702 12.3768 23.9694 12.3806 23.9711C12.4187 23.9886 12.4589 24 12.5 24C12.5411 24 12.5813 23.9886 12.6194 23.9711C12.6232 23.9694 12.6274 23.9702 12.6311 23.9683L23.8436 18.2183C23.9396 18.1691 24 18.0703 24 17.9625V6.75C24 6.72022 23.9941 6.69165 23.9854 6.66405C23.9832 6.65721 23.9801 6.65114 23.9775 6.64447ZM12.5 1.60729L23.0698 6.7566L19.7225 8.47318L15.8728 6.52146C15.7897 6.47977 15.6911 6.48019 15.6086 6.52371L12.3852 8.22526C12.29 8.27538 12.231 8.37435 12.2319 8.48188C12.2327 8.58927 12.2936 8.68726 12.3894 8.73597L15.8193 10.4748L12.5 12.177L1.93023 6.7566L12.5 1.60729ZM19.4357 13.7621L19.0123 14.4906L18.2186 14.3892C18.1085 14.3765 18.0029 14.4246 17.9423 14.5159L17.3527 15.4073L16.671 15.328V10.6841L19.4357 9.26634V13.7621ZM16.4515 10.1506L13.1449 8.4743L15.7453 7.10165L19.0902 8.79738L16.4515 10.1506ZM1.575 7.22056L12.2125 12.6756V23.2419L1.575 17.7869V7.22056ZM23.425 17.7869L12.7875 23.2419V12.6756L16.096 10.979V15.5839C16.096 15.598 16.102 15.6101 16.104 15.6236C16.1068 15.643 16.1089 15.6617 16.1154 15.6798C16.1216 15.6973 16.1309 15.7123 16.1404 15.7281C16.1498 15.744 16.1584 15.7594 16.1707 15.7731C16.1831 15.7871 16.1977 15.7977 16.2126 15.809C16.227 15.82 16.2406 15.8309 16.2571 15.839C16.2745 15.8477 16.2931 15.852 16.3122 15.857C16.3253 15.8605 16.3365 15.8678 16.3504 15.8694L17.4619 15.9989C17.4729 16.0003 17.4841 16.0008 17.495 16.0008C17.5908 16.0008 17.6812 15.9529 17.7348 15.8719L18.3233 14.9824L19.1285 15.0853C19.245 15.1 19.3556 15.0444 19.4135 14.9445L19.9716 13.9838C19.9746 13.9786 19.9745 13.9727 19.9772 13.9674C19.986 13.9501 19.9908 13.9316 19.9959 13.9125C20.0009 13.8937 20.006 13.8757 20.0071 13.8567C20.0075 13.8507 20.0107 13.8455 20.0107 13.8394V8.97147L23.425 7.22056V17.7869Z"
        fill="black"
      />
      <path
        d="M8.86377 13.0505L5.36857 11.0312C5.29104 10.9863 5.19835 10.9901 5.124 11.0412C5.04965 11.0925 5.00416 11.1834 5.00391 11.2816L5 13.6979C4.99976 13.804 5.05234 13.9011 5.13623 13.9495L8.63143 15.9689C8.66738 15.9897 8.70651 16 8.74564 16C8.79089 16 8.83614 15.9862 8.876 15.9588C8.95035 15.9076 8.99584 15.8166 8.99609 15.7184L9 13.3021C9.00024 13.196 8.94766 13.0989 8.86377 13.0505ZM8.49593 15.2564L5.50113 13.5263L5.50407 11.7436L8.49887 13.4738L8.49593 15.2564Z"
        fill="black"
      />
    </svg>
  );
};

const bulletPoints = [
  {
    header: 'Initial psychiatric provider evaluation & diagnosis',
    Icon: Review,
  },
  {
    header: '3-month supply of Rx',
    Icon: IntroductoryDose,
  },
  {
    header: 'At-home delivery of your Rx',
    Icon: Delivery,
  },
  {
    header: 'Rx adjustments including messaging with psychiatric care team',
    Icon: Messages,
  },
];

interface MedicationsFeeProps {
  medication: Medication & {
    menopause_meds?: Medication[];
  };
  updateOrder: Dispatch<SetStateAction<Order>>;
  // possibly change back to non-optional
  canRemove?: boolean;
}

const skinCareTreatments = [
  MedicationType.ACNE,
  MedicationType.ANTI_AGING,
  MedicationType.MELASMA,
  MedicationType.ROSACEA,
];

const notRemovableMedication = [...skinCareTreatments];

const MedicationsFee = ({
  medication,
  updateOrder,
  canRemove,
}: MedicationsFeeProps) => {
  const theme = useTheme();
  const { removeMedication } = useVisitActions();
  const [openModal, setOpenModal] = useState(false);
  const specificCare = useIntakeSelect(intake => intake.specificCare);

  const isRemovable = useMemo(() => {
    return !notRemovableMedication.includes(medication.type) && canRemove;
  }, [canRemove, medication.type]);

  const handleRemove = useCallback(() => {
    updateOrder(order => ({
      ...order,
      medications: order.medications.filter(
        m => m.medication_quantity_id !== medication.medication_quantity_id
      ),
    }));
    removeMedication(medication.type);
  }, [
    medication.medication_quantity_id,
    medication.type,
    removeMedication,
    updateOrder,
  ]);

  useEffect(() => {
    updateOrder(order => ({
      ...order,
      medications: order.medications
        .filter(
          m => m.medication_quantity_id !== medication.medication_quantity_id
        )
        .concat({
          discounted: !!medication.discounted_price,
          name: medication.name,
          price: medication.price || medication.discounted_price,
          require_payment_now: false,
          medication_quantity_id: medication.medication_quantity_id,
        } as Order['medications'][number]),
    }));
  }, [medication, updateOrder]);

  if (
    specificCare === SpecificCareOption.MENOPAUSE &&
    medication.menopause_meds &&
    medication.menopause_meds.length > 1
  ) {
    return (
      <WhiteBox padding="16px 24px" gap="2px">
        <Stack direction="row" justifyContent="space-between">
          <Stack>
            <Typography fontWeight={600}>{medication.name}</Typography>
            {medication.menopause_meds.map(m => (
              <Typography key={m.medication_quantity_id} variant="h4">
                {`${m.name} (${m.dosage}) - $${m.price}`}
              </Typography>
            ))}
            <Typography variant="h4">
              You will only be charged if prescribed
            </Typography>
          </Stack>
          <Stack>
            <Price
              price={medication.price || ''}
              discountPrice={medication.discounted_price || ''}
            />
          </Stack>
        </Stack>
        <Divider sx={{ margin: '16px -24px' }} />
        <Typography color={theme.palette.primary.light}>
          Cancel anytime
        </Typography>
        {isRemovable ? (
          <Box>
            <Divider sx={{ margin: '16px -24px 10px -24px' }} />
            <Stack alignItems="end" bgcolor="inherit">
              <Button
                onClick={() => setOpenModal(true)}
                variant="text"
                sx={{
                  padding: '0',
                  textDecoration: 'underline',
                  '&.MuiButton-root': {
                    height: 'inherit',
                  },
                }}
              >
                <Typography>Remove</Typography>
              </Button>
            </Stack>
          </Box>
        ) : null}
        {openModal ? (
          <RemovingModal
            onClose={() => setOpenModal(false)}
            onRemove={handleRemove}
          />
        ) : null}
      </WhiteBox>
    );
  }

  const schedule =
    medication.recurring.interval_count === 0
      ? ''
      : medication.recurring.interval_count > 1
      ? `every ${medication.recurring.interval_count} ${medication.recurring.interval}s`
      : `/${medication.recurring.interval}`;

  let quantity =
    medication.recurring.interval_count === 0
      ? ''
      : medication?.type === MedicationType.PRE_WORKOUT
      ? '30 pills shipped per month'
      : `${medication.recurring.interval_count} ${medication.recurring.interval} supply (${medication.quantity} x ${medication.dosage})`;

  if (
    medication.quantity === 360 &&
    medication.type === MedicationType.BIRTH_CONTROL
  ) {
    quantity = `12 month supply (${medication.quantity} x ${medication.dosage})`;
  }

  let specific_medication = '';

  if (
    medication.display_name &&
    !medication.display_name.includes('Other') &&
    medication.type === MedicationType.BIRTH_CONTROL &&
    !medication.display_name.includes('No preference')
  ) {
    specific_medication = `${medication.display_name} (${medication.name})`;
  }

  const price = `${
    medication.recurring.interval_count === 0
      ? ''
      : medication.price === 1188
      ? '1,188'
      : `${medication.price}`
  }`;

  const preWorkoutTbdQuantityId =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 365 : 323;

  return (
    <WhiteBox padding="16px 24px" gap="2px">
      <Stack direction="row" justifyContent="space-between">
        {skinCareTreatments.includes(medication.type) ? (
          <>
            <Stack>
              <Typography fontWeight={600}>{`${medication.name}`}</Typography>
              {medication.dosage && medication.quantity ? (
                <Typography variant="h4">{`${medication.dosage}, ${medication.quantity} tablets`}</Typography>
              ) : (
                <Typography variant="h4">{`${medication.recurring.interval_count} ${medication.recurring.interval} supply`}</Typography>
              )}
              <Typography variant="h4">{`$${price} ${schedule}`}</Typography>
            </Stack>
            <Stack>
              <Price price={price} />
            </Stack>
          </>
        ) : medication.type === MedicationType.MENTAL_HEALTH ? (
          <>
            <Stack>
              <Typography fontWeight={600}>{medication.name}</Typography>
              <Typography variant="h4">$116 for first 3 months</Typography>
              {price ? (
                <Typography variant="h4">
                  $146 every 3 months thereafter
                </Typography>
              ) : null}
              <Typography variant="h4">Only pay if prescribed</Typography>
              <Typography variant="h4">
                {medication.recurring.interval_count === 0
                  ? null
                  : 'Cancel anytime'}
              </Typography>
            </Stack>
            <Stack>
              <Price
                price={`${medication.price}`}
                discountPrice={medication.discounted_price || ''}
              />
            </Stack>
          </>
        ) : (
          <>
            <Stack>
              <Typography fontWeight={600}>
                {specific_medication || medication.name}
              </Typography>
              {quantity ? (
                <Typography variant="h4">{quantity}</Typography>
              ) : null}
              {price ? (
                <Typography variant="h4">{`$${price}${
                  schedule?.length > 0 && schedule[0] === '/'
                    ? schedule
                    : ` ${schedule}`
                }`}</Typography>
              ) : null}
              <Typography variant="h4">
                {medication.recurring.interval_count === 0 ||
                specificCare === SpecificCareOption.PRE_WORKOUT
                  ? null
                  : 'Cancel anytime'}
              </Typography>
            </Stack>
            <Stack>
              <Price price={`${medication.price}`} />
            </Stack>
          </>
        )}
      </Stack>
      <Divider sx={{ margin: '16px -24px' }} />
      {medication.type === MedicationType.MENTAL_HEALTH ? (
        <Stack gap="16px">
          {bulletPoints.map(({ Icon, header }) => (
            <Stack key={header} direction="row" alignItems="center" gap="16px">
              <Icon />
              <Typography>{header}</Typography>
            </Stack>
          ))}
        </Stack>
      ) : (
        <Typography color={theme.palette.primary.light}>
          {skinCareTreatments.includes(medication.type)
            ? 'No charge until after your prescription request has been approved.'
            : medication?.medication_quantity_id === preWorkoutTbdQuantityId
            ? 'You will only be charged if prescribed and a medical provider will let you know the total price'
            : 'You will only be charged if prescribed'}
        </Typography>
      )}
      {isRemovable ? (
        <Box>
          <Divider sx={{ margin: '16px -24px 10px -24px' }} />
          <Stack alignItems="end" bgcolor="inherit">
            <Button
              onClick={() => setOpenModal(true)}
              variant="text"
              sx={{
                padding: '0',
                textDecoration: 'underline',
                '&.MuiButton-root': {
                  height: 'inherit',
                },
              }}
            >
              <Typography>Remove</Typography>
            </Button>
          </Stack>
        </Box>
      ) : null}
      {openModal ? (
        <RemovingModal
          onClose={() => setOpenModal(false)}
          onRemove={handleRemove}
        />
      ) : null}
    </WhiteBox>
  );
};

export default MedicationsFee;
