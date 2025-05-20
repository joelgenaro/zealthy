import doc from 'public/icons/doc.png';
import Phone from '@/components/shared/icons/Phone';
import Delivery from '@/components/shared/icons/Delivery';
import User from '@/components/shared/icons/User';
import { Pathnames } from '@/types/pathnames';
import MessageV2 from '@/components/shared/icons/MessageV2';

export const appointments = [
  {
    head: 'Join [Video] Visit with Dr. Mark Greene',
    body: 'Today at 4:00 PM ET',
    img: doc,
    path: Pathnames.PATIENT_PORTAL_APPOINTMENT + '1',
  },
  {
    head: 'Upcoming [Phone] Visit with Dr. Mark Greene',
    body: 'Wednesday at 4:00 PM ET',
    img: doc,
    path: Pathnames.PATIENT_PORTAL_APPOINTMENT + '2',
  },
];

export const getCare = [
  {
    head: 'Schedule a visit or request a new prescription',
    body: 'Same/next-day appointments over video, phone or message',
    icon: Phone,
    path: Pathnames.CARE_SELECTION,
  },
  {
    head: 'Messages',
    body: 'Feel free to message with our virtual care team 24/7 and get answers',
    icon: MessageV2,
    path: Pathnames.MESSAGES,
  },
  {
    head: 'Medication, prescription renewals & delivery',
    body: 'Review your medication prescription requests and medications orders, including Rx being shipped to your home or sent to a pharmacy near you.',
    icon: Delivery,
    path: Pathnames.MANAGE_PRESCRIPTIONS,
  },
  {
    head: 'Personal information',
    body: 'Update insurance, billing, password, and more',
    icon: User,
    path: Pathnames.PATIENT_PORTAL_PROFILE,
  },
];
