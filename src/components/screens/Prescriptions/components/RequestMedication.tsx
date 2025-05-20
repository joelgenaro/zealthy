import { useVisitActions } from '@/components/hooks/useVisit';
import { ED_MAPPING } from '@/constants/ed-mapping';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import { Button } from '@mui/material';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/system';
import { useEffect, useState } from 'react';
import { SubProps } from '../SubscriptionContent';

interface RefillQuantityProps {
  setPage: (page: string) => void;
  subscription: SubProps | null;
}

const RequestMedication = ({ setPage, subscription }: RefillQuantityProps) => {
  const { addMedication } = useVisitActions();
  const [hideButton, setHideButton] = useState(false);
  const changeRefillDate = () => setPage('change-refill');
  const changeDosage = () => setPage('change-dosage');

  useEffect(() => {
    const medicationName =
      subscription?.order_id?.prescription_id?.medication?.split(' ')[0];
    const dosage = subscription?.order_id?.prescription_id?.medication
      ?.split(' ')
      .slice(1, 3)
      .join(' ');

    const medicationKey = Object.keys(ED_MAPPING).find(k => {
      console.log({ k, medicationName });
      return k.toLowerCase().includes(medicationName || '');
    });

    if (!medicationKey || !dosage) {
      setHideButton(true);
      return;
    }

    addMedication({
      type: MedicationType.ED,
      name: medicationKey,
      dosage: dosage,
      medication_quantity_id: null,
      recurring: {
        interval: 'month',
        interval_count: 3,
      },
    });
  }, [
    addMedication,
    subscription?.interval,
    subscription?.interval_count,
    subscription?.order_id?.prescription_id?.medication,
  ]);

  return (
    <Container maxWidth="sm">
      <Stack gap="24px">
        <Typography variant="h2" textAlign="center">
          Would you like to order the same quantity of medication as last time?
        </Typography>

        <Stack gap="24px">
          <Typography textAlign="center">
            You can request the same quantity and dosage as your previous order
            or request a different quantity and dosage of medication.
          </Typography>
          <Typography textAlign="center">
            Prices will vary for different quantities and dosages.
          </Typography>
        </Stack>
        <Stack gap="24px">
          <Button onClick={changeRefillDate}>
            Yes, I would like the same quantity
          </Button>
          {hideButton ? null : (
            <Button variant="outlined" onClick={changeDosage}>
              Change number of uses or dosage
            </Button>
          )}
        </Stack>
      </Stack>
    </Container>
  );
};

export default RequestMedication;
