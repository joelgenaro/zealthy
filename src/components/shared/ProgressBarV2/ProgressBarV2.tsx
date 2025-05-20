import React, { useEffect, useState, useRef, useMemo } from 'react';
import LinearProgress, {
  linearProgressClasses,
} from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import { useQuestionnaireQuestion } from '@/components/hooks/useQuestionnaireQuestion';
import { styled, useTheme } from '@mui/material';
import { useIntakeState } from '@/components/hooks/useIntake';
import { useRouter } from 'next/router';
import { useVisitState } from '@/components/hooks/useVisit';
import { useLanguage, useVWOVariationName } from '@/components/hooks/data';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useFlowState } from '@/components/hooks/useFlow';
import Router from 'next/router';

interface ProgressBarProps {
  answers: any;
  questionnaire?: any;
  specificProgress?: any;
}

const ProgressBarV2 = ({ answers, specificProgress }: ProgressBarProps) => {
  const questionnaires = useQuestionnaireQuestion();
  const theme = useTheme();
  const { specificCare, variant } = useIntakeState();
  const { intakes } = useVisitState();
  const { currentFlow } = useFlowState();
  const router = useRouter();
  const language = useLanguage();
  const { data: variation4935 } = useVWOVariationName('4666');
  const lastValidProgress = useRef<number | null>(null);
  const questionnaire = questionnaires?.questionnaire;
  let questions = [];
  const { question_name } = Router.query;
  const [isVariation6819, setIsVariation6819] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedValue = sessionStorage.getItem('variation6819');
      return storedValue === 'true';
    }
    return false;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const updatedValue = sessionStorage.getItem('variation6819');
      setIsVariation6819(updatedValue === 'true');
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (router.query.variant === '6819') {
        setIsVariation6819(true);
        sessionStorage.setItem('variation6819', 'true');
      }
    }
  }, [isVariation6819, router.query.variant]);

  const getQuestionsInfo = () => {
    console.log('Questionnaire debug:', {
      language,
      name: questionnaire?.name,
      hasLanguagesKey: !!questionnaire?.languages,
      structure: questionnaire?.languages
        ? 'multi-language'
        : 'single-language',
      questionCount: questions.length,
      raw: questionnaire, // Full object for inspection
    });

    if (!questionnaire && lastValidProgress.current !== null) {
      return { questions: [], totalQuestions: 0, useLastValid: true };
    }

    if (!questionnaire)
      return { questions: [], totalQuestions: 0, useLastValid: false };

    if (questionnaire.languages) {
      const languageKey = language === 'esp' ? 'esp' : 'en';
      questions = Object.values(
        questionnaire.languages[languageKey]?.questions || {}
      );
    } else {
      questions = Object.values(questionnaire.questions || []);
    }

    if (questions.length === 0) {
      return { questions: [], totalQuestions: 0, useLastValid: true };
    }

    const maxIndex = Math.max(...questions.map((q: any) => q.index || 0));

    return { questions, totalQuestions: maxIndex, useLastValid: false };
  };

  const getCurrentQuestionInfo = () => {
    const questionnaire = questionnaires?.questionnaire;
    const currentQuestionName = questionnaires?.question?.name;

    if (!questionnaire || !currentQuestionName) return { index: 0, total: 0 };

    let currentIndex = 0;
    let totalQuestions = 0;

    if (questionnaire.languages) {
      const languageKey = language === 'esp' ? 'esp' : 'en';
      const questions = questionnaire.languages[languageKey]?.questions || {};
      currentIndex = questions[currentQuestionName]?.index || 0;
      totalQuestions = Math.max(
        ...Object.values(questions).map((q: any) => q.index || 0)
      );
    } else {
      currentIndex = questionnaires?.question?.index || 0;
      totalQuestions = Math.max(
        ...Object.values(questionnaire.questions || {}).map(
          (q: any) => q.index || 0
        )
      );
    }

    return { index: currentIndex, total: totalQuestions };
  };

  const {
    questions: questionsArray,
    totalQuestions,
    useLastValid,
  } = getQuestionsInfo();
  const { index: questionNumber } = getCurrentQuestionInfo();
  const [progress, setProgress] = useState<number>(5);

  const intakesArray = useMemo(() => {
    return intakes?.reduce((flattenedArray: any[], intake: any) => {
      if (intake && intake?.questions) {
        Object.entries(intake.questions).forEach(([key, iq]) => {
          flattenedArray.push({
            ...(iq as Record<string, any>),
            name: key,
          });
        });
      }
      return flattenedArray;
    }, []);
  }, [intakes]);

  // CHECKOUT_S_Q1
  const isPostCheckout = router.pathname.includes('post-checkout');
  useEffect(() => {
    if (useLastValid) {
      console.log(
        'Using last valid progress during language switch:',
        lastValidProgress.current
      );
      if (lastValidProgress.current !== null) {
        setProgress(lastValidProgress.current);
      }
      return;
    }

    console.log('Progress calculation:', {
      questionNumber,
      totalQuestions,
      specificCare,
      language,
      questionnaireName: questionnaires?.questionnaire?.name,
      isPostCheckout,
    });

    if (specificProgress !== undefined) {
      lastValidProgress.current = specificProgress;
      setProgress(specificProgress);
      return;
    }

    if (router.pathname.includes('checkout') && !isPostCheckout) {
      lastValidProgress.current = 100;
      setProgress(100);
      return;
    }

    if (questionsArray.length === 0) {
      return;
    }

    if (specificCare === 'Prep' || specificCare === 'Sleep') {
      if (questionnaires?.questionnaire?.name === 'vouched-verification') {
        if (questionnaires?.question?.name === 'V_IDENTITY_Q1') {
          lastValidProgress.current = 95;
          return setProgress(95);
        }
        if (questionnaires?.question?.name === 'V_IDENTITY_Q2') {
          lastValidProgress.current = 97.5;
          return setProgress(97.5);
        }
        if (questionnaires?.question?.name === 'V_IDENTITY_Q3') {
          lastValidProgress.current = 100;
          return setProgress(100);
        }
      }
      const numQuestions = Math.max(
        ...(questionsArray.map(question => question.index || 0) as number[])
      );
      const newProgress = questionNumber * (100 / (numQuestions + 3));
      lastValidProgress.current = newProgress;
      return setProgress(newProgress);
    }

    if (specificCare === 'Weight loss' && !isPostCheckout) {
      const percentage =
        totalQuestions > 0 ? (questionNumber * 100) / totalQuestions : 0;
      lastValidProgress.current = percentage;
      return setProgress(percentage);
    }

    if (currentFlow === 'ed') {
      if (questionnaires?.questionnaire?.name === 'vouched-verification') {
        if (questionnaires?.question?.name === 'V_IDENTITY_Q1') {
          lastValidProgress.current = 95;
          return setProgress(95);
        }
        if (questionnaires?.question?.name === 'V_IDENTITY_Q2') {
          lastValidProgress.current = 97.5;
          return setProgress(97.5);
        }
        if (questionnaires?.question?.name === 'V_IDENTITY_Q3') {
          lastValidProgress.current = 100;
          return setProgress(100);
        }
      }
    }

    if (currentFlow === 'sema-bundled' && questionnaires?.questionnaire) {
      if (questionnaires?.questionnaire.name === 'weight-loss-bundled') {
        const newProgress = Math.ceil(
          questionNumber * (100 / questionsArray.length)
        );
        lastValidProgress.current = newProgress;
        return setProgress(newProgress);
      }
      const numPostCheckoutQuestions = 21;
      if (
        [
          'weight-loss-post-bundled',
          'weight-loss-bundled-treatment',
          'weight-loss-full-body-photo',
        ].includes(questionnaires?.questionnaire.name as string)
      ) {
        const newProgress = Math.ceil(
          questionNumber * (100 / numPostCheckoutQuestions)
        );
        lastValidProgress.current = newProgress;
        return setProgress(newProgress);
      }
      if (
        questionnaires?.questionnaire.name === 'identity-verification' &&
        variant !== '4758'
      ) {
        lastValidProgress.current = 95;
        return setProgress(95);
      }
      if (questionnaires?.questionnaire.name === 'responses-reviewed') {
        lastValidProgress.current = 100;
        return setProgress(100);
      }
    }

    if (
      specificCare === 'Enclomiphene' &&
      questionnaires?.question?.name === 'MY_LAB_KIT'
    ) {
      return setProgress(95);
    }

    if (
      specificCare === 'Enclomiphene' &&
      questionnaires?.questionnaire?.name === 'vouched-verification'
    ) {
      if (questionnaires?.question?.name === 'V_IDENTITY_Q1') {
        return setProgress(97);
      }
      if (questionnaires?.question?.name === 'V_IDENTITY_Q2') {
        return setProgress(99);
      }
      if (questionnaires?.question?.name === 'V_IDENTITY_Q3') {
        return setProgress(100);
      }
    }

    if (specificCare === 'Enclomiphene' && isPostCheckout) {
      if (questionnaires?.question?.name === 'CHECKOUT_S_Q1') {
        lastValidProgress.current = 90;
        return setProgress(90);
      }
      if (questionnaires?.question?.name === 'ASYNC-WIN-Q1') {
        lastValidProgress.current = 95;
        return setProgress(95);
      }
    }

    if (
      (specificCare === SpecificCareOption.ACNE ||
        specificCare === SpecificCareOption.ROSACEA ||
        specificCare === SpecificCareOption.MELASMA ||
        specificCare === SpecificCareOption.ANTI_AGING) &&
      isPostCheckout
    ) {
      const total = intakesArray.length;
      const matchIndex = intakesArray.findIndex(
        (intake: any) => intake?.name === question_name
      );

      if (matchIndex === -1) {
        const lastIndex = lastValidProgress?.current
          ? lastValidProgress.current
          : 0;

        setProgress(Math.ceil((lastIndex + 1 / (total - 1)) * 100));

        lastValidProgress.current = lastIndex + 1;
        return;
      }
      if (question_name === 'COMPLETED') {
        lastValidProgress.current = intakesArray.length - 2;
        return setProgress(95);
      }
      lastValidProgress.current = matchIndex;
      return setProgress(Math.ceil((matchIndex / (total - 1)) * 100));
    }

    if (specificCare === 'Weight loss' && isPostCheckout) {
      const numQuestions = Math.max(
        ...(intakesArray.map(
          (question: any) => question.index || 0
        ) as number[])
      );

      let newProgress = 0;
      if (
        questionnaires?.questionnaire?.name === 'weight-loss-preference' &&
        variant === '4758'
      ) {
        newProgress = 65;
      } else if (
        questionnaires?.questionnaire?.name === 'weight-loss-pay' &&
        variant === '4758'
      ) {
        newProgress = 75;
      } else if (
        questionnaires?.questionnaire?.name === 'weight-loss-treatment' &&
        variant === '4758'
      ) {
        newProgress = 80;
      } else if (
        questionnaires?.questionnaire?.name === 'identity-verification' &&
        variant === '4758'
      ) {
        newProgress = 91.6;
      } else if (
        questionnaires?.questionnaire?.name === 'live-provider-visit'
      ) {
        newProgress = 96;
      } else if (
        questionnaires?.questionnaire?.name === 'vouched-verification'
      ) {
        newProgress = 100;
      } else if (questionsArray.length > 0 && variant === '4758') {
        newProgress = questionNumber * (65 / numQuestions);
      } else if (questionsArray.length > 0) {
        newProgress = questionNumber * (100 / numQuestions);
      }

      if (newProgress > 0) {
        lastValidProgress.current = newProgress;
        return setProgress(newProgress);
      }
    }

    if (
      variation4935?.variation_name === 'Variation-2' &&
      questionnaires?.question?.name === 'INSURANCE_PLAN' &&
      specificCare === 'Weight loss' &&
      !isPostCheckout
    ) {
      lastValidProgress.current = 60;
      return setProgress(60);
    }

    if (
      specificCare &&
      [
        SpecificCareOption.SKINCARE,
        SpecificCareOption.ANTI_AGING,
        SpecificCareOption.ROSACEA,
        SpecificCareOption.MELASMA,
        SpecificCareOption.ACNE,
      ].includes(specificCare)
    ) {
      const newProgress = Math.ceil(
        questionNumber * (100 / intakesArray.length)
      );
      lastValidProgress.current = newProgress;
      setProgress(newProgress);
    } else {
      const newProgress = Math.ceil(
        questionNumber * (100 / questionsArray.length)
      );
      lastValidProgress.current = newProgress;
      setProgress(newProgress);
    }
  }, [
    questionNumber,
    questionnaires,
    specificCare,
    intakesArray,
    isPostCheckout,
    questionsArray,
    specificProgress,
    variation4935?.variation_name,
    variant,
    router,
    language,
    totalQuestions,
    currentFlow,
    useLastValid,
    isVariation6819,
  ]);

  const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 8,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor:
        theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor: theme.palette.secondary.main,
    },
  }));

  const isOnboardingRoute = [
    '/signup',
    '/onboarding/region-screen',
    '/onboarding/age-screen',
    '/onboarding/complete-profile',
  ].includes(router.pathname);

  const getOnboardingProgress = () => {
    switch (router.pathname) {
      case '/signup':
        return 25;
      case '/onboarding/region-screen':
        return 50;
      case '/onboarding/age-screen':
        return 75;
      case '/onboarding/complete-profile':
        return 100;
      default:
        return 100;
    }
  };

  const shouldUseSmallMiddleBar =
    isPostCheckout || (isVariation6819 && isOnboardingRoute);

  if (
    !isPostCheckout &&
    [
      'Skincare',
      'Acne',
      'Hyperpigmentation Dark Spots',
      'Fine Lines & Wrinkles',
      'Rosacea',
    ]?.includes(specificCare || '')
  ) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', gap: '0.1rem' }}>
      {isVariation6819 && (
        <BorderLinearProgress
          variant="determinate"
          value={isOnboardingRoute ? getOnboardingProgress() : 100}
          sx={{ width: router.query.variant !== '6819' ? 20 : 200 }}
        />
      )}
      <BorderLinearProgress
        variant="determinate"
        value={isPostCheckout ? 100 : progress > 100 ? 100 : progress}
        sx={{ width: shouldUseSmallMiddleBar ? 20 : 200 }}
      />
      {isPostCheckout ? (
        <BorderLinearProgress
          variant="determinate"
          value={progress > 100 ? 100 : progress}
          sx={{ width: 200 }}
        />
      ) : (
        <BorderLinearProgress
          variant="determinate"
          value={0}
          sx={{ width: 20 }}
        />
      )}
    </Box>
  );
};

export default ProgressBarV2;
