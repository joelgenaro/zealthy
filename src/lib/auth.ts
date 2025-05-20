import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { ReasonForVisit } from '@/context/AppContext/reducers/types/visit';
import { IntakeType } from '@/utils/getIntakesForVisit-v2';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { GetServerSidePropsContext } from 'next';
import { Database } from './database.types';
import VWOClient from '@/lib/vwo/client';

const VISIT_QUERY = `
  id,
  status,
  isSync: synchronous,
  careSelected: reason_for_visit(id, reason, synchronous),
  intakes,
  potential_insurance,
  specific_care,
  variant,
  paid_at
`;

type Subscription = Database['public']['Tables']['subscription']['Row'];
type PatientSubscription =
  Database['public']['Tables']['patient_subscription']['Row'];
type PatientSubscriptionType = Omit<
  PatientSubscription,
  | 'welcome_message_sent'
  | 'assigned_coordinator_id'
  | 'coordinator_assigned_at'
  | 'completed_at'
  | 'queue_id'
  | 'scheduled_for_cancelation_at'
>;

export type PatientSubscriptionProps = PatientSubscriptionType & {
  subscription: Subscription;
};

type OnlineVisit = {
  id: number;
  status: Database['public']['Tables']['online_visit']['Row']['status'];
  isSync: boolean;
  careSelected: ReasonForVisit[];
  intakes: IntakeType[];
  potential_insurance?: PotentialInsuranceOption;
  specific_care?: SpecificCareOption;
  variant?: string;
  paid_at: string;
};

export const getPostCheckoutAuth = async (
  ctx: GetServerSidePropsContext,
  redirect: string = '/login'
) => {
  const allowedMethods = ['GET'];
  ctx.res.setHeader('Allow', allowedMethods.join(', '));

  if (ctx.req.method !== 'GET') {
    const error = new Error(`Method Not Allowed: ${ctx.req.method}`);
    ctx.res.writeHead(405);
    ctx.res.end();
    throw error;
  }
  const supabase = createServerSupabaseClient<Database>(ctx);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const redirectUrl = `${redirect}?redirect=${encodeURIComponent(
      ctx.resolvedUrl
    )}`;

    return {
      redirect: {
        destination: redirectUrl,
        permanent: false,
      },
    };
  }

  const [patient, profile] = await Promise.all([
    supabase
      .from('patient')
      .select('*')
      .eq('profile_id', session.user.id)
      .single()
      .then(({ data }) => data),
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => data),
  ]);

  return {
    props: {
      initialSession: session,
      sessionUser: session.user,
      patient,
      profile,
    },
  };
};

export const getPatientPortalProps = async (
  ctx: GetServerSidePropsContext,
  redirect: string = '/login'
) => {
  const allowedMethods = ['GET'];
  ctx.res.setHeader('Allow', allowedMethods.join(', '));

  if (ctx.req.method !== 'GET') {
    const error = new Error(`Method Not Allowed: ${ctx.req.method}`);
    ctx.res.writeHead(405);
    ctx.res.end();
    throw error;
  }
  const supabase = createServerSupabaseClient<Database>(ctx);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const redirectUrl = `${redirect}?redirect=${encodeURIComponent(
      ctx.resolvedUrl
    )}`;

    return {
      redirect: {
        destination: redirectUrl,
        permanent: false,
      },
    };
  }

  const patient = await supabase
    .from('patient')
    .select('*, profile: profiles(*)')
    .eq('profile_id', session.user.id)
    .single()
    .then(({ data }) => data);

  const profile = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()
    .then(({ data }) => data);

  const [result, medResult] = await Promise.all([
    supabase
      .from('patient_subscription')
      .select(`*, subscription (*)`)
      .eq('patient_id', patient?.id!)
      .eq('visible', true)
      .neq('subscription_id', 5) //exclude patient prescriptions
      .then(({ data }) => data as PatientSubscriptionProps[]),

    supabase
      .from('patient_prescription')
      .select(`*, subscription (*)`)
      .eq('patient_id', patient?.id!)
      .eq('visible', true)
      .then(({ data }) => data as PatientSubscriptionProps[]),
  ]);

  // sort visible subscriptions by created_at with oldest first
  const visibleSubscriptions = [
    ...(result?.length ? result : []),
    ...(medResult?.length ? medResult : []),
  ].sort((a, b) => a.created_at?.localeCompare(b.created_at!) || 0);

  return {
    props: {
      initialSession: session,
      sessionUser: session.user,
      patient,
      profile: patient?.profile || null,
      visibleSubscriptions,
    },
  };
};

export const getAuthProps = async (
  ctx: GetServerSidePropsContext,
  redirect: string = '/login'
) => {
  const allowedMethods = ['GET'];
  ctx.res.setHeader('Allow', allowedMethods.join(', '));

  if (ctx.req.method !== 'GET') {
    const error = new Error(`Method Not Allowed: ${ctx.req.method}`);
    ctx.res.writeHead(405);
    ctx.res.end();
    throw error;
  }
  const supabase = createServerSupabaseClient<Database>(ctx);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const redirectUrl = `${redirect}?redirect=${encodeURIComponent(
      ctx.resolvedUrl
    )}`;

    return {
      redirect: {
        destination: redirectUrl,
        permanent: false,
      },
    };
  }

  const [patient, profile] = await Promise.all([
    supabase
      .from('patient')
      .select('*')
      .eq('profile_id', session.user.id)
      .single()
      .then(({ data }) => data),
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => data),
  ]);

  return {
    props: {
      initialSession: session,
      sessionUser: session.user,
      patient,
      profile: profile,
    },
  };
};

export const getAuthV2Props = async (
  ctx: GetServerSidePropsContext,
  redirect: string = '/login'
) => {
  const allowedMethods = ['GET'];
  ctx.res.setHeader('Allow', allowedMethods.join(', '));

  if (ctx.req.method !== 'GET') {
    const error = new Error(`Method Not Allowed: ${ctx.req.method}`);
    ctx.res.writeHead(405);
    ctx.res.end();
    throw error;
  }
  const supabase = createServerSupabaseClient<Database>(ctx);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const redirectUrl = `${redirect}?redirect=${encodeURIComponent(
      ctx.resolvedUrl
    )}`;

    return {
      redirect: {
        destination: redirectUrl,
        permanent: false,
      },
    };
  }

  const [patient, profile] = await Promise.all([
    supabase
      .from('patient')
      .select('*')
      .eq('profile_id', session.user.id)
      .single()
      .then(({ data }) => data),
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => data),
  ]);

  const [visits] = await Promise.all([
    supabase
      .from('online_visit')
      .select(VISIT_QUERY)
      .eq('patient_id', patient?.id!)
      .neq('status', 'Canceled')
      .order('created_at', { ascending: false })
      .then(({ data }) => (data || []) as OnlineVisit[]),
  ]);

  console.log({ VISITS: visits });

  return {
    props: {
      initialSession: session,
      sessionUser: session.user,
      patient,
      profile: profile,
      visits,
    },
  };
};

export const getUnauthProps = async (
  ctx: GetServerSidePropsContext,
  redirect: string = '/auth-transition'
) => {
  const allowedMethods = ['GET'];
  ctx.res.setHeader('Allow', allowedMethods.join(', '));

  if (ctx.req.method !== 'GET') {
    const error = new Error(`Method Not Allowed: ${ctx.req.method}`);
    ctx.res.writeHead(405);
    ctx.res.end();
    throw error;
  }
  const supabase = createServerSupabaseClient<Database>(ctx);

  const { care: specificCare } = ctx.query;

  const redirectUrl = specificCare
    ? `${redirect}?specificCare=${String(specificCare) || ''}`
    : redirect;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    return {
      redirect: {
        destination: redirectUrl,
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export const getStartedProps = async (ctx: GetServerSidePropsContext) => {
  const allowedMethods = ['GET'];
  ctx.res.setHeader('Allow', allowedMethods.join(', '));

  if (ctx.req.method !== 'GET') {
    const error = new Error(`Method Not Allowed: ${ctx.req.method}`);
    ctx.res.writeHead(405);
    ctx.res.end();
    throw error;
  }
  const supabase = createServerSupabaseClient<Database>(ctx);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    const patient = await supabase
      .from('patient')
      .select('*, profile: profiles(*)')
      .eq('profile_id', session.user.id)
      .single()
      .then(({ data }) => data);

    if (patient?.id)
      return {
        redirect: {
          destination: '/onboarding/complete-profile',
          permanent: false,
        },
      };
  }

  return {
    redirect: {
      destination: '/get-started',
      permanent: false,
    },
  };
};

export const getVideoVisitProps = async (ctx: GetServerSidePropsContext) => {
  const allowedMethods = ['GET'];
  ctx.res.setHeader('Allow', allowedMethods.join(', '));

  if (ctx.req.method !== 'GET') {
    const error = new Error(`Method Not Allowed: ${ctx.req.method}`);
    ctx.res.writeHead(405);
    ctx.res.end();
    throw error;
  }
  const supabase = createServerSupabaseClient<Database>(ctx);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    const [patient, profile, clinician] = await Promise.all([
      supabase
        .from('patient')
        .select('*')
        .eq('profile_id', session.user.id)
        .single()
        .then(({ data }) => data),
      supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => data),
      supabase
        .from('clinician')
        .select('*')
        .eq('profile_id', session.user.id)
        .single()
        .then(({ data }) => data),
    ]);

    if (patient) {
      return {
        props: {
          initialSession: session,
          sessionUser: session.user,
          patient,
          profile: profile,
        },
      };
    }

    if (clinician) {
      return {
        redirect: {
          destination: `https://frontend-next-git-development-zealthy.vercel.app/appointments?id=${clinician.id}`,
          permanent: false,
        },
      };
    }
  }

  const redirectUrl = `/login?redirect=${encodeURIComponent(ctx.resolvedUrl)}`;

  return {
    redirect: {
      destination: redirectUrl,
      permanent: false,
    },
  };
};
