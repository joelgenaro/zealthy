import Loading from '@/components/shared/Loading/Loading';
import { usePostCheckoutNavigation } from '@/context/NavigationContext/NavigationContext';
import { PharmacyInfo } from '@/types/pharmacy';
import {
  Button,
  Divider,
  Grid,
  List,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import Router from 'next/router';
import { ChangeEvent, useEffect, useState } from 'react';
import PharmacyListItem from './components/PharmacyListItem';
import PlaceIcon from '@mui/icons-material/Place';
import { Pathnames } from '@/types/pathnames';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { toast } from 'react-hot-toast';
import { useLanguage, usePatient } from '@/components/hooks/data';

const PharmacySelection = () => {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const [zipCode, setZipCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(3);
  const [pharmacies, setPharmacies] = useState<PharmacyInfo[]>([]);
  const language = useLanguage();
  const [coordinates, setCoordinates] = useState<{
    lat: number | null;
    long: number | null;
  }>({ lat: null, long: null });
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyInfo | null>(
    null
  );

  const { next } = usePostCheckoutNavigation();

  const handleZipCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 5) return;
    setCoordinates({ lat: null, long: null });
    setZipCode(e.target.value);
  };

  useEffect(() => {
    const fetchPharmaciesByCoords = async () => {
      setIsLoading(true);
      const { data } = await axios.post('/api/get-nearby-pharmacies', {
        coordinates,
      });

      const pharmacyList: PharmacyInfo[] = data.locations.map(
        (pharmacy: any) => ({
          name: pharmacy.name,
          formattedAddress: pharmacy.formatted_address,
          id: pharmacy.place_id,
        })
      );

      setZipCode(data.zip);
      setIsLoading(false);
      setPharmacies(pharmacyList);
      setDisplayLimit(3);
    };

    const fetchPharmaciesByZip = async () => {
      setIsLoading(true);
      const { data } = await axios.post('/api/get-nearby-pharmacies', {
        zipCode: zipCode,
      });

      const pharmacyList: PharmacyInfo[] = data.locations.map(
        (pharmacy: any) => ({
          name: pharmacy.name,
          formattedAddress: pharmacy.formatted_address,
          id: pharmacy.place_id,
        })
      );

      setIsLoading(false);
      setPharmacies(pharmacyList);
      setDisplayLimit(3);
    };

    if (coordinates.lat && coordinates.long) fetchPharmaciesByCoords();
    else if (zipCode.length > 4) fetchPharmaciesByZip();
  }, [zipCode, coordinates]);

  const handleClick = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, long: longitude });
        },
        error => {
          console.error('pharm_select_handleClick_err', error);
        }
      );
    } else {
      console.warn('Geolocation is not supported by this browser.');
    }
  };

  const onSubmit = async () => {
    setIsSubmitting(true);

    if (patient!.id && selectedPharmacy) {
      toast.success('Preferred pharmacy updated');
      await supabase.from('patient_pharmacy').upsert({
        patient_id: patient!.id,
        pharmacy: selectedPharmacy?.formattedAddress,
        name: selectedPharmacy?.name,
      });
    }
    setIsSubmitting(false);
    Router.push(next || Pathnames.POST_CHECKOUT_VISIT_CONFIRMATION);
  };

  const onContinue = () => {
    Router.push(next || Pathnames.POST_CHECKOUT_VISIT_CONFIRMATION);
  };

  let viewMoreText = 'View More ';
  let selectPharm = 'Select pharmacy';
  if (language === 'esp') {
    viewMoreText = 'Ver Mas';
    selectPharm = 'Escojer farmacia';
  }

  return (
    <Grid container direction="column" gap="48px">
      <Stack direction="column" gap="16px">
        <Typography variant="h2">Choose a pharmacy.</Typography>
        <Typography>
          After you complete your visit, your Zealthy provider may prescribe
          medication, if appropriate.
        </Typography>
        <Typography>
          Please share the most convenient place to pick up or receive your
          medication, in case delivery isn’t an option for you.
        </Typography>
      </Stack>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={5}>
          <TextField
            fullWidth
            label="Enter ZIP Code"
            type="numeric"
            value={zipCode}
            autoComplete="postal-code"
            onChange={handleZipCodeChange}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Divider>or</Divider>
        </Grid>
        <Grid item xs={12} sm={5}>
          <Button fullWidth onClick={handleClick} startIcon={<PlaceIcon />}>
            Use current location
          </Button>
        </Grid>
      </Grid>

      {isLoading && <Loading />}
      {pharmacies.length > 0 && (
        <>
          <List
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '0',
            }}
          >
            {pharmacies.slice(0, displayLimit).map((pharmacy, index) => (
              <PharmacyListItem
                onSelect={setSelectedPharmacy}
                key={`pharmacy` + index}
                pharmacy={pharmacy}
                selected={pharmacy.id === selectedPharmacy?.id}
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
              {viewMoreText}
            </Button>
          )}
        </>
      )}

      <Grid container direction="column" gap="16px">
        {pharmacies.length > 0 && (
          <LoadingButton
            loading={isSubmitting}
            onClick={onSubmit}
            disabled={!selectedPharmacy}
          >
            {selectPharm}
          </LoadingButton>
        )}

        <Button color="grey" onClick={onContinue}>
          Skip this step
        </Button>
      </Grid>
    </Grid>
  );
};

export default PharmacySelection;
