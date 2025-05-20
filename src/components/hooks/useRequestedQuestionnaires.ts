import { VisitQuestionnaireType } from '@/context/AppContext/reducers/types/visit';
import differenceInYears from 'date-fns/differenceInYears';
import { useMemo } from 'react';
import { useSelector } from './useSelector';
import { useVWO } from '@/context/VWOContext';
import { usePatientState } from './usePatient';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';
import { useIntakeSelect } from './useIntake';

export const useRequestedQuestionnaires = () => {
  const careSelected = useSelector(
    store => store.visit.selectedCare.careSelections[0]?.reason
  );
  const birth_date = useSelector(store => store.profile.birth_date);
  const potentialInsurance = useIntakeSelect(
    intake => intake.potentialInsurance
  );
  const vwoContext = useVWO();
  const patientState = usePatientState();
  const specificCare = useSelector(store => store?.intake?.specificCare);

  return useMemo(() => {
    const questionnaires: VisitQuestionnaireType[] = [];
    if (!birth_date) return [];

    if (careSelected?.toLowerCase().includes('weight loss')) return [];

    if (differenceInYears(new Date(), new Date(birth_date)) <= 18) {
      questionnaires.push({
        name: 'height-weight',
        entry: 'HEIGHT_W_Q1',
        intro: false,
        care: '',
      });
    }

    if (
      [
        PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
        PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
      ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
    ) {
      return [];
    }

    return questionnaires;
  }, [birth_date, careSelected, potentialInsurance]);
};
