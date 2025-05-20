import type { Meta, StoryObj } from '@storybook/react';
import LogIn from './LogIn';

const meta: Meta<typeof LogIn> = {
  title: 'Screens/LogIn',
  component: LogIn,
};

export default meta;
type Story = StoryObj<typeof LogIn>;

export const FirstStory: Story = {};
