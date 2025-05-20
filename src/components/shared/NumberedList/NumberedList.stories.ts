import type { Meta, StoryObj } from '@storybook/react';
import NumberedList from './index';

const meta: Meta<typeof NumberedList> = {
  title: 'Components/Numbered List',
  component: NumberedList,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NumberedList>;

export const Default: Story = {
  args: {
    items: [
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
