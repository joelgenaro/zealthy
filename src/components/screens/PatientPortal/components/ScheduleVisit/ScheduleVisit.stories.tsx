import type { Meta, StoryObj } from '@storybook/react';
import ScheduleVisit from '.';

const meta: Meta<typeof ScheduleVisit> = {
  title: 'Screens/ScheduleVisit',
  component: ScheduleVisit,
};

export default meta;
type Story = StoryObj<typeof ScheduleVisit>;

export const Default: Story = {
  args: {},
};
