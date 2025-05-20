import { QuestionWithName } from '@/types/questionnaire';
import { useCallback, useEffect, useMemo, useState } from 'react';
import CustomNonBundledPlan from '@/components/shared/CustomNonBundledPlan';
import { useLanguage, useVWOVariationName } from '@/components/hooks/data';
import { Database } from '@/lib/database.types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useIntakeState } from '@/components/hooks/useIntake';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import { useCoachingActions } from '@/components/hooks/useCoaching';
import getConfig from '../../../../../../config';

interface NonBundledCustomPlan {
  question: QuestionWithName;
  nextPage: (nextPage?: string) => void;
}
type Subscription = Pick<
  Database['public']['Tables']['subscription']['Row'],
  'id' | 'price' | 'reference_id'
>;

const NonBundledCustomPlan = ({ question, nextPage }: NonBundledCustomPlan) => {
  const { addCoaching } = useCoachingActions();
  const { data: variant5777 } = useVWOVariationName('5777');
  const price = 135;
  const discountedPrice = 39;
  const language = useLanguage();

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  let listItems = [
    'Provider review of request for GLP-1s or similar medications and prescription if medically appropriate',
    'Assistance with getting your medications covered by insurance (which can cost over $1,000/month elsewhere); affordable medication without insurance',
    'Unlimited messaging with a coach who can help you build a customized plan',
    'Tracking your weight loss progress and goals',
  ];
  if (language === 'esp') {
    listItems = [
      'Revisión del proveedor de la solicitud de GLP-1 o medicamentos similares y prescripción si es médicamente apropiado',
      'Asistencia para obtener cobertura de seguro para tus medicamentos (que pueden costar más de $1,000/mes en otros lugares); medicamento asequible sin seguro',
      'Mensajería ilimitada con un entrenador que puede ayudarte a crear un plan personalizado',
      'Seguimiento de tu progreso y metas de pérdida de peso',
    ];
  }

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const supabase = useSupabaseClient<Database>();
  const { potentialInsurance, variant, specificCare } = useIntakeState();
  const name = `${siteName} Weight Loss`;

  const recurring = useMemo(
    () => ({
      interval: 'month',
      interval_count: 1,
    }),
    []
  );

  if (variant5777?.variation_name === 'Variation-3') {
    listItems = [
      'Provider review of request for GLP-1s or similar medications and prescription if medically appropriate',
      'Assistance with getting your medications covered by insurance (which can cost over $1,000/month elsewhere); affordable medication without insurance (GLP-1 medications are not included in the membership)',
      'Unlimited messaging with a coach who can help you build a customized plan',
      'Tracking your weight loss progress and goals',
    ];
  }

  useEffect(() => {
    supabase
      .from('subscription')
      .select('price, id, reference_id')
      .eq('name', name)
      .eq('active', true)
      .single()
      .then(({ data }) => {
        if (data) setSubscription(data);
      });
  }, [supabase]);
  console.log({ SUBSCRIPTION_CREATED: subscription });

  const handleContinue = useCallback(() => {
    if (!subscription) return;
    addCoaching({
      type: CoachingType.WEIGHT_LOSS,
      name: `${siteName} Weight Loss Program`,
      id: subscription!.id,
      planId: subscription!.reference_id,
      recurring,
      price: subscription!.price,
      discounted_price: 39,
    });
    nextPage();
  }, [
    subscription,
    potentialInsurance,
    addCoaching,
    recurring,
    variant,
    nextPage,
  ]);
  const handleClick = useCallback(() => {
    nextPage();
  }, [nextPage]);

  return (
    <CustomNonBundledPlan
      question={question}
      onClick={
        variant5777?.variation_name === 'Variation-2' ||
        variant5777?.variation_name === 'Variation-3'
          ? handleContinue
          : handleClick
      }
      price={price}
      discountedPrice={discountedPrice}
      listItems={listItems}
    />
  );
};

export default NonBundledCustomPlan;
