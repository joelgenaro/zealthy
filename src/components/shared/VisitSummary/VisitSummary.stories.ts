// import { faker } from "@faker-js/faker";
import type { Meta, StoryObj } from '@storybook/react';
import VisitSummary from './index';

const meta: Meta<typeof VisitSummary> = {
  title: 'Components/Visit Summary',
  component: VisitSummary,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof VisitSummary>;

export const FirstStory: Story = {
  // args: {
  //   appointment: {
  //     appointment_type: "Provider",
  //     id: 5,
  //     starts_at: faker.date.soon(2).toISOString(),
  //     ends_at: faker.date.soon(2).toISOString(),
  //     encounter_type: "Scheduled",
  //     duration: 30,
  //     location: "FL",
  //     status: "Confirmed",
  //     payer_name: "",
  //     visit_type: "Video",
  //     provider: {
  //       // id: 133,
  //       first_name: faker.name.firstName(),
  //       last_name: faker.name.lastName(),
  //       avatar_url: faker.image.avatar(),
  //       specialties: "Primary care, Internal medicine",
  //       canvas_practitioner_id: "b04264724c07480faf551a349fbeeb5e",
  //       email: faker.internet.email(),
  //       zoom_link: "https://zoom.us/",
  //     },
  //   },
  // },
};
