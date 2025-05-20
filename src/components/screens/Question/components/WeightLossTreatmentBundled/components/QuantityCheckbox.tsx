import { Box, Checkbox, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import { useCallback } from 'react';
import { CompoundMedication } from '../data';
import { useVWOVariationName } from '@/components/hooks/data';

const toMedication = (type: string, compoundMedication: CompoundMedication) => {
  const result = {
    name: compoundMedication.name,
  };

  if (type === 'year') {
    return {
      ...result,
      title: `40% off on an annual membership of ${compoundMedication.name}`,
      dosage: `${compoundMedication.dosage} included for your first 3 months`,
      body1:
        'We’ll ship your order to you and won’t have to pay an additional membership cost until next year.',
      saving: null,
      discountedPrice:
        compoundMedication.name === 'Semaglutide'
          ? `$179/month for ${compoundMedication.name.toLowerCase()} (12 month supply)`
          : `$359/month for ${compoundMedication.name.toLowerCase()} (12 month supply)`,
      price:
        compoundMedication.name === 'Semaglutide' ? `$297/month` : `$449/month`,
      body2: null,
    };
  }

  if (type === '6month') {
    return {
      ...result,
      title: `30% off on a 6-month membership of ${compoundMedication.name}`,
      dosage: `${compoundMedication.dosage} included for your first 3 months`,
      body1:
        'We’ll ship your order to you and won’t have to pay an additional membership cost until 6 months from now.',
      saving: null,
      discountedPrice:
        compoundMedication.name === 'Semaglutide'
          ? `$209/month for ${compoundMedication.name.toLowerCase()} (6 month supply)`
          : `$359/month for ${compoundMedication.name.toLowerCase()} (6 month supply)`,
      price:
        compoundMedication.name === 'Semaglutide' ? `$297/month` : `$449/month`,
      body2: null,
    };
  }

  if (type === 'bulk') {
    return {
      ...result,
      saving: compoundMedication.saving,
      body1: compoundMedication.body1,
      body2: compoundMedication.body2,
      title: compoundMedication.title,
      dosage: compoundMedication.dosage,
      price: `$${compoundMedication.price}/month`,
      discountedPrice:
        `$${
          compoundMedication?.discountedPrice
        }/month for ${compoundMedication.name.toLowerCase()} (3 month supply)` +
        `${
          compoundMedication.name === 'Semaglutide'
            ? ' + doctor + coaching.'
            : ''
        }`,
    };
  }

  return {
    ...result,
    body1: `Included in what you paid for your first month of membership.
    For most members, your ${compoundMedication.singleDosage.replace(
      'mgs',
      'mg'
    )} vial will last for 1 month.`,
    body2: null,
    title: compoundMedication.singleTitle,
    dosage: compoundMedication.singleDosage,
    saving: null,
    price: null,
    discountedPrice: null,
  };
};

interface QuantityCheckBoxProps {
  checked: string;
  onClick: (s: string) => void;
  type: string;
  medication: CompoundMedication;
}

const QuantityCheckBox = ({
  checked,
  onClick,
  medication,
  type,
}: QuantityCheckBoxProps) => {
  const handleClick = useCallback(() => {
    onClick(type);
  }, [onClick, type]);

  const formattedMedication = toMedication(type, medication);

  return (
    <Stack
      sx={{
        padding: '1.5rem',
        borderRadius: '1rem',
        background: '#ffffff',
        boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
        gap: '1.5rem',
        cursor: 'pointer',
      }}
      onClick={handleClick}
    >
      {formattedMedication.saving ? (
        <Typography
          sx={{
            borderRadius: '0.75rem',
            background: '#F7F9A5',
            display: 'flex',
            width: '17rem',
            height: '3.25rem',
            padding: '1rem 1.25rem',
            justifyContent: 'center',
            alignItems: 'flex-start',
            alignSelf: 'center',
            fontWeight: 600,
          }}
        >{`For a limited time save $${formattedMedication?.saving}`}</Typography>
      ) : null}
      <Stack alignItems="flex-start" gap="1rem" direction="row">
        <Checkbox
          checked={checked === type}
          inputProps={{ 'aria-label': 'controlled' }}
        />
        <Stack justifyContent="space-between">
          <Box>
            <Typography variant="h3" fontWeight="600" mb="0.3rem">
              {formattedMedication?.title}
            </Typography>
            <Typography variant="body1" fontWeight="600" mb="1rem">
              {`${
                formattedMedication?.name
              } ${formattedMedication?.dosage.replace('mgs', 'mg')}`}
            </Typography>
            {formattedMedication?.saving && (
              <Typography
                mt={-1}
                fontStyle={'italic'}
                fontWeight={600}
                mb={1}
              >{`On average, people lose ${
                medication.name === 'Semaglutide' ? '7' : '8'
              }% of their weight in their first three months of ${
                medication?.name
              }**`}</Typography>
            )}
          </Box>

          {formattedMedication?.price &&
          formattedMedication?.discountedPrice ? (
            <Box mb="1rem" fontSize="1rem !important">
              <Typography
                component="span"
                variant="body1"
                fontSize="1rem !important"
                sx={{
                  textDecoration: 'line-through',
                  marginRight: '0.2rem',
                  width: '20px',
                }}
              >
                {formattedMedication.price}
              </Typography>
              {formattedMedication.discountedPrice}
            </Box>
          ) : null}

          {formattedMedication?.body1 ? (
            <Typography variant="body1" mb="1rem" fontSize="0.75rem !important">
              {formattedMedication?.body1}
            </Typography>
          ) : null}
          {formattedMedication?.body2 ? (
            <Typography variant="body1" fontSize="0.75rem !important">
              {formattedMedication?.body2}
            </Typography>
          ) : null}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default QuantityCheckBox;
