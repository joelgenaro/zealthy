import type { Meta, StoryObj } from '@storybook/react';
import PostVisit from './index';

const meta: Meta<typeof PostVisit> = {
  title: 'Screens/Post Visit',
  component: PostVisit,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PostVisit>;

export const Default: Story = {
  args: {
    provider: {
      honorific: 'Dr.',
      firstName: 'Mark',
      lastName: 'Greene',
      specialties: 'Primary care, Internal medicine',
    },
    issuesDiscussed: ['Irritable Bowel Syndrome', 'Other issue'],
    providerRecommendation:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque tempus mattis nisl et gravida. Phasellus augue mauris, dignissim non risus sed, finibus gravida erat.',
  },
};
