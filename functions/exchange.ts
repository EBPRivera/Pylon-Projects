import { MODIFIER } from "../utilities/currency";

const exchange = async (currency: number) => {
  let oldCurrency = currency;
  let newCurrency = {
    pp: 0,
    gp: 0,
    sp: 0,
    cp: 0,
  };

  for await (const [key, val] of Object.entries(MODIFIER)) {
    if (val === 1) {
      newCurrency[key] = oldCurrency;
      break;
    }
    while (oldCurrency >= val) {
      newCurrency[key] = await Math.floor(oldCurrency / val);
      oldCurrency = oldCurrency % val;
    }
  }

  return newCurrency;
};

const multiplier = (piece: string, currency: number) =>
  MODIFIER[piece] * currency;

export { exchange, multiplier };
