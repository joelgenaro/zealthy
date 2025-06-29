import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Mui/Button',
  component: Button,
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    variant: 'contained',
    color: 'primary',
    size: 'medium',
    label: 'Button',
  },
};
