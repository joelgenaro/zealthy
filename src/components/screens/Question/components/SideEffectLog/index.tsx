import { useEffect, useState } from 'react';
import { useAnswerSelect } from '@/components/hooks/useAnswer';
import {
  usePatientCareTeam,
  usePatient,
  useCreateProviderTask,
} from '@/components/hooks/data';
import axios from 'axios';
import ErrorMessage from '@/components/shared/ErrorMessage';
import {
  CodedAnswer,
  FreeTextAnswer,
} from '@/context/AppContext/reducers/types/answer';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';

type Answer = CodedAnswer & FreeTextAnswer;

const SideEffectLog = () => {
  const supabase = useSupabaseClient<Database>();
  const [error, setError] = useState('');
  const { data: patientCareTeam } = usePatientCareTeam();
  const { data: patient } = usePatient();
  const handleCreateTask = useCreateProviderTask();

  const answers = useAnswerSelect(answers =>
    Object.values(answers).map(question => question)
  );

  async function appendData() {
    const provider = patientCareTeam?.find(t => t?.role?.includes('Provider'));
    await axios.post('/api/google/append-spreadsheet-data', {
      sheetId: '17nyHvs9xINQCfYcz1OrJP8pfD9cZgkaPjrNOF4OQZ9M',
      range: 'Sheet1!A1:B1',
      data: [`${provider?.clinician?.profiles?.email}`],
    });
  }
  async function sendMessageToProviders() {
    let message = '';
    const sendMessage =
      answers[answers.length - 2].answer[0].valueCoding.display === 'Yes';

    Object.values(answers).map((question, index) => {
      const answer = question.answer[0] as Answer;
      // skip third question - not required on message
      const questionText = question.text + '. ';
      let patientAnswer = '';

      if (answer.valueCoding) {
        patientAnswer = answer.valueCoding.display + '. ';
      } else if (answer?.valueString) {
        patientAnswer = answer.valueString + '. ';
      }

      message += questionText + patientAnswer;
    });

    if (patientCareTeam && sendMessage) {
      let careTeam = patientCareTeam.find(team =>
        team.clinician.type?.some(type =>
          [
            'Provider (MD or DO)',
            'Provider (NP or PA)',
            'Provider (PMHNP)',
          ].includes(type)
        )
      );

      if (!careTeam) {
        careTeam = patientCareTeam[0];
      }

      if (careTeam?.clinician && patient) {
        const taskType = 'SIDE_EFFECT';
        const note = `Patient has reported side effect: ${message}`;
        await handleCreateTask(taskType, note);
        await appendData();
      }
    }
  }

  useEffect(() => {
    if (patientCareTeam) {
      sendMessageToProviders();
    }
  }, [patientCareTeam]);

  return <>{error ? <ErrorMessage>{error}</ErrorMessage> : null}</>;
};

export default SideEffectLog;
