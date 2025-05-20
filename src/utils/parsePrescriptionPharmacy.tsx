import { Typography } from '@mui/material';

export function parsePrescriptionPharmacy(pharm: string | null | undefined) {
  if (!pharm) {
    return null;
  }
  const infoPattern =
    /Name: ([^|]+)\|NCPDP ID: (\d+)\|Address: ([^|]+)\|Phone: (\d+)\|Fax: (\d+)/;
  const match = pharm?.match(infoPattern);

  if (match) {
    const name = match[1];
    const id = match[2];
    const address = match[3];
    const phoneNumber = match[4];
    const faxNumber = match[5];
    return { name, id, address, phoneNumber, faxNumber };
  } else {
  }
}

export const formattedPharmacy = (pharm: string | null | undefined) => {
  const pharmacy = parsePrescriptionPharmacy(pharm);

  if (pharmacy) {
    const { name, id, address, phoneNumber, faxNumber } = pharmacy;
    return (
      <>
        <Typography>
          {name}, #{id}
        </Typography>
        <Typography>{address}</Typography>
        <Typography>Phone: {phoneNumber}</Typography>
        <Typography>Fax: {faxNumber}</Typography>
      </>
    );
  }
};
