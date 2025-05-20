import { AppointmentState } from '@/context/AppContext/reducers/types/appointment';
import { SelectedCare } from '@/context/AppContext/reducers/types/visit';

export const mapAppointmentTypeToCare = (
  appointmentType: AppointmentState['appointment_type'],
  selectedCare: SelectedCare
) => {
  if (appointmentType === 'Provider') {
    return (
      selectedCare.careSelections
        .map(r => r.reason)
        .concat(selectedCare.other)
        .filter(Boolean)
        .join(' / ') || 'Primary care'
    );
  } else {
    return `1:1 with ${appointmentType}`;
  }
};
