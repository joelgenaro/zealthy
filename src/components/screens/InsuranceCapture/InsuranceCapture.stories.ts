import type { Meta, StoryObj } from '@storybook/react';
import InsuranceCapture from './InsuranceCapture';

const meta: Meta<typeof InsuranceCapture> = {
  title: 'Screens/Insurance Capture',
  component: InsuranceCapture,
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof InsuranceCapture>;

export const Default: Story = {};
