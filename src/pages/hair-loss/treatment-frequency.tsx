import Head from 'next/head';
import { ReactElement, useCallback, useMemo } from 'react';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useVisitActions, useVisitSelect } from '@/components/hooks/useVisit';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import CheckMark from '@/components/shared/icons/CheckMark';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { notEmpty } from '@/types/utils/notEmpty';
import {
  hairLossMedication,
  hairLossMedication6month,
} from '@/constants/hairLossMedicationMapping';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

const hairLossMedicationMapping = (type: number, key: string) => {
  if (type === 6) {
    return hairLossMedication6month[key];
  } else {
    return hairLossMedication[key];
  }
};

type Option = {
  name: string;
  isBeginner: boolean;
  bestDeal?: string;
  over6months?: number;
  price: number;
  discountedPrice: number;
  recurring: {
    interval: string;
    interval_count: number;
  };
};

const items: { [key: string]: Option[] } = {
  'Oral Minoxidil and Oral Finasteride': [
    {
      name: 'Oral Minoxidil and Oral Finasteride',
      isBeginner: true,
      price: 170,
      discountedPrice: 113.33,
      over6months: 283.33,
      recurring: {
        interval: 'month',
        interval_count: 3,
      },
    },
    {
      name: 'Oral Minoxidil and Oral Finasteride',
      isBeginner: false,
      bestDeal: 'Save an additional 19%',
      price: 283.33,
      discountedPrice: 255,
      recurring: {
        interval: 'month',
        interval_count: 6,
      },
    },
  ],
  'Oral Finasteride and Minoxidil Foam': [
    {
      name: 'Oral Finasteride and Minoxidil Foam',
      isBeginner: true,
      over6months: 216.66,
      price: 130,
      discountedPrice: 86.66,
      recurring: {
        interval: 'month',
        interval_count: 3,
      },
    },
    {
      name: 'Oral Finasteride and Minoxidil Foam',
      isBeginner: false,
      bestDeal: 'Save 12%',
      price: 216.66,
      discountedPrice: 193.8,
      recurring: {
        interval: 'month',
        interval_count: 6,
      },
    },
  ],
  'Oral Finasteride': [
    {
      name: 'Oral Finasteride',
      isBeginner: true,
      over6months: 138.33,
      price: 80,
      discountedPrice: 53.33,
      recurring: {
        interval: 'month',
        interval_count: 3,
      },
    },
    {
      name: 'Oral Finasteride',
      isBeginner: false,
      bestDeal: 'Save 11%',
      price: 138.33,
      discountedPrice: 123,
      recurring: {
        interval: 'month',
        interval_count: 6,
      },
    },
  ],
  'Oral Minoxidil': [
    {
      name: 'Oral Minoxidil',
      isBeginner: true,
      over6months: 150,
      price: 90,
      discountedPrice: 60,
      recurring: {
        interval: 'month',
        interval_count: 3,
      },
    },
    {
      name: 'Oral Minoxidil',
      isBeginner: false,
      bestDeal: 'Save 12%',
      price: 150,
      discountedPrice: 132,
      recurring: {
        interval: 'month',
        interval_count: 6,
      },
    },
  ],
  'Minoxidil Foam': [
    {
      name: 'Minoxidil Foam',
      isBeginner: true,
      over6months: 83.33,
      price: 50,
      discountedPrice: 33.33,
      recurring: {
        interval: 'month',
        interval_count: 3,
      },
    },
    {
      name: 'Minoxidil Foam',
      isBeginner: false,
      bestDeal: 'Save 19%',
      price: 83.33,
      discountedPrice: 70.8,
      recurring: {
        interval: 'month',
        interval_count: 6,
      },
    },
  ],
};

const HairLossTreatmentFrequency = () => {
  const isMobile = useIsMobile();
  const { updateMedication } = useVisitActions();
  const medication = useVisitSelect(v =>
    v.medications.find(m => m.type === MedicationType.HAIR_LOSS)
  );

  const medicationAddOn = useVisitSelect(v =>
    v.medications.find(m => m.type === MedicationType.HAIR_LOSS_ADD_ON)
  );

  const { options } = useMemo(() => {
    const name = [medication, medicationAddOn]
      .filter(Boolean)
      .map(m => m?.name)
      .join(' and ');

    console.log({ name });
    return {
      options: items[name],
    };
  }, [medication, medicationAddOn]);

  const handleChange = useCallback(
    (item: Option) => {
      if (medication) {
        const { type, ...medicationMain } = hairLossMedicationMapping(
          item.recurring.interval_count,
          medication.name
        );

        updateMedication({
          type: MedicationType.HAIR_LOSS,
          update: medicationMain,
        });
      }

      if (medicationAddOn) {
        const { type, ...medication } = hairLossMedicationMapping(
          item.recurring.interval_count,
          medicationAddOn.name
        );

        updateMedication({
          type: MedicationType.HAIR_LOSS_ADD_ON,
          update: medication,
        });
      }
    },
    [medication, medicationAddOn, updateMedication]
  );

  const onContinue = useCallback(() => {
    Router.push(Pathnames.HAIR_LOSS_REGION);
  }, []);

  return (
    <>
      <Head>
        <title>Hair Loss with Zealthy | Frequency </title>
      </Head>

      <Container maxWidth="sm">
        <Stack gap={isMobile ? 4 : 6}>
          <Typography variant="h2">
            See better results in as short as 4-6 months
          </Typography>

          <Stack>
            <List component={Stack} gap="24px" width="100%">
              {options.map(item => {
                const isSelected = [
                  medication?.recurring.interval_count,
                  medicationAddOn?.recurring.interval_count,
                ]
                  .filter(notEmpty)
                  .includes(item.recurring.interval_count);

                return (
                  <ListItemButton
                    selected={isSelected}
                    key={item.recurring.interval_count}
                    onClick={() => handleChange(item)}
                    sx={{
                      width: '100%',
                      position: 'relative',
                      borderRadius: '24px',
                    }}
                  >
                    <Stack direction="row" alignItems="center" gap="16px">
                      <Typography></Typography>
                      <Stack direction="column" gap="5px">
                        <Typography
                          fontWeight="300"
                          sx={{
                            fontSize: '13px !important',
                          }}
                        >
                          {item.isBeginner
                            ? 'BEGINNERS PACK'
                            : 'BEST RESULTS PACK'}
                        </Typography>
                        <Typography
                          fontWeight={600}
                        >{`Ships every ${item.recurring.interval_count} months`}</Typography>
                        <Stack direction="row" alignItems="center" gap="8px">
                          <Typography>
                            ${item.discountedPrice.toFixed(2)}
                          </Typography>
                          {item.isBeginner ? (
                            <Typography variant="h4">{`$${item.over6months} over 6 months`}</Typography>
                          ) : null}
                        </Stack>
                      </Stack>
                    </Stack>
                    {isSelected && (
                      <CheckMark
                        style={{
                          position: 'absolute',
                          right: 18,
                          top: '50%',
                          transform: 'translateY(-50%)',
                        }}
                      />
                    )}
                    {!item.isBeginner ? (
                      <Box
                        position="absolute"
                        sx={{
                          top: '-13px',
                          right: 0,
                          padding: '0 24px',
                          borderRadius: '12px',
                          color: '#005315',
                          background: '#B8F5CC',
                          textAlign: 'center',
                          border: '1px solid #005315',
                        }}
                      >
                        {item.bestDeal}
                      </Box>
                    ) : null}
                  </ListItemButton>
                );
              })}
            </List>
          </Stack>

          <Button fullWidth onClick={onContinue}>
            Continue
          </Button>

          <Stack direction="column" alignItems="center" gap="10px">
            <Typography sx={{ fontSize: '14px !important' }}>
              Price refers to generic treatments.
            </Typography>
            <Typography
              textAlign="center"
              fontWeight="300"
              sx={{ fontSize: '13px !important' }}
            >
              If your Zealthy provider determines that branded pills are better,
              price may vary.
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </>
  );
};

HairLossTreatmentFrequency.getLayout = (page: ReactElement) => {
  return <OnboardingLayout>{page}</OnboardingLayout>;
};

export default HairLossTreatmentFrequency;
