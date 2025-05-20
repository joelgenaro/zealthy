import doc from 'public/icons/doc.png';
import Clock from '@/components/shared/icons/Clock';
import CalendarOutline from '@/components/shared/icons/CalendarOutline';
import LabTube from '@/components/shared/icons/LabTube';
import Card from '@/components/shared/icons/Card';
import Health from '@/components/shared/icons/Health';
import Form from '@/components/shared/icons/Form';
import HealthCircle from '@/components/shared/icons/HealthCircle';
import Delivery from '@/components/shared/icons/Delivery';
import User from '@/components/shared/icons/User';
import ListIcon from '@/components/shared/icons/List';
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
  // {
  //   head: 'Document upload',
  //   body: 'Upload lab work, pharmacy benefits, insurance, and other information.',
  //   icon: UploadIcon,
  //   path: Pathnames.PATIENT_PORTAL_DOCUMENTS,
  // },
];

export const actionItems = [
  {
    head: 'Schedule a follow-up appointment',
    body: 'We want to meet with you! Please go ahead and reschedule your visit.',
    icon: Clock,
  },
  {
    head: 'Reschedule Zealthy visit',
    body: 'Your Zealthy provider requested you schedule a follow-up during your last visit.',
    icon: CalendarOutline,
  },
  {
    head: 'Schedule lab work or upload recent labs',
    body: 'Zealthy ordered lab work for you. Schedule an appointment at a Quest or Labcorp location near you, or upload recent lab work that you completed.',
    icon: LabTube,
    path: Pathnames.LAB_WORK,
  },
  {
    head: 'Please update payment method',
    body: 'Your card information is no longer valid. To continue your Zealthy membership, please update your payment method.',
    icon: Card,
  },
  {
    head: 'Please update insurance information',
    body: 'Your insurance information appears to be inactive. If it recently changed, please update here.',
    icon: Health,
  },
  {
    head: 'Complete your anxiety or depression check-in',
    body: 'It’s time for your anxiety or depression check-in. Please help us stay on top of your mental health journey.',
    icon: Form,
  },
  {
    head: 'Establish primary care with Zealthy',
    body: 'Did you know that we can become your primary care provider? Schedule your first video visit with a Zealthy provider to get fully onboarded.',
    icon: HealthCircle,
  },
  // {
  //   head: 'Document upload',
  //   body: 'Upload lab work, pharmacy benefits, insurance, and other information.',
  //   icon: UploadIcon,
  //   path: Pathnames.PATIENT_PORTAL_DOCUMENTS,
  // },
];

export const getCare = [
  {
    head: 'Messages',
    body: 'Feel free to message with our virtual care team 24/7 and get answers.',
    icon: MessageV2,
    path: Pathnames.MESSAGES,
  },
  // {
  //   head: 'Medication, prescription renewals & delivery',
  //   // body: 'Review your medication prescription requests and medications orders, including Rx being shipped to your home or sent to a pharmacy near you.',
  //   body: 'Manage prescriptions, request renewals, and track the delivery of medications.',
  //   icon: Delivery,
  //   path: Pathnames.PRESCRIPTION_ORDERS,
  // },
  {
    head: 'My health',
    body: 'View lab results, past appointments, vitals, and request records.',
    icon: ListIcon,
    path: Pathnames.PATIENT_PORTAL_MY_HEALTH,
  },
  {
    head: 'Personal information',
    body: 'Update insurance, billing, password, and more.',
    icon: User,
    path: Pathnames.PATIENT_PORTAL_PROFILE,
  },
];

export const getCareWeightLoss = [
  {
    head: 'Messages',
    body: 'Feel free to message with our virtual care team 24/7 and get answers.',
    icon: MessageV2,
    path: Pathnames.MESSAGES,
  },
  {
    head: 'Medication, prescription renewals & delivery',
    body: 'Review your medication prescription requests and medications orders, including Rx being shipped to your home or sent to a pharmacy near you.',
    icon: Delivery,
    path: Pathnames.PRESCRIPTION_ORDERS,
  },
  {
    head: 'My health',
    body: 'View medical document history and treatments plans.',
    icon: ListIcon,
    path: Pathnames.PATIENT_PORTAL_MY_HEALTH,
  },
  {
    head: 'Personal information',
    body: 'Update insurance, billing, password, and more.',
    icon: User,
    path: Pathnames.PATIENT_PORTAL_PROFILE,
  },
];
