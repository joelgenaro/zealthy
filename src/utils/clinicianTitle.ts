interface AbleToTitle {
  type: string[];
  profiles: {
    first_name: string | null;
    last_name: string | null;
  };
}

export const clinicianTitle = <T extends AbleToTitle>(clinician: T) => {
  const isDoctor = !!clinician?.type?.find(type => type.includes('MD or DO'));
  return `${isDoctor ? 'Dr.' : ''} ${clinician?.profiles?.first_name} ${
    clinician?.profiles?.last_name
  }`;
};
