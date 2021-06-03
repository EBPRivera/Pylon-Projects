import commands from "../utilities/commands";

const calculate = (operator: string, val1: int, val2: int) => {
  switch (operator) {
    case "add":
      return val1 + val2;
    case "sub":
      return val1 - val2;
    case "mult":
      return val1 * val2;
    case "div":
      return val1 / val2;
    default:
      return undefined;
  }
};

commands.on(
  "calc",
  (args) => ({
    operator: args.string(),
    val1: args.integer(),
    val2: args.integer(),
  }),
  (message, { operator, val1, val2 }) => {
    const result = calculate(operator, val1, val2);

    if (!result) {
      return message.reply("Invalid operator");
    }
    return message.reply(`Result: ${result}`);
  }
);
