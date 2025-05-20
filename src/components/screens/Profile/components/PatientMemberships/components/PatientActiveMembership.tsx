import WhiteBox from '@/components/shared/layout/WhiteBox';
import Link from '@mui/material/Link';
import { useCallback } from 'react';
import MembershipDetails from '../../MembershipDetails';
import { PatientMembershipProps } from '../types';

const PatientActiveMembership = ({
  subscription,
  onSelect,
}: PatientMembershipProps) => {
  const handleSelect = useCallback(() => {
    onSelect(subscription);
  }, [onSelect, subscription]);

  return (
    <WhiteBox
      padding="24px"
      gap="16px"
      key={subscription.reference_id}
      alignItems="start"
    >
      <MembershipDetails subscription={subscription} />
      <Link
        onClick={handleSelect}
        sx={{
          fontWeight: '600',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        Manage membership
      </Link>
    </WhiteBox>
  );
};

export default PatientActiveMembership;
