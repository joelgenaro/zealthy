import { List, ListItemButton, Typography, styled } from '@mui/material';
import { FormEvent, useCallback, useState } from 'react';
import CheckMark from '@/components/shared/icons/CheckMark';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { useVisitActions, useVisitState } from '@/components/hooks/useVisit';
import { ReasonForVisit } from '@/context/AppContext/reducers/types/visit';
import { useCreateOnlineVisitAndNavigate } from '@/components/hooks/useCreateOnlineVisitAndNavigate';
import { usePatient } from '@/components/hooks/data';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { useRequestedQuestionnaires } from '@/components/hooks/useRequestedQuestionnaires';
import { useVWO } from '@/context/VWOContext';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import { Box } from '@mui/system';
import StyledChip from '@/components/shared/Chip/StyledChip';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const StyledForm = styled('form')`
  width: 100%;
`;

interface VisitOptionsProps {
  selections: ReasonForVisit[];
}

const VisitsSelectionForm = ({ selections }: VisitOptionsProps) => {
  const { addCare } = useVisitActions();
  const { addSpecificCare, addVariant } = useIntakeActions();
  const { variant } = useIntakeState();
  const { data: patient } = usePatient();
  const requestedQuestionnaires = useRequestedQuestionnaires();
  const createVisitAndNavigateAway = useCreateOnlineVisitAndNavigate(
    patient?.id
  );
  const [loading, setLoading] = useState(false);
  const vwo = useVWO();

  // The new variant and control have a different order for lists
  if (variant && (variant === '5267v' || variant === '5267c')) {
    let order = [
      'Weight loss',
      'Birth control',
      'Erectile dysfunction',
      'Anxiety or depression',
      'Skincare',
      'Enclomiphene',
      'Pre-workout',
      'Preworkout',
      'Hair loss',
      'I’m not sure',
      'Other',
    ];

    selections = selections.filter(selection =>
      order.includes(selection.reason)
    );

    selections.sort((a, b) => {
      return order.indexOf(a.reason) - order.indexOf(b.reason);
    });
  }
  // For the 5267v and 5267c, we need to show the most popular selection
  const [viewMore, setViewMore] = useState(false);
  const displayedSelections = viewMore ? selections : selections.slice(0, 5);

  const {
    selectedCare: { careSelections },
  } = useVisitState();
  const [error, setError] = useState('');

  const selectItem = useCallback(
    (item: ReasonForVisit) => {
      setError('');

      addCare({
        care: {
          careSelections: [item],
          other: '',
        },
      });
    },
    [addCare]
  );

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!careSelections.length) {
        setError('Please select at least one');
        return;
      }

      let specificCare = careSelections[0].reason;

      if (
        patient?.region === 'SC' &&
        specificCare === SpecificCareOption.ERECTILE_DYSFUNCTION
      ) {
        Router.push(Pathnames.ONBOARDING_ED_UNSUPPORTED_REGION);
        return;
      }

      if (variant && (variant === '5267v' || variant === '5267c')) {
        if (specificCare === SpecificCareOption.ANXIETY_OR_DEPRESSION) {
          if (['FL', 'CA', 'PA'].includes(patient?.region!)) {
            specificCare = SpecificCareOption.ASYNC_MENTAL_HEALTH;
          }

          if (
            [
              'IL',
              'LA',
              'MN',
              'MO',
              'NC',
              'SC',
              'TX',
              'WI',
              'AL',
              'AZ',
              'CO',
              'CT',
              'GA',
              'NJ',
              'NV',
              'OH',
              'OR',
              'VA',
              'WA',
              'TN',
            ].includes(patient?.region!)
          ) {
            specificCare = SpecificCareOption.ANXIETY_OR_DEPRESSION;
          }
        }
      }

      addSpecificCare(specificCare as SpecificCareOption);
      if (!!patient?.profiles?.signup_variant) {
        addVariant(patient.profiles.signup_variant);
      }

      window?.freshpaint?.identify(patient?.profiles?.email, {
        care_selection: specificCare || 'None',
        care_type: specificCare || 'None',
      });

      setLoading(true);

      //create online visit and attach care selection
      if (
        variant &&
        (variant === '5267v' || variant === '5267c') &&
        (specificCare === SpecificCareOption.ANXIETY_OR_DEPRESSION ||
          specificCare === SpecificCareOption.ASYNC_MENTAL_HEALTH)
      ) {
        await createVisitAndNavigateAway([specificCare], {});
      } else {
        await createVisitAndNavigateAway(
          careSelections.map(c => c.reason) as SpecificCareOption[],
          { requestedQuestionnaires }
        );
      }
    },
    [
      careSelections,
      patient?.region,
      addSpecificCare,
      createVisitAndNavigateAway,
      requestedQuestionnaires,
    ]
  );

  if (variant && (variant === '5267v' || variant === '5267c')) {
    return (
      <StyledForm onSubmit={onSubmit}>
        <List
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginBottom: '20px',
            marginTop: '-30px',
            padding: '0',
          }}
        >
          {displayedSelections.map(selection => {
            const isSelected = !!careSelections.find(
              c => c.id === selection.id
            );

            return (
              <Box position="relative" key={selection.reason}>
                {selection.reason === 'Weight loss' ? (
                  <StyledChip
                    label="Most Popular"
                    variant="filled"
                    inBox={true}
                  />
                ) : null}
                <ListItemButton
                  selected={isSelected}
                  onClick={() => selectItem(selection)}
                >
                  <div>
                    <Typography
                      sx={{
                        fontWeight: 500,
                      }}
                    >
                      {selection.reason}
                    </Typography>
                    {selection.reason === 'Weight loss' && (
                      <Typography variant={'h4'}>
                        On average, members lose 15-20% of their body weight*
                      </Typography>
                    )}
                  </div>
                  {isSelected ? (
                    <CheckMark style={{ marginLeft: 'auto' }} />
                  ) : null}
                </ListItemButton>
              </Box>
            );
          })}
          {!viewMore && selections.length > 5 && (
            <ListItemButton
              onClick={() => setViewMore(true)}
              sx={{
                display: 'flex',
                width: 227,
                height: 38,
                padding: '20px 32px',
                justifyContent: 'center',
                borderRadius: '12px',
                border: '1px solid #EBEBEB',
                backgroundColor: '#EBEBEB',
                margin: '0 auto',
                fontWeight: 'bold',
              }}
            >
              View more <KeyboardArrowDownIcon />
            </ListItemButton>
          )}
        </List>
        {error ? (
          <Typography color="red" textAlign="center">
            {error}
          </Typography>
        ) : null}
        <LoadingButton
          loading={loading}
          type="submit"
          disabled={!careSelections.length || loading}
          sx={{ width: '100%' }}
        >
          Continue to get care
        </LoadingButton>
        <Typography
          sx={{
            fontSize: '10px',
            lineHeight: '18px',
            letterSpacing: '0.004em',
            color: '#1B1B1B',
            marginTop: '16px',
            textAlign: 'center',
            fontWeight: 300,
            fontStyle: 'italic',
          }}
        >
          *This estimate derives from Eli Lilly’s SURMOUNT-4 clinical trial
          results which showed 20% average weight loss over 36 weeks among
          people utilized a maximum tolerated dose of 10 mg or 15 mg
          once-weekly. The starting dose of 2.5 mg Zepbound was increased by 2.5
          mg every four weeks until maximum tolerated dose was achieved.
          Treatment was given in addition to diet and exercise.
        </Typography>
      </StyledForm>
    );
  }

  return (
    <StyledForm onSubmit={onSubmit}>
      <List
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '48px',
          padding: '0',
        }}
      >
        {selections.map(selection => {
          const isSelected = !!careSelections.find(c => c.id === selection.id);

          return (
            <ListItemButton
              key={selection.reason}
              selected={isSelected}
              onClick={() => selectItem(selection)}
            >
              {selection.reason}
              {isSelected ? <CheckMark style={{ marginLeft: 'auto' }} /> : null}
            </ListItemButton>
          );
        })}
      </List>
      {error ? (
        <Typography color="red" textAlign="center">
          {error}
        </Typography>
      ) : null}
      <LoadingButton
        loading={loading}
        type="submit"
        disabled={!careSelections.length || loading}
        sx={{ width: '100%' }}
      >
        Continue to get care
      </LoadingButton>
    </StyledForm>
  );
};

export default VisitsSelectionForm;
