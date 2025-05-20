import type { Meta, StoryObj } from '@storybook/react';
import IntakeQuestion from '.';

const meta: Meta<typeof IntakeQuestion> = {
  title: 'Screens/Intake Question',
  component: IntakeQuestion,
};

export default meta;
type Story = StoryObj<typeof IntakeQuestion>;

export const AllergyQuestion: Story = {
  args: {
    question: 'Do you have any allergies or medication reactions?',
    details:
      'Include any allergies to food, dyes, prescriptions, OTC medicines (e.g. antibiotics, allergy medications), herbs, vitamins, supplements, or anything else.',
    answerOptions: ['Yes', 'No'],
  },
};

export const CardiovascularQuestion: Story = {
  args: {
    question: 'Do you experience any of the following cardiovascular symptoms?',
    answerOptions: [
      'Chest pain when climbing 2 flights of stairs or walking 4 blocks',
      'Chest pain with sexual activity',
      'Unexplained fainting or dizziness',
      'Abnormal heart beats or rhythms',
      'None of the above',
    ],
  },
};
