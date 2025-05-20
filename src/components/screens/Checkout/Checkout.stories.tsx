import type { Meta, StoryObj } from '@storybook/react';
import Checkout from './Checkout';
import PatientContextProvider from '@/context/PatientContext';
import { patientWithAddress } from '@/__mocks__/data/patient';
import { ILVShoppingCart } from '@/__mocks__/data/shoppingCart';

const meta: Meta<typeof Checkout> = {
  title: 'Screens/Checkout',
  component: Checkout,
};

export default meta;
type Story = StoryObj<typeof Checkout>;

export const ILVCheckout: Story = {
  args: {
    order: ILVShoppingCart,
  },
};

export const WithAddress: Story = {
  render: args => (
    <PatientContextProvider initialState={patientWithAddress}>
      <Checkout />
    </PatientContextProvider>
  ),
  args: {
    order: ILVShoppingCart,
  },
};
