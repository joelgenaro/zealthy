import { useEffect, useMemo, useState } from 'react';
import { useIntakeState } from '@/components/hooks/useIntake';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { Button, Container, List, ListItem, Typography } from '@mui/material';
import { useCalculateSpecificCare } from '@/components/hooks/useCalculateSpecificCare';
import { useVisitState } from '@/components/hooks/useVisit';
import { useAppointmentSelect } from '@/components/hooks/useAppointment';
import { AppointmentState } from '@/context/AppContext/reducers/types/appointment';
import MarketingQuestion from '../MarketingQuestion';
import {
  useAllPatientPrescriptionRequest,
  useLanguage,
  usePatient,
  useVWOVariationName,
  use85521PatientLogic,
} from '@/components/hooks/data';
import Spinner from '@/components/shared/Loading/Spinner';
import { format } from 'date-fns';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import getConfig from '../../../../../../config';
import { useVWO } from '@/context/VWOContext';

interface ResponsesReviewedProps {
  nextPage: (nextPage?: string) => void;
}

const ResponsesReviewed = ({ nextPage }: ResponsesReviewedProps) => {
  const language = useLanguage();

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  const { data: variation5867 } = useVWOVariationName('5867');
  const { data: variation5483, status: status5483 } =
    useVWOVariationName('5483');

  function getHeader(care?: SpecificCareOption) {
    return care === SpecificCareOption.WEIGHT_LOSS_ACCESS_V2
      ? language === 'esp'
        ? '¡Felicidades! Su visita está confirmada y sus respuestas han sido registradas.'
        : 'Congratulations! Your visit is confirmed and your responses have been recorded.'
      : language === 'esp'
      ? '¡Sus respuestas están siendo revisadas!'
      : 'Your responses are being reviewed!';
  }

  function getBody(care?: SpecificCareOption) {
    return care === SpecificCareOption.WEIGHT_LOSS_ACCESS_V2
      ? language === 'esp'
        ? 'Esto es lo que sigue:'
        : "Here's what's next:"
      : language === 'esp'
      ? `Su proveedor de ${siteName} puede comunicarse con usted si tiene preguntas adicionales. Esto es lo que sigue:`
      : `Your ${siteName} Provider may reach out to you if they have any additional questions. Here's what's next:`;
  }

  function getListItems(
    care?: SpecificCareOption | PotentialInsuranceOption,
    isPatientPortal?: boolean,
    isQuarterlyCompound?: boolean,
    appointment?: AppointmentState,
    weightLossRequestType?: string
  ) {
    const formatDate = (date: string) => {
      return format(new Date(date), "EEEE, d 'de' MMMM");
    };

    switch (care) {
      case PotentialInsuranceOption.WEIGHT_LOSS_SYNC:
        return [
          {
            title:
              language === 'esp'
                ? 'Revisión del proveedor:'
                : 'Provider review:',
            body:
              language === 'esp'
                ? `Tendrá una consulta por video con su proveedor el ${formatDate(
                    appointment?.starts_at || ''
                  )} para desarrollar su plan de tratamiento. Puede enviar mensajes a su proveedor a través del portal de mensajería antes de su visita.`
                : `You'll have a video consultation with your provider on ${formatDate(
                    appointment?.starts_at || ''
                  )} to develop your treatment plan. You can message your provider through the messaging portal before your visit.`,
          },
          {
            title:
              language === 'esp'
                ? 'Emparejamiento con un entrenador:'
                : 'Get matched with coach:',
            body:
              language === 'esp'
                ? `Se le asignará un entrenador de pérdida de peso de ${siteName}. Puede comunicarse con su entrenador en el portal de ${siteName} en cualquier momento.`
                : `You will be matched with a ${siteName} weight loss coach. You can message with your coach in the ${siteName} portal any time.`,
          },
          {
            title:
              language === 'esp'
                ? 'Revise su correo electrónico y SMS:'
                : 'Check your email and SMS:',
            body:
              language === 'esp'
                ? 'Le enviaremos un mensaje si su proveedor tiene alguna pregunta o cuando su plan de tratamiento esté listo.'
                : "We'll send you a message if your Provider has any questions or when your treatment plan is ready.",
          },
          {
            body:
              language === 'esp'
                ? 'Antes de su consulta por video, chatee con su entrenador o coordinador si tiene preguntas sobre qué esperar en las próximas semanas.'
                : 'Before your video consultation, chat with your coach or coordinator if you have questions about what to expect in the coming weeks.',
          },
        ];
      case PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED:
        return [
          {
            title:
              language === 'esp'
                ? 'Revisión del proveedor:'
                : 'Provider review:',
            body:
              language === 'esp'
                ? `Generalmente toma de 1 a 3 días hábiles para que un proveedor de ${siteName} revise sus respuestas y cree un plan de tratamiento para usted.`
                : `It generally takes 1-3 business days for a ${siteName} provider to review your responses and create a treatment plan for you.`,
          },
          {
            title:
              language === 'esp'
                ? 'Rastree el envío de su medicamento a través de nuestro portal:'
                : 'Track your medication shipment through our portal:',
            body:
              language === 'esp'
                ? 'Si se le receta, recibirá su primer mes de medicamento Semaglutide entregado en su puerta. Recibirá esto enviado a su puerta cada mes y su proveedor monitoreará y ajustará su dosis con el tiempo, según sea clínicamente apropiado.'
                : 'If prescribed, you will receive your first month of Semaglutide medication delivered to your door. You will get this shipped to your door every month and your provider will monitor and adjust your dosage over time, as clinically appropriate.',
          },
          {
            title:
              language === 'esp'
                ? 'Revise su correo electrónico y SMS:'
                : 'Check your email and SMS:',
            body:
              language === 'esp'
                ? 'Le enviaremos un mensaje si su proveedor tiene alguna pregunta o cuando su plan de tratamiento esté listo para que lo revise.'
                : "We'll send you a message if your Provider has any questions or when your treatment plan is ready for you to review.",
          },
          {
            body:
              language === 'esp'
                ? 'Mientras espera, chatee con su coordinador si tiene preguntas sobre qué esperar con su plan de tratamiento.'
                : 'While you wait, chat with your coordinator if you have questions about what to expect with your treatment plan.',
          },
        ];
      case PotentialInsuranceOption.TIRZEPATIDE_BUNDLED:
        return [
          {
            title:
              language === 'esp'
                ? 'Revisión del proveedor:'
                : 'Provider review:',
            body:
              language === 'esp'
                ? `Generalmente toma de 1 a 3 días hábiles para que un proveedor de ${siteName} revise sus respuestas y cree un plan de tratamiento para usted.`
                : `It generally takes 1-3 business days for a ${siteName} provider to review your responses and create a treatment plan for you.`,
          },
          {
            title:
              language === 'esp'
                ? 'Rastree el envío de su medicamento a través de nuestro portal:'
                : 'Track your medication shipment through our portal:',
            body:
              language === 'esp'
                ? 'Si se le receta, recibirá su primer mes de medicamento Tirzepatide entregado en su puerta. Recibirá esto enviado a su puerta cada mes y su proveedor monitoreará y ajustará su dosis con el tiempo, según sea clínicamente apropiado.'
                : 'If prescribed, you will receive your first month of Tirzepatide medication delivered to your door. You will get this shipped to your door every month and your provider will monitor and adjust your dosage over time, as clinically appropriate.',
          },
          {
            title:
              language === 'esp'
                ? 'Revise su correo electrónico y SMS:'
                : 'Check your email and SMS:',
            body:
              language === 'esp'
                ? 'Le enviaremos un mensaje si su proveedor tiene alguna pregunta o cuando su plan de tratamiento esté listo para que lo revise.'
                : "We'll send you a message if your Provider has any questions or when your treatment plan is ready for you to review.",
          },
          {
            body:
              language === 'esp'
                ? 'Mientras espera, chatee con su coordinador si tiene preguntas sobre qué esperar con su plan de tratamiento.'
                : 'While you wait, chat with your coordinator if you have questions about what to expect with your treatment plan.',
          },
        ];
      case SpecificCareOption.WEIGHT_LOSS:
        if (appointment?.starts_at) {
          return [
            {
              title:
                language === 'esp'
                  ? 'Revisión del proveedor:'
                  : 'Provider review:',
              body:
                language === 'esp'
                  ? `Tendrá una consulta por video con su proveedor el ${format(
                      new Date(appointment?.starts_at || ''),
                      "EEEE, d 'de' MMMM"
                    )} para desarrollar su plan de tratamiento. Puede enviar mensajes a su proveedor a través del portal de mensajería antes de su visita.`
                  : `You'll have a video consultation with your provider on ${format(
                      new Date(appointment?.starts_at || ''),
                      'EEEE, MMMM do'
                    )} to develop your treatment plan. You can message your provider through the messaging portal before your visit.`,
            },
            {
              title:
                language === 'esp'
                  ? 'Emparejamiento con un entrenador:'
                  : 'Get matched with coach:',
              body:
                language === 'esp'
                  ? `Se le asignará un entrenador de pérdida de peso de ${siteName}. Puede comunicarse con su entrenador en el portal de ${siteName} en cualquier momento.`
                  : `You will be matched with a ${siteName} weight loss coach. You can message with your coach in the ${siteName} portal any time.`,
            },
            {
              title:
                language === 'esp'
                  ? 'Revise su correo electrónico y SMS:'
                  : 'Check your email and SMS:',
              body:
                language === 'esp'
                  ? 'Le enviaremos un mensaje si su proveedor tiene alguna pregunta o cuando su plan de tratamiento esté listo.'
                  : "We'll send you a message if your Provider has any questions or when your treatment plan is ready.",
            },
            {
              body:
                language === 'esp'
                  ? 'Mientras espera, chatee con su entrenador o coordinador si tiene preguntas sobre qué esperar con su plan de tratamiento.'
                  : 'While you wait, chat with your coach or coordinator if you have questions about what to expect with your treatment plan.',
            },
          ];
        } else if (isQuarterlyCompound) {
          return [
            {
              title:
                language === 'esp'
                  ? 'Revisión del proveedor:'
                  : 'Provider review:',
              body:
                language === 'esp'
                  ? `Generalmente toma de 1 a 3 días hábiles para que su proveedor de ${siteName} revise sus respuestas y proporcione nuevas instrucciones de dosificación.`
                  : `It generally takes 1-3 business days for your ${siteName} provider to review your responses and provide new dosage instructions.`,
            },
            {
              title:
                language === 'esp'
                  ? 'Revise su correo electrónico y SMS:'
                  : 'Check your email and SMS:',
              body:
                language === 'esp'
                  ? 'Le enviaremos un mensaje si su proveedor tiene alguna pregunta.'
                  : "We'll send you a message if your Provider has any questions.",
            },
            {
              body:
                language === 'esp'
                  ? 'Mientras espera, chatee con su entrenador o coordinador si tiene preguntas sobre qué esperar con sus instrucciones de dosificación actualizadas.'
                  : 'While you wait, chat with your coach or coordinator if you have questions about what to expect with your updated dosage instructions.',
            },
          ];
        } else if (isPatientPortal) {
          return [
            {
              title:
                language === 'esp'
                  ? 'Revisión del proveedor:'
                  : 'Provider review:',
              body:
                language === 'esp'
                  ? `Generalmente toma de 1 a 3 días hábiles para que su proveedor de ${siteName} revise sus respuestas y desarrolle un plan de tratamiento.`
                  : `It generally takes 1-3 business days for your ${siteName} provider to review your responses and develop a treatment plan.`,
            },
            {
              title:
                language === 'esp'
                  ? 'Revise su correo electrónico y SMS:'
                  : 'Check your email and SMS:',
              body:
                language === 'esp'
                  ? 'Le enviaremos un mensaje si su proveedor tiene alguna pregunta o cuando su plan de tratamiento esté listo.'
                  : "We'll send you a message if your Provider has any questions or when your treatment plan is ready.",
            },
            {
              body:
                language === 'esp'
                  ? 'Mientras espera, chatee con su entrenador o coordinador si tiene preguntas sobre qué esperar con su plan de tratamiento.'
                  : 'While you wait, chat with your coach or coordinator if you have questions about what to expect with your treatment plan.',
            },
          ];
        } else if (weightLossRequestType === 'BOTH') {
          return [
            {
              title:
                language === 'esp'
                  ? 'Revisión del proveedor:'
                  : 'Provider review:',
              body:
                language === 'esp'
                  ? `Generalmente toma de 1 a 3 días hábiles para que su proveedor de ${siteName} revise sus respuestas y desarrolle un plan de tratamiento.`
                  : `It generally takes 1-3 business days for your ${siteName} provider to review your responses and develop a treatment plan.`,
            },
            {
              title:
                language === 'esp'
                  ? 'Receta enviada y proceso de aprobación del seguro iniciado:'
                  : 'Rx shipped & insurance approval process initiated:',
              body:
                language === 'esp'
                  ? `Si es clínicamente apropiado, su primer pedido de medicamento será enviado a su puerta. Su equipo de coordinación también comenzará el proceso simplificado de ${siteName} para obtener la aprobación de su receta.`
                  : `If clinically appropriate, your first order of medication will be shipped to your door. Your coordination team will also begin ${siteName}'s streamlined process to get your Rx approved.`,
            },
            {
              title:
                language === 'esp'
                  ? 'Emparejamiento con un entrenador:'
                  : 'Get matched with coach:',
              body:
                language === 'esp'
                  ? `Se le asignará un entrenador de pérdida de peso de ${siteName}. Puede comunicarse con su entrenador en el portal de ${siteName} en cualquier momento.`
                  : `You will be matched with a ${siteName} weight loss coach. You can message with your coach in the ${siteName} portal any time.`,
            },
            {
              title:
                language === 'esp'
                  ? 'Revise su correo electrónico y SMS:'
                  : 'Check your email and SMS:',
              body:
                language === 'esp'
                  ? 'Le enviaremos un mensaje si su proveedor tiene alguna pregunta o cuando su plan de tratamiento esté listo.'
                  : "We'll send you a message if your Provider has any questions or when your treatment plan is ready.",
            },
            {
              body:
                language === 'esp'
                  ? 'Mientras espera, chatee con su entrenador o coordinador si tiene preguntas sobre qué esperar con su plan de tratamiento.'
                  : 'While you wait, chat with your coach or coordinator if you have questions about what to expect with your treatment plan.',
            },
          ];
        } else if (weightLossRequestType === 'COMPOUND_ONLY') {
          return [
            {
              title:
                language === 'esp'
                  ? 'Revisión del proveedor:'
                  : 'Provider review:',
              body:
                language === 'esp'
                  ? `Generalmente toma de 1 a 3 días hábiles para que su proveedor de ${siteName} revise sus respuestas y desarrolle un plan de tratamiento.`
                  : `It generally takes 1-3 business days for your ${siteName} provider to review your responses and develop a treatment plan.`,
            },
            {
              title: language === 'esp' ? 'Receta enviada:' : 'Rx shipped:',
              body:
                language === 'esp'
                  ? 'Si es clínicamente apropiado, su primer pedido de medicamento será enviado a su puerta.'
                  : 'If clinically appropriate, your first order of medication will be shipped to your door.',
            },
            {
              title:
                language === 'esp'
                  ? 'Emparejamiento con un entrenador:'
                  : 'Get matched with coach:',
              body:
                language === 'esp'
                  ? `Se le asignará un entrenador de pérdida de peso de ${siteName}. Puede comunicarse con su entrenador en el portal de ${siteName} en cualquier momento.`
                  : `You will be matched with a ${siteName} weight loss coach. You can message with your coach in the ${siteName} portal any time.`,
            },
            {
              title:
                language === 'esp'
                  ? 'Revise su correo electrónico y SMS:'
                  : 'Check your email and SMS:',
              body:
                language === 'esp'
                  ? 'Le enviaremos un mensaje si su proveedor tiene alguna pregunta o cuando su plan de tratamiento esté listo.'
                  : "We'll send you a message if your Provider has any questions or when your treatment plan is ready.",
            },
            {
              body:
                language === 'esp'
                  ? 'Mientras espera, chatee con su entrenador o coordinador si tiene preguntas sobre qué esperar con su plan de tratamiento.'
                  : 'While you wait, chat with your coach or coordinator if you have questions about what to expect with your treatment plan.',
            },
          ];
        } else if (weightLossRequestType === 'INSURANCE_SKIP') {
          return [
            {
              title:
                language === 'esp'
                  ? 'Revisión del proveedor:'
                  : 'Provider review:',
              body:
                language === 'esp'
                  ? `Generalmente toma de 1 a 3 días hábiles para que su proveedor de ${siteName} revise sus respuestas y desarrolle un plan de tratamiento.`
                  : `It generally takes 1-3 business days for your ${siteName} provider to review your responses and develop a treatment plan.`,
            },
            {
              title:
                language === 'esp'
                  ? 'Emparejamiento con un entrenador:'
                  : 'Get matched with coach:',
              body:
                language === 'esp'
                  ? `Se le asignará un entrenador de pérdida de peso de ${siteName}. Puede comunicarse con su entrenador en el portal de ${siteName} en cualquier momento.`
                  : `You will be matched with a ${siteName} weight loss coach. You can message with your coach in the ${siteName} portal any time.`,
            },
            {
              title:
                language === 'esp'
                  ? 'Revise su correo electrónico y SMS:'
                  : 'Check your email and SMS:',
              body:
                language === 'esp'
                  ? 'Le enviaremos un mensaje si su proveedor tiene alguna pregunta o cuando su plan de tratamiento esté listo.'
                  : "We'll send you a message if your Provider has any questions or when your treatment plan is ready.",
            },
            {
              body:
                language === 'esp'
                  ? 'Mientras espera, chatee con su entrenador o coordinador si tiene preguntas sobre qué esperar con su plan de tratamiento.'
                  : 'While you wait, chat with your coach or coordinator if you have questions about what to expect with your treatment plan.',
            },
          ];
        } else if (weightLossRequestType === 'REGULAR_ONLY') {
          return [
            {
              title:
                language === 'esp'
                  ? 'Revisión del proveedor:'
                  : 'Provider review:',
              body:
                language === 'esp'
                  ? `Generalmente toma de 1 a 3 días hábiles para que su proveedor de ${siteName} revise sus respuestas y desarrolle un plan de tratamiento.`
                  : `It generally takes 1-3 business days for your ${siteName} provider to review your responses and develop a treatment plan.`,
            },
            {
              title:
                language === 'esp'
                  ? 'Proceso de aprobación del seguro iniciado:'
                  : 'Insurance approval process initiated:',
              body:
                language === 'esp'
                  ? `Si es clínicamente apropiado, su equipo de coordinación comenzará el proceso simplificado de ${siteName} para obtener la aprobación de su receta.`
                  : `If clinically appropriate, your coordination team will begin ${siteName}'s streamlined process to get your Rx approved.`,
            },
            {
              title:
                language === 'esp'
                  ? 'Emparejamiento con un entrenador:'
                  : 'Get matched with coach:',
              body:
                language === 'esp'
                  ? `Se le asignará un entrenador de pérdida de peso de ${siteName}. Puede comunicarse con su entrenador en el portal de ${siteName} en cualquier momento.`
                  : `You will be matched with a ${siteName} weight loss coach. You can message with your coach in the ${siteName} portal any time.`,
            },
            {
              title:
                language === 'esp'
                  ? 'Revise su correo electrónico y SMS:'
                  : 'Check your email and SMS:',
              body:
                language === 'esp'
                  ? 'Le enviaremos un mensaje si su proveedor tiene alguna pregunta o cuando su plan de tratamiento esté listo.'
                  : "We'll send you a message if your Provider has any questions or when your treatment plan is ready.",
            },
            {
              body:
                language === 'esp'
                  ? 'Mientras espera, chatee con su entrenador o coordinador si tiene preguntas sobre qué esperar con su plan de tratamiento.'
                  : 'While you wait, chat with your coach or coordinator if you have questions about what to expect with your treatment plan.',
            },
          ];
        } else {
          return [
            {
              title:
                language === 'esp'
                  ? 'Revisión del proveedor:'
                  : 'Provider review:',
              body:
                language === 'esp'
                  ? `Generalmente toma de 1 a 3 días hábiles para que su proveedor de ${siteName} revise sus respuestas y desarrolle un plan de tratamiento.`
                  : `It generally takes 1-3 business days for your ${siteName} provider to review your responses and develop a treatment plan.`,
            },
            {
              title:
                language === 'esp'
                  ? 'Emparejamiento con un entrenador:'
                  : 'Get matched with coach:',
              body:
                language === 'esp'
                  ? `Se le asignará un entrenador de pérdida de peso de ${siteName}. Puede comunicarse con su entrenador en el portal de ${siteName} en cualquier momento.`
                  : `You will be matched with a ${siteName} weight loss coach. You can message with your coach in the ${siteName} portal any time.`,
            },
            {
              title:
                language === 'esp'
                  ? 'Revise su correo electrónico y SMS:'
                  : 'Check your email and SMS:',
              body:
                language === 'esp'
                  ? 'Le enviaremos un mensaje si su proveedor tiene alguna pregunta o cuando su plan de tratamiento esté listo.'
                  : "We'll send you a message if your Provider has any questions or when your treatment plan is ready.",
            },
            {
              body:
                language === 'esp'
                  ? 'Mientras espera, chatee con su entrenador o coordinador si tiene preguntas sobre qué esperar con su plan de tratamiento.'
                  : 'While you wait, chat with your coach or coordinator if you have questions about what to expect with your treatment plan.',
            },
          ];
        }
      case SpecificCareOption.WEIGHT_LOSS_ACCESS_V2:
        return [
          {
            title:
              language === 'esp'
                ? 'Emparejamiento con un entrenador:'
                : 'Get matched with coach:',
            body:
              language === 'esp'
                ? `Se le asignará un entrenador de pérdida de peso de ${siteName}. Puede comunicarse con su entrenador en el portal de ${siteName} en cualquier momento.`
                : `You will be matched with a ${siteName} weight loss coach. You can message with your coach in the ${siteName} portal any time.`,
          },
          {
            title:
              language === 'esp'
                ? 'Complete su visita:'
                : 'Complete your visit:',
            body:
              language === 'esp'
                ? 'Le enviaremos un mensaje si su proveedor tiene alguna pregunta o cuando su plan de tratamiento esté listo para que lo revise.'
                : "We'll send you a message if your Provider has any questions or when your treatment plan is ready for you to review.",
          },
          {
            title:
              language === 'esp'
                ? 'Obtenga medicamento GLP-1 (si es apropiado):'
                : 'Get GLP-1 medication (if appropriate):',
            body:
              language === 'esp'
                ? 'Le ayudaremos a obtener su medicamento GLP-1 ya sea a través de su plan de seguro o, si no está cubierto, a través de opciones asequibles de semaglutida o tirzepatida compuesta.'
                : "We'll help you get your GLP-1 medication either via your insurance plan or, if not covered, through affordable compound semaglutide or tirzepatide options.",
          },
          {
            body:
              language === 'esp'
                ? 'Mientras espera, chatee con su entrenador o coordinador si tiene preguntas sobre qué esperar en las próximas semanas.'
                : 'While you wait, chat with your coach or coordinator if you have questions about what to expect in the coming weeks.',
          },
        ];

      default:
        return [
          {
            title:
              language === 'esp'
                ? 'Revisión del proveedor:'
                : 'Provider review:',
            body:
              language === 'esp'
                ? `Generalmente toma de 1 a 3 días hábiles para que su proveedor de ${siteName} revise sus respuestas y renueve su medicamento.`
                : `It generally takes 1-3 business days for your ${siteName} provider to review your responses and refill your medication.`,
          },
          {
            title:
              language === 'esp'
                ? 'Revise su correo electrónico y SMS:'
                : 'Check your email and SMS:',
            body:
              language === 'esp'
                ? 'Le enviaremos un mensaje si su proveedor tiene alguna pregunta o cuando su recarga esté lista en su farmacia.'
                : "We'll send you a message if your Provider has any questions or when your refill is ready at your pharmacy.",
          },
          {
            body:
              language === 'esp'
                ? 'Mientras espera, chatee con su entrenador o coordinador si tiene preguntas sobre qué esperar con su recarga.'
                : 'While you wait, chat with your coach or coordinator if you have questions about what to expect with your refill.',
          },
        ];
    }
  }

  const supabase = useSupabaseClient();
  const { data: patient } = usePatient();
  const { data: prescriptionRequests, isLoading } =
    useAllPatientPrescriptionRequest();
  const { data: variation6337 } = useVWOVariationName('6337');
  const { data: variation5871 } = useVWOVariationName('5871_new');
  const { specificCare, potentialInsurance } = useIntakeState();
  const isPatientPortal =
    window && window.location.pathname.includes('patient-portal');
  const [showMarketingQuestion, setShowMarketingQuestion] = useState(
    !isPatientPortal
  );
  const { questionnaires } = useVisitState();
  const appointment = useAppointmentSelect(appointments =>
    appointments.find(a => a.appointment_type === 'Provider')
  );

  const vwoContext = useVWO();
  const variation8552 = vwoContext.getVariationName(
    '8552',
    String(patient?.id)
  );
  const { data: data85521 } = use85521PatientLogic();

  useEffect(() => {
    if (
      data85521?.is85521 &&
      variation8552 === 'Variation-1' &&
      ['TX', 'UT', 'VA', 'WA', 'WI'].includes(patient?.region || '')
    ) {
      sessionStorage.setItem('showExclusiveOffer', 'true');
    }
  }, [data85521, variation8552]);

  const weightLossRequestType = useMemo(() => {
    if (!prescriptionRequests) {
      return undefined;
    }
    if (
      prescriptionRequests &&
      prescriptionRequests.filter(p => !!p.specific_medication).length > 1 &&
      !patient?.insurance_skip
    ) {
      return 'BOTH';
    }
    if (prescriptionRequests.some(p => p.medication_quantity_id === 98)) {
      return 'COMPOUND_ONLY';
    }
    if (patient?.insurance_skip) {
      return 'INSURANCE_SKIP';
    }

    return 'REGULAR_ONLY';
  }, [prescriptionRequests, patient?.insurance_skip]);

  const listItems = getListItems(
    potentialInsurance || specificCare || undefined,
    isPatientPortal,
    questionnaires.some(
      q => q.name === 'weight-loss-compound-quarterly-refill'
    ),
    appointment,
    weightLossRequestType
  );
  const calculatedSpecificCare = useCalculateSpecificCare();

  useEffect(() => {
    if (
      specificCare == 'Weight loss' ||
      calculatedSpecificCare == 'Weight loss'
    ) {
      window.freshpaint?.track('weight-loss-post-checkout-responses-reviewed');
    }
  }, [calculatedSpecificCare, specificCare]);

  useEffect(() => {
    window.freshpaint?.track('post-checkout-responses-reviewed');
  }, []);
  useEffect(() => {
    // Prevent navigating back using browser's back button
    const handlePopstate = () => {
      // Revert the navigation attempt by going forward again
      window.history.forward();
    };

    // Attach the event listener when the component mounts
    window.addEventListener('popstate', handlePopstate);
    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, []);
  const handleNextPage = async () => {
    if (variation5871?.variation_name === 'Variation-1') {
      Router.push(Pathnames.PATIENT_PORTAL);
    } else if (variation5867?.variation_name === 'Variation-1') {
      Router.push(Pathnames.WHATS_NEXT_5867);
    } else {
      nextPage();
    }
  };

  return (
    <Container maxWidth="xs">
      {isLoading ? (
        <Spinner />
      ) : showMarketingQuestion ? (
        <MarketingQuestion onContinue={() => setShowMarketingQuestion(false)} />
      ) : (
        <>
          <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
            {getHeader(specificCare || SpecificCareOption.DEFAULT)}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: '2rem' }}>
            {getBody(specificCare || SpecificCareOption.DEFAULT)}
          </Typography>
          <List
            sx={{
              listStyleType: 'disc',
              pl: 3,
              marginBottom: '3rem',
            }}
            disablePadding
          >
            {listItems.map((item, index) => (
              <ListItem key={index} sx={{ display: 'list-item', padding: 0 }}>
                <Typography>
                  {item.title && <b>{`${item.title} `}</b>}
                  {item.body}
                </Typography>
              </ListItem>
            ))}
          </List>
          <Button type="button" fullWidth onClick={handleNextPage}>
            {language === 'esp' ? 'Continuar' : 'Continue'}
          </Button>
        </>
      )}
    </Container>
  );
};

export default ResponsesReviewed;
