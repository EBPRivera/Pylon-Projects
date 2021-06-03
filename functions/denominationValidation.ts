// A boolean that returns true if both arguments are correct
import { MODIFIER } from "../utilities/currency";

const denominationValidation = async (denomination: string, amount: string) => {
  let validity = false;
  let tempAmount;

  for await (const [key] of Object.entries(MODIFIER)) {
    if (key === denomination) validity = true;
  }
  if (amount.startsWith("+") || amount.startsWith("-")) {
    tempAmount = parseInt(amount.replace("+", ""));
  }
  tempAmount = parseInt(amount);
  if (isNaN(tempAmount)) validity = false;

  return validity;
};

export default denominationValidation;
