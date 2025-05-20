import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { findCoordinator } from './findCoordinator';
import { updateCareTeam } from './updateCareTeam';
import { findMessageGroup } from './findMessageGroup';
import axios from 'axios';
import { replaceAll } from '@/utils/replaceAll';
import {
  activeMember,
  asyncMentalHealthOnly,
  asyncVisit,
  enclomipheneTestLabPurchasedOnly,
  enclomipheneUploadOwnTestLabOnly,
  skinCareOnly,
  asyncPrep,
  asyncPrepWithTestingKit,
  weightLossFreeConsult,
  variables,
} from '@/constants/welcome-messages';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { getClinicianAlias } from '@/utils/getClinicianAlias';
import Stripe from 'stripe';

type OnlineVisit = Database['public']['Tables']['online_visit']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Patient = {
  status: string;
  canvas_patient_id: string;
  profile: Profile;
};

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  apiVersion: '2022-11-15',
});

export const handleAsynchronousVisitComplete = async (
  visit: OnlineVisit,
  careSelected: string,
  isActiveSubscriber: boolean
) => {
  let careName = 'ED';
  let groupName = 'ED';
  let template = asyncVisit;

  if (careSelected === SpecificCareOption.ASYNC_MENTAL_HEALTH) {
    careName = 'Mental health';
    groupName = 'Mental Health';
    template = asyncMentalHealthOnly;
  } else if (careSelected === SpecificCareOption.BIRTH_CONTROL) {
    groupName = 'Birth Control';
    careName = 'Birth control';
  } else if (careSelected === SpecificCareOption.HAIR_LOSS) {
    groupName = 'Hair Loss';
    careName = 'Hair loss';
  } else if (careSelected === SpecificCareOption.FEMALE_HAIR_LOSS) {
    groupName = 'Hair Loss';
    careName = 'Hair loss';
  } else if (careSelected === SpecificCareOption.PRE_WORKOUT) {
    groupName = 'Performance Protocol';
    careName = 'Preworkout';
  } else if (
    [
      SpecificCareOption.SKINCARE,
      SpecificCareOption.ANTI_AGING,
      SpecificCareOption.MELASMA,
      SpecificCareOption.ACNE,
      SpecificCareOption.ROSACEA,
    ].includes(careSelected as SpecificCareOption)
  ) {
    groupName = 'Skincare';
    careName = 'Skincare';
    template = skinCareOnly;
  } else if (careSelected === SpecificCareOption.ENCLOMIPHENE) {
    groupName = 'Enclomiphene';
    careName = 'Enclomiphene';
    if (visit?.variant === 'lab kit purchased') {
      template = enclomipheneTestLabPurchasedOnly;
    } else {
      template = enclomipheneUploadOwnTestLabOnly;
    }
  } else if (careSelected === SpecificCareOption.ERECTILE_DYSFUNCTION) {
    careName = 'ED';
    groupName = 'ED';
  } else if (careSelected === SpecificCareOption.PREP) {
    careName = 'PrEP';
    groupName = 'PrEP';
    template = asyncPrep;
  } else if (careSelected === SpecificCareOption.SEX_PLUS_HAIR) {
    careName = 'Sex + Hair';
    groupName = 'Sex + Hair';
  } else if (careSelected === SpecificCareOption.SLEEP) {
    careName = 'Sleep Support';
    groupName = 'Sleep Support';
  } else if (careSelected === SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT) {
    careName = 'Weight Loss';
    groupName = 'Weight Loss';
    template = weightLossFreeConsult;
  } else if (careSelected === SpecificCareOption.MENOPAUSE) {
    careName = 'Menopause';
    groupName = 'Menopause';
  } else {
    careName = 'Other';
    groupName = 'Other';
  }

  try {
    const patient = await supabaseAdmin
      .from('patient')
      .select('status, canvas_patient_id, profile: profiles!inner(*)')
      .eq('id', visit.patient_id)
      .single()
      .then(({ data }) => data as Patient | null);

    if (!patient) {
      throw new Error(
        `Could not find patient for id: ${visit.patient_id} for ${careName}`
      );
    }
    if (careSelected === SpecificCareOption.PREP) {
      const { data: invoice, error: invoiceError } = await supabaseAdmin
        .from('invoice')
        .select('*')
        .eq('patient_id', visit.patient_id)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (invoice) {
        const referenceId = invoice.reference_id;
        const stripeInvoice = await stripe.invoices.retrieve(referenceId);
        const amountCharged = stripeInvoice.amount_paid;
        const amountChargedInDollars = amountCharged / 100;
        if (amountChargedInDollars === 199) {
          template = asyncPrepWithTestingKit;
        }
      }
    }

    // find or create weight loss group
    const existingGroup = await findMessageGroup(patient.profile.id, groupName);

    if (!existingGroup) {
      throw new Error(
        `Could not create ${groupName} group for patient: ${visit.patient_id}`
      );
    }

    // find group members
    const groupMembers = await supabaseAdmin
      .from('messages_group_member')
      .select()
      .eq('messages_group_id', existingGroup.id)
      .then(({ data }) => data || []);

    // find care team
    const careTeamMembers = await supabaseAdmin
      .from('patient_care_team')
      .select()
      .eq('patient_id', visit.patient_id)
      .then(({ data }) => data || []);

    // find coordinator
    const coordinator = await findCoordinator(
      careTeamMembers?.find(m => m.role === 'Coordinator')
    );

    // update group members and care team incase they are not added already
    const careTeam = [{ id: coordinator?.clinician?.id, role: 'Coordinator' }];

    // update care team
    await updateCareTeam({
      careTeam,
      currentGroup: groupMembers,
      currentTeam: careTeamMembers,
      patientId: visit.patient_id,
      groupId: existingGroup.id,
    });

    if (isActiveSubscriber) {
      template = activeMember;
      if (careSelected === SpecificCareOption.BIRTH_CONTROL) {
        return;
      }
    }

    const message = replaceAll(template, variables, [
      patient.profile.first_name!,
      getClinicianAlias(coordinator?.clinician?.id)?.split(' ')[0], // defaults/error handles to empty str
      '',
      '',
      '',
      '',
      '',
      '',
      careName,
    ]);

    const finalMessage = {
      sender: `Practitioner/${coordinator?.clinician?.profile_id}`,
      recipient: `Patient/${patient?.profile?.id}`,
      message: message || 'Welcome to Zealthy',
      notify: false,
      groupId: existingGroup?.id,
      initialMessage: true,
      is_phi: false,
    };

    console.log({
      message: `FINAL_MESSAGE`,
      zealthy_patient_id: visit.patient_id,
      zealthy_template: template,
      zealthy_groupId: existingGroup.id,
      zealthy_careName: careName,
    });

    return axios.post(
      ['production', 'preview'].includes(process.env.VERCEL_ENV!)
        ? `https://${process.env.VERCEL_URL}/api/message`
        : process.env.VERCEL_URL + '/api/message',
      {
        data: finalMessage,
      }
    );
  } catch (err) {
    console.error(err);
  }
};
