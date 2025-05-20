import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import PlaceIcon from '@mui/icons-material/Place';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { DosespotPharmacy as DosespotPharmacyType } from '@/pages/api/dosespot/_utils/pharmacySearch';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import Stack from '@mui/material/Stack';
import Loading from '../Loading/Loading';
import List from '@mui/material/List';
import DosespotPharmacy from './components/DosespotPharmacy';
import ErrorMessage from '../ErrorMessage';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useLanguage } from '@/components/hooks/data';

const formattedAddress = (pharmacy: DosespotPharmacyType) => {
  return [
    pharmacy.Address1,
    pharmacy.Address2,
    pharmacy.City,
    pharmacy.State,
    pharmacy.ZipCode,
  ]
    .filter(Boolean)
    .join(', ');
};

interface PharmacySelectionProps {
  onSuccess: () => void;
  patientId: number;
}

type Coordinates = {
  lat: number | null;
  long: number | null;
};

type PharmacyOptions = {
  coordinates?: Coordinates;
  zipCode?: string;
};

const PharmacySearchForm = ({
  patientId,
  onSuccess,
}: PharmacySelectionProps) => {
  const supabase = useSupabaseClient<Database>();
  const [zipCode, setZipCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(3);
  const [pharmacies, setPharmacies] = useState<DosespotPharmacyType[]>([]);
  const language = useLanguage();
  const [coordinates, setCoordinates] = useState<Coordinates>({
    lat: null,
    long: null,
  });

  const searchParams = useSearchParams();
  const isActionItem = searchParams?.get('act') === 'true';

  const handleZipCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 5) return;

    if (e.target.value.length === 5) {
      fetchPharmacies({ zipCode: e.target.value });
    }

    setZipCode(e.target.value);
  };

  const fetchPharmacies = useCallback(async (options: PharmacyOptions) => {
    setIsLoading(true);
    const { data } = await axios.post('/api/get-nearby-pharmacies-v2', options);

    setZipCode(data.zip);
    setIsLoading(false);
    setPharmacies(data.pharmacies);
    setDisplayLimit(3);
  }, []);

  useEffect(() => {
    if (coordinates.lat && coordinates.long) {
      fetchPharmacies({ coordinates });
    }
  }, [coordinates, fetchPharmacies]);

  const handleClick = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, long: longitude });
        },
        error => {
          setError(error.message);
          setIsLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const onPharmacySelect = async (pharmacy: DosespotPharmacyType) => {
    await supabase.from('patient_pharmacy').upsert({
      patient_id: patientId,
      pharmacy: formattedAddress(pharmacy),
      name: pharmacy?.StoreName,
      dosespot_pharmacy_id: pharmacy.PharmacyId,
    });

    if (isActionItem)
      toast.success('You have successfully added your preferred pharmacy!');

    onSuccess();
  };

  const onContinue = () => {
    onSuccess();
  };

  let currentLocText = 'Use current location';
  let enterZip = 'Enter a ZIP Code';
  let skipButtonText = 'Skip this step';
  let dividerOr = 'or';
  let viewMore = 'View More';
  if (language === 'esp') {
    currentLocText = 'Usa to ubicación actual';
    enterZip = 'Ingrese un código postal';
    skipButtonText = 'Saltar este paso';
    dividerOr = 'o';
    viewMore = 'Ver Mas';
  }

  return (
    <Grid container gap="36px" width="100%">
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={5}>
          <TextField
            fullWidth
            label={enterZip}
            type="numeric"
            value={zipCode}
            autoComplete="postal-code"
            onChange={handleZipCodeChange}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Divider>{dividerOr}</Divider>
        </Grid>
        <Grid item xs={12} sm={5}>
          <Button
            fullWidth
            onClick={handleClick}
            startIcon={<PlaceIcon />}
            sx={{ lineHeight: '15px', fontSize: '13px' }}
          >
            {currentLocText}
          </Button>
        </Grid>
      </Grid>

      <Stack width="100%" alignItems="center">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <List
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                padding: '0',
              }}
            >
              {pharmacies.slice(0, displayLimit).map((pharmacy, index) => (
                <DosespotPharmacy
                  pharmacy={pharmacy}
                  key={pharmacy.PharmacyId}
                  onSelect={onPharmacySelect}
                />
              ))}
            </List>
            {pharmacies.length > displayLimit && (
              <Button
                onClick={() => setDisplayLimit(prev => prev + 3)}
                variant="text"
                fullWidth={false}
                style={{
                  textDecoration: 'underline',
                  width: 'fit-content',
                  margin: '0 auto',
                }}
              >
                {viewMore}
              </Button>
            )}
          </>
        )}
      </Stack>
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
      <Grid container direction="column" gap="16px">
        {!isActionItem && (
          <Button fullWidth color="grey" onClick={onContinue}>
            {skipButtonText}
          </Button>
        )}
      </Grid>
    </Grid>
  );
};

export default PharmacySearchForm;
