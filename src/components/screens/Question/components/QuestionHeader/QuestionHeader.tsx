import { useProfileSelect } from '@/components/hooks/useProfile';
import { useSelector } from '@/components/hooks/useSelector';
import { useVisitSelect } from '@/components/hooks/useVisit';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import { Question, QuestionWithName } from '@/types/questionnaire';
import { replaceAll } from '@/utils/replaceAll';
import { List, ListItem, Stack, Typography, Box } from '@mui/material';
import { useMemo } from 'react';
import jsonLogic from 'json-logic-js';
import BMIDisqualify from './components/description/BMIDisqualify';
import MentalHealthDescription from './components/description/MentalHealthDescription';
import { useEarliestAppointment } from '@/components/hooks/useEarliestAppointment';
import WeightLossDescription from './components/description/WeightLossDescription';
import WeightLossTerms from './components/description/WeightLossTerms';
import { usePatientSelect } from '@/components/hooks/usePatient';
import { useIntakeState } from '@/components/hooks/useIntake';
import {
  useLanguage,
  usePatientPrescriptions,
  useVWOVariationName,
} from '@/components/hooks/data';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import CheckIcon from '@mui/icons-material/Check';
import InfoIcon from '@mui/icons-material/Info';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';
import { useSearchParams, usePathname } from 'next/navigation';

interface CheckListProps {
  checkItems: string[];
  question: Question;
}

const CheckList = ({ checkItems, question }: CheckListProps) => {
  return (
    <Stack
      direction="column"
      gap="8px"
      style={{ ...(question.styles?.listItems || {}) }}
    >
      {checkItems.map((item, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckIcon sx={{ fontSize: '20px', color: 'black' }} />
          <Typography>{item}</Typography>
        </Box>
      ))}
    </Stack>
  );
};

interface QuestionHeaderProps {
  question: QuestionWithName;
}

const HeaderListItems = ({
  listItems,
  question,
}: {
  listItems: string[];
  question: Question;
}) => {
  const { earliestAppointment, ellipsis } = useEarliestAppointment();
  const heart_rate = usePatientSelect(p => p.heart_rate);
  const language = useLanguage();

  return (
    <Stack
      direction="column"
      gap="8px"
      style={{ ...(question.styles?.listItems || {}) }}
    >
      {listItems.map(item => (
        <Typography variant="body1" key={item}>
          {replaceAll(
            item,
            ['[Appointment]', '[123]'],
            [
              earliestAppointment || `finding now${ellipsis}`,
              String(heart_rate),
            ]
          )}
        </Typography>
      ))}
    </Stack>
  );
};

interface UnorderedListProps {
  listItems: string[];
}

const UnorderedList = ({ listItems }: UnorderedListProps) => {
  const language = useLanguage();

  const getTranslation = (obj: string | { [key: string]: any }): string => {
    if (typeof obj === 'string') return obj;
    return obj[language] || obj['en'] || Object.values(obj)[0] || '';
  };

  return (
    <List
      sx={{
        pl: '20px',
        listStyleType: 'disc',
        '& .MuiListItem-root': {
          display: 'list-item',
          px: 0,
          padding: 0,
        },
      }}
    >
      {listItems.map(item => (
        <ListItem key={getTranslation(item)}>
          <Typography>{getTranslation(item)}</Typography>
        </ListItem>
      ))}
    </List>
  );
};

const QuestionHeader = ({ question }: QuestionHeaderProps) => {
  const searchParams = useSearchParams();
  const compare = searchParams?.get('compare');
  const { specificCare, potentialInsurance } = useIntakeState();
  const first_name = useProfileSelect(profile => profile.first_name);
  const { data: variant5777 } = useVWOVariationName('5777');
  const { data: variant5871 } = useVWOVariationName('5871_new');
  const { data: variation4798 } = useVWOVariationName('4798');
  const medicationName = useVisitSelect(
    visit => visit.medications.find(m => m?.type === MedicationType.ED)?.name
  );
  const visit = useSelector(store => store.visit);
  const { variant } = useIntakeState();
  const language = useLanguage();
  const { data: patientPrescriptions, isLoading: prescriptionsLoading } =
    usePatientPrescriptions();

  const mostRecentCompoundPrescription = patientPrescriptions
    ?.sort((presc1, presc2) => {
      return presc1.created_at! > presc2.created_at! ? -1 : 1;
    })
    .filter(presc => presc.matrix_id)[0];

  const getTranslation = useMemo(() => {
    return (obj: string | { [key: string]: any }): string => {
      if (typeof obj === 'string') {
        return replaceAll(
          obj,
          ['[First Name]', '[medication name]'],
          [first_name!, medicationName!]
        );
      }
      const translatedString =
        obj[language] || obj['en'] || Object.values(obj)[0] || '';

      return translatedString.replace(
        /\[([^\]]+)\]/g,
        (match: any, p1: any) => {
          switch (p1) {
            case 'First Name':
              return first_name || '';
            case 'medication name':
              return medicationName || '';
            default:
              return match;
          }
        }
      );
    };
  }, [language, first_name, medicationName]);

  if (
    variant5871?.variation_name === 'Variation-1' &&
    question.name === 'WEIGHT_LOSS_CHECKOUT_S_Q1'
  ) {
    question.header = `Now that you've successfully submitted payment, answer some additional required questions.`;
    if (question.listItems && question.listItems[0]) {
      question.listItems[0] = `It is important that you answer all of these questions and upload any insurance information so that your provider can review your responses and get started on your treatment plan.`;
    }
  }

  const onHighestDosage = useMemo(() => {
    if (prescriptionsLoading || !patientPrescriptions) {
      return;
    }
    const months = patientPrescriptions?.map(presc => {
      if (!presc.matrix_id) {
        return 0;
      }
      if (presc.matrix_id.subscription_plan?.includes('multi_month')) {
        return presc.matrix_id.current_month! + 2;
      } else if (presc.matrix_id.subscription_plan?.includes('six_month')) {
        return presc.matrix_id.current_month! + 5;
      } else if (presc.matrix_id.subscription_plan?.includes('twelve_month')) {
        return presc.matrix_id.current_month! + 11;
      } else {
        return presc.matrix_id.current_month;
      }
    });
    const highestMonth = Math.max(...(months as number[]));

    //Capping dosage for this ab test
    if (
      ['Variation-1', 'Variation-2'].includes(
        variation4798?.variation_name ?? ''
      ) &&
      highestMonth >= 4
    ) {
      return true;
    }

    // All plans will be at highest dosage months 4 onwards
    return highestMonth >= 6;
  }, [mostRecentCompoundPrescription, prescriptionsLoading]);

  const header = useMemo(() => {
    if (!question.header) return '';
    let result = jsonLogic.apply(question.header, {
      visit,
    });
    if (question.name === 'WEIGHT_L_C_REFILL_Q3' && onHighestDosage) {
      result =
        'Since you are already at the highest dosage, you will stay on the same dosage.';
    }

    if (question.name === 'WEIGHT-COACHING-Q2') {
      result =
        'GLP-1 medication such as Wegovy, Zepbound, Ozempic, compounded semaglutide, and compounded tirzepatide is essential to an effective weight loss program.';
    }
    return getTranslation(result);
  }, [visit, question.header, getTranslation]);

  const description = useMemo(() => {
    if (!question.description) return '';
    const result = jsonLogic.apply(question.description, { visit });
    return getTranslation(result);
  }, [visit, question.description, getTranslation]);

  const { data: variant5751 } = useVWOVariationName('5751');
  const isMobile = useIsMobile();

  const unorderedList = useMemo(() => {
    if (!question.unorderedList) {
      return undefined;
    }

    if (variant5777?.variation_name === 'Control') {
      return [
        'Provider review of request for GLP-1s or similar medications and prescription if medically appropriate',
        'Assistance with getting your medications covered by insurance (which can cost over $1,000/month elsewhere); affordable medication without insurance',
        'Unlimited messaging with a coach who can help you build a customized plan',
        'Tracking your weight loss progress and goals',
      ];
    } else if (variant5777?.variation_name === 'Variation-1') {
      return [
        'Provider review of request for GLP-1s or similar medications and prescription if medically appropriate',
        'Assistance with getting your medications covered by insurance (which can cost over $1,000/month elsewhere); affordable medication without insurance (GLP-1 medications are not included in the membership)',
        'Unlimited messaging with a coach who can help you build a customized plan',
        'Tracking your weight loss progress and goals',
      ];
    } else if (variant5751?.variation_name === 'Variation-1') {
      return [
        'Provider review of request for GLP-1s or similar medications and prescription if medically appropriate',
        "Assistance with getting your medications covered by insurance (which can cost over $1,000/month elsewhere); affordable medication without insurance since insurance does not always approve GLP-1's",
        'Unlimited messaging with a coach who can help you build a customized plan',
        'Tracking your weight loss progress and goals',
      ];
    } else if (variant === '3055') {
      return question.unorderedList.filter(
        item =>
          item !==
          'Unlimited messaging with a coach who can help you build a customized plan'
      );
    } else return question.unorderedList;
  }, [question?.unorderedList, variant, variant5751, variant5777]);

  if (
    specificCare === SpecificCareOption.WEIGHT_LOSS &&
    ![
      PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
      PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
    ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT) &&
    question.name === 'V_IDENTITY_Q1'
  ) {
    return null;
  }

  if (compare) return null;

  if (question.hideHeader) return null;

  return (
    <Stack direction="column" gap="16px">
      {question.name === 'WEIGHT_L_POST_Q20' &&
      question?.answerOptions?.length === 1 ? null : (
        <>
          {question.subheaderBold && (
            <Typography variant="h3">
              {getTranslation(question.subheaderBold)}
            </Typography>
          )}
          {question.subheader &&
          !(question.type === 'async-mental-health-dosages') ? (
            <Typography>{getTranslation(question.subheader)}</Typography>
          ) : null}
          {question.banner ? (
            <Typography variant="h3">
              {getTranslation(question.banner)}
            </Typography>
          ) : null}
          {question.name === 'WL_FC_Q18' ? (
            <Box display="flex" alignItems="center">
              <Typography
                variant="h2"
                fontWeight="bold"
                sx={{ marginRight: 2 }}
              >
                🎉
              </Typography>
              <Typography variant="h2" fontWeight="bold">
                Finally...
              </Typography>
            </Box>
          ) : null}
          {question.header ? (
            <Typography
              variant="h2"
              sx={{
                ...(question?.styles || {}).header,
              }}
            >
              {header}
              {question.subheader &&
              question.type === 'async-mental-health-dosages' ? (
                <Typography sx={{ marginTop: '10px', color: 'gray' }}>
                  {getTranslation(question.subheader)}
                </Typography>
              ) : null}
            </Typography>
          ) : null}
          {question.name === 'MENTAL-COACHING-Q1' ? (
            <MentalHealthDescription />
          ) : null}
          {question.name === 'WEIGHT-COACHING-Q2' ? (
            <WeightLossDescription />
          ) : null}
          {question.name === 'WEIGHT-COACHING-Q4' ? (
            <WeightLossDescription />
          ) : null}
          {question.name === 'WEIGHT-COACHING-Q6' ? <WeightLossTerms /> : null}
          {question.name === 'DISQUALIFY_BMI' ? <BMIDisqualify /> : null}
          {description ? (
            <Typography
              variant="body1"
              sx={{
                ...(question?.styles || {}).header,
              }}
            >
              {description}
            </Typography>
          ) : null}
          {question.name === 'PREP_Q28' ? (
            <Box
              sx={{
                marginTop: '1rem',
                width: '100%',
                border: '2px solid darkgreen',
                borderRadius: '16px',
                backgroundColor: '#ccffcc',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                paddingX: '4rem',
                paddingY: '2rem',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 'bold', color: 'darkgreen' }}
              >
                Yes, I consent to the ordering and performance of an HIV test.
              </Typography>
            </Box>
          ) : null}
          {question.listItems && (
            <HeaderListItems
              listItems={question.listItems.map(getTranslation)}
              question={question}
            />
          )}
          {question.checkItems && (
            <CheckList checkItems={question.checkItems} question={question} />
          )}
          {unorderedList ? (
            <UnorderedList listItems={unorderedList.map(getTranslation)} />
          ) : null}
          {question.disclaimers
            ? question.disclaimers.map((disclaimer, i) => (
                <Typography
                  key={'disclaimer' + i}
                  variant="body1"
                  fontStyle="italic"
                >
                  {getTranslation(disclaimer)}
                </Typography>
              ))
            : null}
          {question.alerts
            ? question.alerts.map((alert, i) => (
                <Box display="flex" alignItems="flex-start" key={i}>
                  <InfoIcon
                    style={{
                      color: 'grey',
                      marginTop: '4px',
                    }}
                  />
                  <Typography
                    variant="body1"
                    marginLeft={1}
                    style={{ color: 'grey', lineHeight: 1.5 }}
                  >
                    {alert}
                  </Typography>
                </Box>
              ))
            : null}
        </>
      )}
    </Stack>
  );
};

export default QuestionHeader;
