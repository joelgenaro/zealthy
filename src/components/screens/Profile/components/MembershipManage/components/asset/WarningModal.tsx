import Stack from '@mui/material/Stack';
import Box from '@mui/system/Box';
import React from 'react';
import Typography from '@mui/material/Typography';
import BasicModal from '@/components/shared/BasicModal';
import Image from 'next/image';
import WhiteBox from '@/components/shared/layout/WhiteBox';
import { Button } from '@mui/material';
import { SubscriptionType } from '../../options';
import Router from 'next/router';
import { usePatient, usePatientPriorAuths } from '@/components/hooks/data';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  basePath: string;
  type: SubscriptionType;
}

interface MedInformationProps {
  name: string;
  description: string;
  img: string;
  percentage: number;
  expected: string;
}
[];

const medInformation: MedInformationProps[] = [
  {
    name: 'Semaglutide',
    description: '(Same active ingredient as Ozempic & Wegovy)',
    img: 'https://api.getzealthy.com/storage/v1/object/public/questions/semaglutide-bottle.svg',
    percentage: 5,
    expected: 'expected weight loss every 3 months*',
  },
  {
    name: 'Tirzepatide',
    description: '(Same active ingredient as Mounjaro and Zepbound)',
    img: 'https://api.getzealthy.com/storage/v1/object/public/questions/tirzepatide-bottle.svg',
    percentage: 7,
    expected: 'expected weight loss every 3 months**',
  },
];

const WarningModal = ({ open, onClose, basePath, type }: ModalProps) => {
  const { data: patient } = usePatient();
  const { data: patientPriorAuths } = usePatientPriorAuths();

  const isPAActive =
    patientPriorAuths &&
    patientPriorAuths.length > 0 &&
    patientPriorAuths.some(pa => !['PA Denied'].includes(pa.status || ''));

  return (
    <BasicModal isOpen={open} onClose={onClose}>
      <Stack gap="16px" textAlign="center">
        <Typography
          variant="h2"
          fontSize="20px !important"
          lineHeight="25px !important"
        >
          You’re so close to achieving lasting weight loss. Are you sure you
          want to quit now?
        </Typography>
        <Typography textAlign="center" variant="h4" color="#000">
          In order to order semaglutide or tirzepatide, you need to have an
          active Weight Loss membership, which covers your provider developing
          your GLP-1 treatment plan
        </Typography>
        {!patient?.insurance_skip && isPAActive ? (
          <Typography textAlign="center" variant="h4" color="#000" mb={2}>
            Also, note that, if you received a prior authorization to have GLP-1
            medication from us, we must cancel your prior authorization if you
            cancel your membership since your care team will not be able to
            monitor your treatment plan appropriately.
          </Typography>
        ) : null}
        <Box display="flex" sx={{ gap: '0.5rem' }}>
          {medInformation.map((med, idx) => (
            <WhiteBox
              key={idx}
              sx={{
                padding: '10px',
                borderRadius: '',
                borderLeft: '2px solid #8ACDA0',
              }}
            >
              <Box display="flex" justifyContent="space-between">
                <Stack>
                  <Typography fontWeight={700}>{med.name}</Typography>
                  <Typography
                    variant="h4"
                    fontSize="0.7rem!important"
                    fontStyle="italic"
                  >
                    {med.description}
                  </Typography>
                </Stack>
                <Image alt={med.name} src={med.img} width={50} height={50} />
              </Box>
              <Box display="flex" sx={{ gap: '0.2rem' }}>
                <Typography
                  variant="h2"
                  sx={{ color: '#00872B' }}
                >{`${med.percentage}%`}</Typography>
                <Typography fontSize="0.9rem!important">
                  {med.expected}
                </Typography>
              </Box>
            </WhiteBox>
          ))}
        </Box>
        <Button
          size="small"
          onClick={() =>
            Router.push('/patient-portal/weight-loss-treatment/compound')
          }
        >
          Order compound GLP-1
        </Button>
        <Button
          size="small"
          color="grey"
          href={`${basePath}?page=${
            type === 'weight loss' ? 'weight-loss' : 'free-month-weight-loss'
          }`}
        >
          Continue to cancel
        </Button>
        <Stack sx={{ textAlign: 'start' }} gap="0.6rem">
          <Typography variant="h4" fontStyle="italic">
            *This is based on data from a 2022 study published in the American
            Medical Association titled “Weight Loss Outcomes Associated With
            Semaglutide Treatment for Patients with Overweight or Obesity.”
          </Typography>
          <Typography variant="h4" fontStyle="italic">
            **This is based on data from a 2022 study published in the New
            England Journal of Medicine titled “Tirzepatide Once Weekly for the
            Treatment of Obesity.”
          </Typography>
        </Stack>
      </Stack>
    </BasicModal>
  );
};

export default WarningModal;
