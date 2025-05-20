import { useMemo } from 'react';

interface UseIsOutOfOfficeProps {
  isGroupMessage: boolean;
  status: string | undefined;
}

export const useIsOutOfOffice = ({
  isGroupMessage,
  status,
}: UseIsOutOfOfficeProps): boolean => {
  const isOutOfOffice = useMemo(() => {
    if (isGroupMessage) {
      return false;
    }

    return status === 'OUT_OF_OFFICE';
  }, [isGroupMessage, status]);
  return isOutOfOffice;
};

export default useIsOutOfOffice;
