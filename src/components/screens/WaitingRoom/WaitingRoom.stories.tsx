import type { Meta, StoryObj } from '@storybook/react';
import WaitingRoom from './WaitingRoom';
import { AppStateContext } from '@/context/AppContext/AppContext';
import rootReducer from '@/context/AppContext/reducers';
import { faker } from '@faker-js/faker';
import { AppointmentState } from '@/context/AppContext/reducers/types/appointment';

const meta: Meta<typeof WaitingRoom> = {
  title: 'Screens/Waiting Room',
  component: WaitingRoom,
};

export default meta;
type Story = StoryObj<typeof WaitingRoom>;

export const FirstStory: Story = {
  render: () => {
    const initialState = {
      ...rootReducer[1],
      profile: {
        ...rootReducer[1].profile,
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
      },
      appointment: [
        {
          appointment_type: 'Provider',
          starts_at: faker.date.soon(2).toISOString(),
          ends_at: faker.date.soon(2).toISOString(),
          encounter_type: 'Scheduled',
          duration: 30,
          location: 'FL',
          status: 'Confirmed',
          provider: {
            first_name: faker.name.firstName(),
            last_name: faker.name.lastName(),
            avatar_url: faker.image.avatar(),
            specialties: 'Primary care',
          },
        },
      ] as AppointmentState[],
    };
    return (
      <AppStateContext.Provider value={initialState}>
        <WaitingRoom />
      </AppStateContext.Provider>
    );
  },
};
