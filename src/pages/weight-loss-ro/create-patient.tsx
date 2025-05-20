import Loading from '@/components/shared/Loading/Loading';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import Head from 'next/head';
import { ReactElement, useEffect } from 'react';
import {
  usePatientAsync,
  usePatientState,
} from '@/components/hooks/usePatient';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import {
  useAddWeightLog,
  useUpdatePatient,
} from '@/components/hooks/mutations';
import { format } from 'date-fns';

const CreatePatient = () => {
  const { createPatient } = usePatientAsync();
  const { mutate: addWeightLog } = useAddWeightLog();
  const updatePatient = useUpdatePatient();
  const patientState = usePatientState();

  useEffect(() => {
    const createPatientAndSaveData = async () => {
      try {
        const storedHeight = sessionStorage.getItem('patientHeight');
        const storedWeight = sessionStorage.getItem('patientWeight');

        await createPatient();

        setTimeout(() => {
          const patientId = patientState.id;

          if (patientId && storedHeight && storedWeight) {
            const height = JSON.parse(storedHeight);
            const weight = JSON.parse(storedWeight);

            updatePatient.mutate({
              height,
              weight,
            });

            addWeightLog({
              weight: weight,
              patient_id: patientId,
              date_logged: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX"),
            });
          }

          Router.push({
            pathname: Pathnames.WEIGHT_LOSS,
            query: {
              variant: Router.query.variant,
              care: Router.query.care,
            },
          });
        }, 500);
      } catch (error) {
        console.error('Error creating patient or saving data:', error);
        Router.push({
          pathname: Pathnames.WEIGHT_LOSS,
          query: {
            variant: Router.query.variant,
            care: Router.query.care,
          },
        });
      }
    };

    createPatientAndSaveData();
  }, [createPatient, addWeightLog, updatePatient, patientState.id]);

  return (
    <>
      <Head>
        <title>Zealthy Visit</title>
      </Head>
      <Loading />
    </>
  );
};

CreatePatient.getLayout = (page: ReactElement) => {
  return <OnboardingLayout>{page}</OnboardingLayout>;
};

export default CreatePatient;
