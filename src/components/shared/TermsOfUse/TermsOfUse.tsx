import Link from 'next/link';
import { Stack, Typography, useTheme } from '@mui/material';
import { monthsFromNow } from '@/utils/monthsFromNow';
import { useAddZealthySubscription } from '@/components/hooks/useAddZealthySubscription';
import { useIntakeState } from '@/components/hooks/useIntake';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { useSelector } from '@/components/hooks/useSelector';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { addMonths, format } from 'date-fns';
import { useMemo } from 'react';
import { useCouponCodeRedeem } from '@/components/hooks/data';
import { useLanguage, useVWOVariationName } from '@/components/hooks/data';
import { Medication } from '@/context/AppContext/reducers/types/visit';
import getConfig from '../../../../config';

const siteName = getConfig(
  process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
).name;

const weightLossText: Record<string, string> = {
  Control: `By clicking the “Get started” button above, your card will be billed the discounted price of $39 for the first month of your membership, which includes your provider review to have GLP-1 or other weight loss medication covered, ongoing care with your medical team at ${siteName}, a designated weight loss coach, and more. After you complete the order by clicking the secure "Get started" button above, your information will be securely saved. You will then be asked to complete a short medical history intake and verify your identity. A doctor will review your information, and, if appropriate, prescribe your medication. If you are not eligible for weight loss medication for ANY reason, you will receive a full refund of your purchase price. You may choose to move forward with insurance coverage of medications like Wegovy or Zepbound; if you do this, it will typically take 2-14 days to get your insurance to confirm coverage before you can pick up your medication at your local pharmacy for just your co-pay. ${siteName}’s insurance coordination team is trained to optimize the chances of getting your prior authorization approved to have GLP-1 medications covered; however, we cannot guarantee that your medication will be covered by insurance. You may choose to request semaglutide or tirzepatide, which would be an additional fee (starts as low as $151/month for semaglutide and as low as $216/month for tirzepatide for quarterly supplies). There will be monthly and quarterly options for these medications. If you choose semaglutide or tirzepatide, the kit you receive will include semaglutide or tirzepatide, a user-friendly home injection kit, and detailed instructions. Each month, you will need to update your prescribing doctor on your progress and they will have the ability to adjust your dosage as needed. If at any time you decide not to continue, simply log into the website and cancel your membership. While you are a member, you will have access to chat with your doctor or customer support for any needed assistance. If you choose to continue beyond the first month, your membership will continue at $135 per month.`,
  'Variation-1': `By clicking the “Get started” button above, your card will be billed the discounted price of $39 for the first month of your membership, which includes your provider review to have GLP-1 or other weight loss medication covered, ongoing care with your medical team at ${siteName}, a designated weight loss coach, and more. After you complete the order by clicking the secure "Get started" button above, your information will be securely saved. You will then be asked to complete a short medical history intake and verify your identity. A doctor will review your information, and, if appropriate, prescribe your medication. If you are not eligible for weight loss medication for ANY reason, you will receive a full refund of your purchase price. You may choose to move forward with insurance coverage of medications like Wegovy or Zepbound; if you do this, it will typically take 2-14 days to get your insurance to confirm coverage before you can pick up your medication at your local pharmacy for just your co-pay. ${siteName}’s insurance coordination team is trained to optimize the chances of getting your prior authorization approved to have GLP-1 medications covered; however, we cannot guarantee that your medication will be covered by insurance. You may choose to request semaglutide or tirzepatide, which would be an additional fee (starts as low as $151/month for semaglutide and as low as $216/month for tirzepatide for quarterly supplies). There will be monthly and quarterly options for these medications. If you choose semaglutide or tirzepatide, the kit you receive will include semaglutide or tirzepatide, a user-friendly home injection kit, and detailed instructions. Each month, you will need to update your prescribing doctor on your progress and they will have the ability to adjust your dosage as needed. If at any time you decide not to continue, simply log into the website and cancel your membership. While you are a member, you will have access to chat with your doctor or customer support for any needed assistance. If you choose to continue beyond the first month, your membership will continue at $135 per month.`,
  'Variation-2': `By clicking the “Get started” button above, your card will be billed the discounted price of $39 for the first month of your membership, which includes your provider review to have GLP-1 or other weight loss medication covered, ongoing care with your medical team at ${siteName}, a designated weight loss coach, and more. After you complete the order by clicking the secure "Get started" button above, your information will be securely saved. You will then be asked to complete a short medical history intake and verify your identity. A doctor will review your information, and, if appropriate, prescribe your medication. If you are not eligible for weight loss medication for ANY reason, you will receive a full refund of your purchase price. You may choose to move forward with insurance coverage of medications like Wegovy or Zepbound; if you do this, it will typically take 2-14 days to get your insurance to confirm coverage before you can pick up your medication at your local pharmacy for just your co-pay. ${siteName}’s insurance coordination team is trained to optimize the chances of getting your prior authorization approved to have GLP-1 medications covered; however, we cannot guarantee that your medication will be covered by insurance. You may choose to request semaglutide or tirzepatide, which would be an additional fee (starts as low as $151/month for semaglutide and as low as $216/month for tirzepatide for quarterly supplies). There will be monthly and quarterly options for these medications. If you choose semaglutide or tirzepatide, the kit you receive will include semaglutide or tirzepatide, a user-friendly home injection kit, and detailed instructions. Each month, you will need to update your prescribing doctor on your progress and they will have the ability to adjust your dosage as needed. If at any time you decide not to continue, simply log into the website and cancel your membership. While you are a member, you will have access to chat with your doctor or customer support for any needed assistance. If you choose to continue beyond the first month, your membership will continue at $135 per month.`,
};

const weightLossTextSpanish: Record<string, string> = {
  Control: `Al hacer clic en el botón "Confirmar" arriba, se cobrará a su tarjeta el precio con descuento de $39 por el primer mes de su membresía, que incluye la revisión de su proveedor para que el GLP-1 u otro medicamento para bajar de peso esté cubierto, atención continua con su equipo médico en ${siteName}, un entrenador de pérdida de peso designado, y más. Después de completar el pedido haciendo clic en el botón seguro de "pago" a continuación, su información se guardará de forma segura. Luego se le pedirá que complete un breve historial médico y verifique su identidad. Un médico revisará su información y, si es apropiado, recetará su medicamento. Si no es elegible para medicamentos para bajar de peso por CUALQUIER razón, recibirá un reembolso completo del precio de su compra. Puede optar por seguir adelante con la cobertura del seguro de medicamentos como Wegovy o Zepbound; si hace esto, normalmente tomará de 2 a 14 días para que su seguro confirme la cobertura antes de que pueda recoger su medicamento en su farmacia local por solo su copago. El equipo de coordinación de seguros de ${siteName} está capacitado para optimizar las posibilidades de que se apruebe su autorización previa para que los medicamentos GLP-1 estén cubiertos; sin embargo, no podemos garantizar que su medicamento esté cubierto por el seguro. Puede optar por solicitar semaglutida o tirzepatida, lo que supondría una tarifa adicional (comienza tan bajo como $151/mes para semaglutida y tan bajo como $216/mes para tirzepatida para suministros trimestrales). Habrá opciones mensuales y trimestrales para estos medicamentos. Si elige semaglutida o tirzepatida, el kit que reciba incluirá semaglutida o tirzepatida, un kit de inyección domiciliaria fácil de usar e instrucciones detalladas. Cada mes, deberá actualizar a su médico prescriptor sobre su progreso y ellos tendrán la capacidad de ajustar su dosis según sea necesario. Si en algún momento decide no continuar, simplemente inicie sesión en el sitio web y cancele su membresía. Mientras sea miembro, tendrá acceso para chatear con su médico o con el servicio de atención al cliente para cualquier asistencia necesaria. Si elige continuar más allá del primer mes, su membresía continuará a $135 por mes.`,
};

const TermsOfUse = ({
  hasAppointment,
  coaching,
  isMulti,
  variant6471,
  selectedMedication,
  discountApplied,
  short = false,
}: {
  hasAppointment: boolean;
  coaching?: any;
  isMulti?: boolean;
  variant6471?: boolean;
  selectedMedication?: Medication;
  discountApplied?: boolean;
  short?: boolean;
}) => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const { specificCare, potentialInsurance, variant } = useIntakeState();
  const showZealthySubscription = useAddZealthySubscription();
  const { data: couponCodeRedeem } = useCouponCodeRedeem();
  const language = useLanguage();
  const { data: variation6826 } = useVWOVariationName('6826');
  const { data: variation7153_01 } = useVWOVariationName('7153_01');
  const { data: variation7153_05 } = useVWOVariationName('7153_05');
  const { data: variation6399 } = useVWOVariationName('6399');
  const { data: variation7861 } = useVWOVariationName('7861_1');
  const { data: variation7895 } = useVWOVariationName('7895');
  const { data: variation7865_2 } = useVWOVariationName('7865_2');
  const isVar6399 =
    variation6399?.variation_name === 'Variation-1' ||
    variation6399?.variation_name === 'Variation-2';

  const termsOfUse = useMemo(() => {
    if (language === 'esp') {
      return weightLossTextSpanish['Control'];
    } else if (variation6826?.variation_name === 'Variation-1') {
      return weightLossText['Variation-1'];
    } else {
      return ['Variation-1', 'Variation-2'].includes(
        variation7861?.variation_name!
      ) || variant === 'twelve-month'
        ? weightLossText['Variation-1']
        : weightLossText['Control'];
    }
  }, [variation6826, language, variation7861]);

  const medications = useSelector(store => store.visit.medications);
  let recurringMed = medications.find(m => !!m?.recurring?.interval);

  if (recurringMed?.type === 'Sex + Hair') {
    recurringMed = selectedMedication;
  }
  if (selectedMedication?.type === 'Menopause') {
    recurringMed = selectedMedication;
  }

  const isPreWorkoutTbd =
    recurringMed?.name === 'Tadalafil 10 mg + Vardenafil 10 mg';

  const renewal = useMemo(() => {
    return recurringMed?.recurring.interval_count === 1
      ? 'every month'
      : `every ${recurringMed?.recurring.interval_count} months`;
  }, [recurringMed?.recurring.interval_count]);
  console.log(recurringMed);
  const termText = useMemo(() => {
    let oldText =
      specificCare === SpecificCareOption.SKINCARE
        ? `All patients must complete a virtual consultation, which will be reviewed by a ${siteName} provider who will determine if a prescription treatment is right for you. If your provider does not deem this medication is appropriate for you, you may be prescribed a different treatment.`
        : specificCare === SpecificCareOption.ANXIETY_OR_DEPRESSION &&
          variation7153_01?.variation_name === 'Variation-1'
        ? `${siteName}’s Personalized Psychiatry treatment is an automatically-renewing monthly subscription service. You will be charged $39 today to begin your care and $99 every month after. Your membership will include psychiatric care (including video visits with your medical provider), medication (if prescribed), and shipping to your home in discreet packaging. You can cancel your subscription anytime through your online account. `
        : specificCare === SpecificCareOption.ASYNC_MENTAL_HEALTH
        ? `If prescribed your 3 month supply of psychiatric medication, you will be charged $116.
      Every time your prescription renews (${renewal}), you will be charged $${
            recurringMed?.type === 'Sex + Hair'
              ? recurringMed?.price
              : recurringMed?.price
          } when your shipment goes out. You can view 
      upcoming shipment dates in the patient portal and it will be automatically updated 
      when your prescription is refilled. You can cancel your automatically renewing 
      prescription delivery by logging into your ${siteName} account and clicking “Profile” 
      in the top right corner and selecting “Manage Membership” in the program details section. 
      Your prescription will renew unless you cancel at least 48 hours before the next refill is processed.`
        : specificCare === SpecificCareOption.SLEEP
        ? `Upon medication approval, your medication will be shipped and you will be charged $${
            recurringMed?.type === 'Sex + Hair'
              ? recurringMed?.price
              : recurringMed?.price
          }. Your prescription will ship every ${
            recurringMed?.recurring.interval_count
          } months thereafter unless you cancel or your prescription expires. You can cancel any time from your ${siteName} portal. You can also contact the ${siteName} medical team at any time with any questions or to make adjustments to your treatment plan.`
        : specificCare === SpecificCareOption.WEIGHT_LOSS
        ? couponCodeRedeem?.code === 'katie'
          ? `You will be automatically charged $39 for your first month. You can cancel your membership by logging into your ${siteName} account and clicking “Profile” in the top right corner and selecting “Manage Membership” in the program details section. Your monthly membership fees are non-refundable and you can cancel up to 36 hours before any future billing period.`
          : potentialInsurance === PotentialInsuranceOption.FIRST_MONTH_FREE
          ? 'You will be charged an initial doctor consultation fee of $39. You will be charged $0 for your first month of your membership, and the plan will automatically renew each month thereafter at the rate of $135 until you cancel.'
          : coaching?.[0]?.name ===
            `${siteName} Weight Loss + Tirzepatide Program`
          ? `By clicking the “Get Started” button above, your card will be billed the discounted price of $349 today to reserve your 1 month supply of Tirzepatide. After you complete the order by clicking the secure "checkout" button below, your information will be securely saved. You will then be asked to complete a short medical history intake and verify your identity. A doctor will review your information, and, if appropriate, prescribe your medication. If you are not eligible for Tirzepatide for ANY reason, you will receive a full refund of your purchase price. You have selected the monthly package, which includes a 1 month starter kit. The starter kit includes Tirzepatide, a user-friendly home injection kit, and detailed instructions. Each month, you will need to update your prescribing doctor on your progress and they will have the ability to adjust your dosage as needed. If at any time you decide not to continue, simply log into the website and cancel your membership. You will not be billed further. While you are a member, you will have access to chat with your doctor or customer support for any needed assistance. If you choose to continue beyond the first month, your membership will continue at $449 per month.`
          : coaching?.[0]?.price === 630
          ? `By clicking the “Get Started” button above, your card will be billed the discounted price of $630 today to reserve your 3 month supply of Semaglutide. After you complete the order by clicking the secure "checkout" button below, your information will be securely saved. You will then be asked to complete a short medical history intake and verify your identity. A doctor will review your information, and, if appropriate, prescribe your medication. If you are not eligible for Semaglutide for ANY reason, you will receive a full refund of your purchase price. You have selected the monthly package, which includes a 3 month starter kit. The starter kit includes Semaglutide, a user-friendly home injection kit, and detailed instructions. Each month, you will need to update your prescribing doctor on your progress and they will have the ability to adjust your dosage as needed. If at any time you decide not to continue, simply log into the website and cancel your membership. You will not be billed further. While you are a member, you will have access to chat with your doctor or customer support for any needed assistance. If you choose to continue beyond the first three months, your membership will continue at $891 per quarter.`
          : coaching?.[0]?.name ===
            `${siteName} Weight Loss + Semaglutide Program`
          ? `By clicking the “Get Started” button above, your card will be billed the discounted price of $217 today to reserve your 1 month supply of Semaglutide. After you complete the order by clicking the secure "checkout" button below, your information will be securely saved. You will then be asked to complete a short medical history intake and verify your identity. A doctor will review your information, and, if appropriate, prescribe your medication. If you are not eligible for Semaglutide for ANY reason, you will receive a full refund of your purchase price. You have selected the monthly package, which includes a 1 month starter kit. The starter kit includes Semaglutide, a user-friendly home injection kit, and detailed instructions. Each month, you will need to update your prescribing doctor on your progress and they will have the ability to adjust your dosage as needed. If at any time you decide not to continue, simply log into the website and cancel your membership. You will not be billed further. While you are a member, you will have access to chat with your doctor or customer support for any needed assistance. If you choose to continue beyond the first month, your membership will continue at $297 per month.`
          : coaching?.[0]?.name ===
            `${siteName} Weight Loss + Semaglutide Program`
          ? `You'll pay $217 for your first month and $297 monthly after that. 100% satisfaction guaranteed or your money back. Cancel any time.`
          : variant6471
          ? `By clicking the “Get started” button above, your card will be billed the discounted price of $39 for the first month of your membership, which includes your provider review to have GLP-1 or other weight loss medication covered, ongoing care with your medical team at ${siteName}, a designated weight loss coach, and more. After you complete the order by clicking the secure "Get started" button above, your information will be securely saved. You will then be asked to complete a short medical history intake and verify your identity. A doctor will review your information, and, if appropriate, prescribe your medication. If you are not eligible for weight loss medication for ANY reason, you will receive a full refund of your purchase price. You may choose to move forward with insurance coverage of medications like Wegovy or Zepbound; if you do this, it will typically take 2-14 days to get your insurance to confirm coverage before you can pick up your medication at your local pharmacy for just your co-pay. ${siteName}’s insurance coordination team is trained to optimize the chances of getting your prior authorization approved to have GLP-1 medications covered; however, we cannot guarantee that your medication will be covered by insurance. You may choose to request semaglutide or tirzepatide, which would be an additional fee (starts as low as $151/month for semaglutide and as low as $216/month for tirzepatide for quarterly supplies). There will be monthly and quarterly options for these medications. If you choose semaglutide or tirzepatide, the kit you receive will include semaglutide or tirzepatide, a user-friendly home injection kit, and detailed instructions. Each month, you will need to update your prescribing doctor on your progress and they will have the ability to adjust your dosage as needed. If at any time you decide not to continue, simply log into the website and cancel your membership. While you are a member, you will have access to chat with your doctor or customer support for any needed assistance. If you choose to continue beyond the first month, your membership will continue at $135 per month.`
          : coaching?.[0]?.name === `${siteName} Weight Loss (Texas)`
          ? `You will be automatically charged $39 for your first month and $119 for every month after unless you cancel your membership. You can cancel your membership by logging into your ${siteName} account and clicking “Profile” in the top right corner and selecting “Manage Membership” in the program details section. Your monthly membership fees are non-refundable and you can cancel up to 36 hours before any future billing period.`
          : coaching?.[0]?.name ===
            'Z-Plan by Zealthy Weight Loss Access Program'
          ? `You will be automatically charged $39 for your first month and $79 for every month after unless you cancel your membership. You can cancel your membership by logging into your ${siteName} account and clicking “Profile” in the top right corner and selecting “Manage Membership” in the program details section. Your monthly membership fees are non-refundable and you can cancel up to 36 hours before any future billing period.`
          : coaching?.[0]?.name === `${siteName} Weight Loss Flexible`
          ? `You will be automatically charged $${coaching?.[0]?.price} for your first month and $135 for every month after unless you cancel your membership. You can cancel your membership by logging into your ${siteName} account and clicking “Profile” in the top right corner and selecting “Manage Membership” in the program details section. Your monthly membership fees are non-refundable and you can cancel up to 36 hours before any future billing period.`
          : coaching?.[0]?.name ===
            `${siteName} Weight Loss Semaglutide Flexible`
          ? `By clicking the “Get Started” button above, your card will be billed the discounted price of $${coaching?.[0]?.price} today to reserve your 1 month supply of Semaglutide. After you complete the order by clicking the secure "checkout" button below, your information will be securely saved. You will then be asked to complete a short medical history intake and verify your identity. A doctor will review your information, and, if appropriate, prescribe your medication. If you are not eligible for Semaglutide for ANY reason, you will receive a full refund of your purchase price. You have selected the monthly package, which includes a 1 month starter kit. The starter kit includes Semaglutide, a user-friendly home injection kit, and detailed instructions. Each month, you will need to update your prescribing doctor on your progress and they will have the ability to adjust your dosage as needed. If at any time you decide not to continue, simply log into the website and cancel your membership. You will not be billed further. While you are a member, you will have access to chat with your doctor or customer support for any needed assistance. If you choose to continue beyond the first month, your membership will continue at $297 per month.`
          : coaching?.[0]?.name === `${siteName} 3-Month Weight Loss`
          ? `You will be automatically charged $275 for your first 3 months (which includes all of your medical care and coaching for the next 3 months). You will not be charged again for another 90 days but after that you will be charged $113/month every 90 days unless you cancel your membership (cancel any time). You can cancel your membership by logging into your ${siteName} account and clicking “Profile” in the top right corner and selecting “Manage Membership” in the program details section. Your monthly membership fees are non-refundable and you can cancel up to 36 hours before any future billing period.`
          : coaching?.[0]?.name !== `${siteName} 3-Month Weight Loss Plan`
          ? termsOfUse
          : `You will be automatically charged $264 for your first three months of ${siteName} Weight Loss membership. Beginning on ${format(
              addMonths(new Date(), 3),
              'MMMM d, yyyy'
            )}, you will be charged $339 every 3 months until you cancel your membership. You can cancel your membership any time by logging into your ${siteName} account and clicking “Profile” in the top right corner and selecting “Manage Membership” in the program details section. Your monthly membership fees are non-refundable and you can cancel up to 36 hours before any future billing period.`
        : isPreWorkoutTbd
        ? `If prescribed Blood Flow treatment, you will be charged to your card on file. Every time your prescription renews (every month), you will be charged to your card on file when your shipment goes out. You can view upcoming shipment dates in the patient portal and it will be automatically updated when your prescription is refilled. You can cancel your automatically renewing prescription delivery by logging into your ${siteName} account and clicking “Profile” in the top right corner and selecting “Manage Membership” in the program details section. Your prescription will renew unless you cancel at least 48 hours before the next refill is processed.`
        : recurringMed &&
          specificCare === SpecificCareOption.ENCLOMIPHENE &&
          variation7153_05?.variation_name === 'Variation-1'
        ? `The ${
            recurringMed.name
          } is an automatically-renewing subscription service that refills and ships ${renewal}. If prescribed this medication, you will be charged $${Math.round(
            recurringMed.discounted_price || recurringMed.price!
          )} today for this initial shipment and $${Math.round(
            recurringMed.discounted_price || recurringMed.price!
          )} every refill onwards. Your initial shipment should be a ${
            recurringMed.quantity
          } day supply. You can view upcoming shipment dates in your online account. Your prescription will renew unless you cancel at least 48 hours before the next refill is processed. You can cancel at any time. `
        : recurringMed
        ? `If prescribed ${
            recurringMed.type === 'Preworkout'
              ? 'Blood Flow treatment'
              : recurringMed.type === 'Sex + Hair'
              ? recurringMed.name
              : recurringMed.type === 'Menopause'
              ? 'Menopause Medication'
              : recurringMed.name
          }, you will be charged $${
            recurringMed.type === 'Preworkout' ||
            recurringMed.type === 'Sex + Hair' ||
            recurringMed.type === 'ED'
              ? Math.round(
                  recurringMed.discounted_price! || recurringMed.price! || 0
                )
              : recurringMed.type === 'Menopause'
              ? Math.round(recurringMed.price!)
              : isVar6399 && discountApplied
              ? Math.round(recurringMed.discounted_price!)
              : Math.round(recurringMed.price!)
          }. 
      Every time your prescription renews (${renewal}), you will be charged $${
            recurringMed.type === 'Preworkout'
              ? recurringMed.discounted_price || recurringMed.price!
              : recurringMed.type === 'Sex + Hair'
              ? Math.round(recurringMed.price!)
              : isVar6399 && discountApplied
              ? Math.round(recurringMed.discounted_price!)
              : Math.round(recurringMed.price!)
          } when your shipment goes out. You can view 
      upcoming shipment dates in the patient portal and it will be automatically updated 
      when your prescription is refilled. You can cancel your automatically renewing 
      prescription delivery by logging into your ${siteName} account and clicking “Profile” 
      in the top right corner and selecting “Manage Membership” in the program details section. 
      Your prescription will renew unless you cancel at least 48 hours before the next refill is processed.`
        : variation7865_2?.variation_name
        ? ''
        : `You can cancel any time through your account.`;

    return oldText;
  }, [
    coaching,
    couponCodeRedeem?.code,
    discountApplied,
    isPreWorkoutTbd,
    isVar6399,
    potentialInsurance,
    recurringMed,
    renewal,
    specificCare,
    termsOfUse,
    variant6471,
    variation7153_01?.variation_name,
    variation7153_05?.variation_name,
  ]);

  if (short) {
    return (
      <Typography>
        You agree to pay $39 now, and, if prescribed medication, $135/month
        thereafter until you cancel, less any credits. Cancel in account
        &#40;manage plan&#41; 48 hours before next charge &#40;
        <Link
          href="https://www.getzealthy.com/consent-to-telehealth"
          target="_blank"
        >
          details
        </Link>
        &#41;. See{' '}
        <Link href="https://www.getzealthy.com/terms-of-use" target="_blank">
          refund policy
        </Link>
      </Typography>
    );
  }

  return (
    <Stack gap="1rem" padding={isMobile ? '0' : '0 0px'} mt="1rem">
      {hasAppointment && showZealthySubscription && (
        <Typography textAlign="center" color="#1B1B1B" variant="h4">
          If you cancel your appointment at least 24 hours in advance you won’t
          be charged a visit fee or co-pay. By clicking “Confirm payment” you
          acknowledge that we may process an authorization hold using your
          payment information.
        </Typography>
      )}
      {showZealthySubscription && (
        <Typography textAlign="center" color="#1B1B1B" variant="h4">
          {`You will be charged $30 for the ${siteName} access fee every 3 months starting ${monthsFromNow(
            3
          )}.`}
        </Typography>
      )}
      <Typography
        textAlign="center"
        color="#1B1B1B"
        variant="h4"
        sx={
          variation7895?.variation_name === 'Variation-2'
            ? { fontSize: '14px', lineHeight: '20px' }
            : {
                fontSize: '0.8rem!important',
                lineHeight: '0.9rem!important',
              }
        }
      >
        {termText}
      </Typography>
      <Typography
        textAlign="center"
        color="#1B1B1B"
        variant="h4"
        padding="0 5px"
        sx={{
          fontSize: '0.8rem!important',
          lineHeight: '0.9rem!important',
        }}
      >
        {language === 'esp'
          ? 'Al enviar su información de pago, usted confirma que ha revisado y aceptado los '
          : `By submitting your payment information, you confirm that you have reviewed and agreed to ${siteName}’s `}
        <Link
          style={{
            textDecoration: 'none',
            color: theme.palette.primary.light,
          }}
          href="https://www.getzealthy.com/terms-of-use/"
          target="_blank"
        >
          {language === 'esp' ? 'terminos de uso' : 'terms of use'}
        </Link>{' '}
        {language === 'esp' ? ' y ' : ' and '}
        <Link
          style={{
            textDecoration: 'none',
            color: theme.palette.primary.light,
          }}
          href="https://www.getzealthy.com/consent-to-telehealth"
          target="_blank"
        >
          {language === 'esp'
            ? ' consentimiento para telesalud '
            : ' consent to telehealth'}
        </Link>
        .
      </Typography>
    </Stack>
  );
};

export default TermsOfUse;
