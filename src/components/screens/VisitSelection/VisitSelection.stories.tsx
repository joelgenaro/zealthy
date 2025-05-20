import type { Meta, StoryObj } from '@storybook/react';
import VisitSelection from './VisitSelection';

const meta: Meta<typeof VisitSelection> = {
  title: 'Screens/Visit Selection',
  component: VisitSelection,
};

export default meta;
type Story = StoryObj<typeof VisitSelection>;

export const FirstStory: Story = {};
