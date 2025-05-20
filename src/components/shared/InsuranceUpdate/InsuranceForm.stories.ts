import type { Meta, StoryObj } from '@storybook/react';
import InsuranceForm from './InsuranceForm';

const meta: Meta<typeof InsuranceForm> = {
  title: 'Screens/Insurance Form',
  component: InsuranceForm,
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof InsuranceForm>;

export const Default: Story = {};
