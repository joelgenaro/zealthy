import type { Meta, StoryObj } from '@storybook/react';
import PharmacySelection from '.';

const meta: Meta<typeof PharmacySelection> = {
  title: 'Screens/Pharmacy Selection',
  component: PharmacySelection,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PharmacySelection>;

export const Default: Story = {};
