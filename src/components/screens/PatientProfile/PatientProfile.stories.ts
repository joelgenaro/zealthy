import type { Meta, StoryObj } from '@storybook/react';
import PatientProfile from './PatientProfile';

const meta: Meta<typeof PatientProfile> = {
  title: 'Screens/Patient Profile',
  component: PatientProfile,
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof PatientProfile>;

export const Default: Story = {};
