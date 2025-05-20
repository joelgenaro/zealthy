interface Priceable {
  price: number;
}

export const calculateTotal = <T extends Priceable>(items: T[]) => {
  return items.reduce((acc, item) => {
    acc += item.price;
    return acc;
  }, 0);
};
