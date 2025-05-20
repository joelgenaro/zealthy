import type { Meta, StoryObj } from '@storybook/react';
import VisitConfirmation from './VisitConfirmation';

const meta: Meta<typeof VisitConfirmation> = {
  title: 'Screens/VisitConfirmation',
  component: VisitConfirmation,
};

export default meta;
type Story = StoryObj<typeof VisitConfirmation>;

export const FirstStory: Story = {};
