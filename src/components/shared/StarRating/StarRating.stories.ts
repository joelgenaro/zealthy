import type { Meta, StoryObj } from '@storybook/react';
import StarRating from './index';

const meta: Meta<typeof StarRating> = {
  title: 'Components/Star Rating',
  component: StarRating,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StarRating>;

export const Default: Story = {
  args: {
    description: 'How would you rate your recent visit with Dr. Greene?',
  },
};
