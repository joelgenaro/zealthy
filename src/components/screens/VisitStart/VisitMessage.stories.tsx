import { Button } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import VisitMessage from '.';

const meta: Meta<typeof VisitMessage> = {
  title: 'Screens/Visit Message',
  component: VisitMessage,
};

export default meta;
type Story = StoryObj<typeof VisitMessage>;

export const AsyncVisitStart: Story = {
  render: args => (
    <VisitMessage {...args}>
      <Button onClick={() => console.log('clicked')}>Continue</Button>
    </VisitMessage>
  ),
  args: {
    title: 'Start your asynchronous visit now',
    body: "Here's how it works:",
    listItems: [
      {
        title: 'Answer questions about your health',
        body: 'Tell us about your symptoms, medical history, and lifestyle. This should take 5 to 10 minutes to complete.',
      },
      {
        title: 'Your answers will be sent to your provider for review',
        body: 'Your provider will review this information and determine a treatment plan.',
      },
      {
        title: 'Your provider will follow-up with you',
        body: 'You will receive a notification via email or text when your provider responds and be able to view their recommended treatment plan.',
      },
    ],
  },
};

export const AsyncVisitSummary: Story = {
  args: {
    title: 'Your provider is reviewing your medical questionnaire.',
    body: 'You will receive a notification via text or email when your provider’s recommendations are ready for review.',
    captionText: 'Review in progress',
  },
};
