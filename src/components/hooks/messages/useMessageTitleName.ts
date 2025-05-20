import { useMemo } from 'react';
import { CareTeamGroup } from '@/utils/careTeamGroups';

// TODO: move to /types. Is there already a type for clinician or profiles?
interface ClinicianI {
  type: string[];
  profiles: {
    first_name: string;
    last_name: string;
    prefix: string;
  };
}

interface UseMessageTitleNameProps {
  isGroupMessage: boolean;
  members: any[];
  messageGroupName: CareTeamGroup | null;
  clinician: ClinicianI;
}

// TODO: move to utils and consolidate with getClinicianTitle and getClinicianAlias?
const getClinicianName = (clinician: ClinicianI): string => {
  const profile = clinician?.profiles;

  const name = [];

  const prefix = profile?.prefix;
  const firstName = profile?.first_name;
  const lastName = profile?.last_name.slice(0, 1);
  const type = clinician?.type[0]?.replace(/ *\([^)]*\) */g, '');

  if (prefix) name.push(prefix);
  if (firstName) name.push(firstName);
  if (lastName) name.push(lastName);

  let nameStr = name.join(' ');
  if (type) nameStr += `., ${type}`;

  return nameStr;
};

export const useMessageTitleName = ({
  isGroupMessage,
  members,
  messageGroupName,
  clinician,
}: UseMessageTitleNameProps): string => {
  const messageTitleName = useMemo(() => {
    if (
      isGroupMessage ||
      members?.length > 1 ||
      messageGroupName === 'Sleep Support'
    ) {
      return messageGroupName ?? '';
    } else {
      return getClinicianName(clinician);
    }
  }, [isGroupMessage, members, messageGroupName, clinician]);

  return messageTitleName;
};

export default useMessageTitleName;
