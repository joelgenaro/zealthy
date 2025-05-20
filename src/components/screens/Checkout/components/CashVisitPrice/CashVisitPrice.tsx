import { useAppointmentActions } from '@/components/hooks/useAppointment';
import { useIntakeSelect } from '@/components/hooks/useIntake';
import { useVisitActions } from '@/components/hooks/useVisit';
import { Order } from '@/components/screens/Checkout/types';
import Loading from '@/components/shared/Loading/Loading';
import { AppointmentState } from '@/context/AppContext/reducers/types/appointment';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { Database } from '@/lib/database.types';
import { lessThan24hours } from '@/utils/date-fns';
import {
  Box,
  Button,
  Divider,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Fee from '../OrderSummary/components/Fee';
import RemovingModal from '@/components/shared/RemovingModal';
import { usePatient } from '@/components/hooks/data';

interface CashVisitPriceProps {
  visit: AppointmentState;
  updateOrder: Dispatch<SetStateAction<Order>>;
  canRemove: boolean;
}

const CashVisitPrice = ({
  visit,
  updateOrder,
  canRemove,
}: CashVisitPriceProps) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const specificCare = useIntakeSelect(intake => intake.specificCare);
  const potentialInsurance = useIntakeSelect(
    intake => intake.potentialInsurance
  );
  const { data: patient } = usePatient();
  const supabase = useSupabaseClient<Database>();
  const { removeAppointment } = useAppointmentActions();
  const { addAsync } = useVisitActions();

  const discountedPrice =
    specificCare === SpecificCareOption.ANXIETY_OR_DEPRESSION ? 29 : undefined;

  const title: { [key: string]: string } = {
    'Anxiety or depression': 'Zealthy Mental Health Provider Visit',
    'Primary care': 'Zealthy Provider Visit',
    'Virtual Urgent Care': 'Zealthy Urgent Care Visit',
  };

  const paymentIsRequired = useMemo(
    () =>
      visit.encounter_type === 'Walked-in' ||
      (lessThan24hours(visit.starts_at!) &&
        !(
          ['Medicare Access Florida', 'Medicaid Access Florida'].includes(
            potentialInsurance || ''
          ) && patient?.region === 'FL'
        )),
    [visit.encounter_type, visit.starts_at]
  );

  const handleRemove = useCallback(() => {
    updateOrder(order => ({
      ...order,
      visit: null,
    }));

    removeAppointment(visit.appointment_type);
    addAsync(false);
  }, [addAsync, removeAppointment, updateOrder, visit.appointment_type]);

  useEffect(() => {
    const fetchPrice = async () => {
      const { data } = await supabase
        .from('encounter_duration')
        .select('price')
        .eq('duration', visit.duration)
        .single();
      setLoading(false);
      if (data) {
        let price = data.price;
        if (
          potentialInsurance === PotentialInsuranceOption.BLUE_CROSS_ILLINOIS
        ) {
          price = 99;
        }
        setPrice(price);
        updateOrder(order => ({
          ...order,
          visit: {
            id: visit.id,
            require_payment_now: paymentIsRequired,
            price: discountedPrice || price,
          },
        }));
      }
    };

    fetchPrice();
  }, [
    discountedPrice,
    paymentIsRequired,
    supabase,
    updateOrder,
    visit.duration,
    visit.id,
  ]);

  const isInsurance = useMemo(() => {
    return (
      ['Medicare Access Florida', 'Medicaid Access Florida'].includes(
        potentialInsurance || ''
      ) && patient?.region === 'FL'
    );
  }, [patient?.region, potentialInsurance]);

  if (loading) {
    return <Loading size="16px" />;
  }

  return (
    <Stack>
      <Fee
        name={title[specificCare!] || 'Provider Visit Fee'}
        price={`${price}`}
        discountPrice={discountedPrice ? `${discountedPrice}` : undefined}
        medicareFL={isInsurance}
      />
      {visit.encounter_type !== 'Walked-in' && (
        <>
          <Divider
            sx={{
              margin: '16px -24px',
            }}
          />

          <Typography color={theme.palette.primary.light} variant="caption">
            {potentialInsurance === 'Medicare Access Florida' &&
            patient?.region === 'FL'
              ? 'You may be charged a small co-pay for your visit, which will be covered by your Medicare plan.'
              : 'No charge until after your visit with a Zealthy provider.'}
          </Typography>
        </>
      )}
      {canRemove &&
      !['Medicare Access Florida', 'Medicaid Access Florida'].includes(
        potentialInsurance || ''
      ) &&
      potentialInsurance !== 'Weight Loss Sync' ? (
        <Box>
          <Divider
            sx={{
              margin: '16px -24px 10px -24px',
            }}
          />
          <Stack
            alignItems="end"
            bgcolor="inherit"
            sx={{
              borderBottomRightRadius: '0.75rem',
              borderBottomLeftRadius: '0.75rem',
            }}
          >
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
    </Stack>
  );
};

export default CashVisitPrice;
