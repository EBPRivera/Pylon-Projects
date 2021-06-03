import { DM_ROLE } from "../globals";
import { DEFAULT_CURRENCYKV, MODIFIER } from "../utilities/currency";
import commands from "../utilities/commands";
import { exchange, multiplier } from "../functions/exchange";
import denominationValidation from "../functions/denominationValidation";

const currencyKV = new pylon.KVNamespace("currency");

// Returns an embedded message properties
// NOTE: this does not let the bot call the "reply" method
const generateMessage = async (user: discord.User, value: number) => {
  const embedMessage = new discord.Embed();
  const exchangedValue = await exchange(value);

  embedMessage.setTitle(user.username);
  embedMessage.setDescription("Current Cash Onhand");
  for await (const [key, val] of Object.entries(exchangedValue)) {
    embedMessage.addField({
      name: `${key}(${MODIFIER[key].toString()})`,
      value: val.toString(),
      inline: true,
    });
  }

  return embedMessage;
};

// Sets a user's currency
const setCurrency = async (user: discord.User, value: string) => {
  const currentUser =
    (await currencyKV.get<number>(user.id)) || DEFAULT_CURRENCYKV;
  let newValue = parseInt(currentUser.currency);

  if (value.startsWith("+")) newValue += parseInt(value.replace("+", ""));
  else if (value.startsWith("-")) newValue -= parseInt(value.replace("-", ""));
  else newValue = parseInt(value);

  await currencyKV.put(user.id, { currency: newValue });
};

// Gets a user's currency
const getCurrency = async (user: discord.User) => {
  const currentUser =
    (await currencyKV.get<number>(user.id)) || DEFAULT_CURRENCYKV;

  return currentUser.currency;
};

commands.subcommand("cash", (subCommands) => {
  // Gets the user's currency
  subCommands.on(
    "",
    () => ({}),
    async (message) => {
      await message.reply(
        await generateMessage(message.author, await getCurrency(message.author))
      );
    }
  );

  // Sets a user's currency to a set value
  subCommands.on(
    "set",
    (args) => ({ user: args.user(), value: args.string() }),
    async (message, { user, value }) => {
      if (discord.command.filters.hasRole(DM_ROLE))
        return message.reply("You do not have the appropriate permissions");

      await setCurrency(user, value);
      await message.reply(await generateMessage(user, value));
    }
  );

  // Sets the user's own currency
  subCommands.on(
    "setown",
    (args) => ({ value: args.string() }),
    async (message, { value }) => {
      await setCurrency(message.author, value);
      await message.reply(await generateMessage(message.author, value));
    }
  );

  // Set user's currency based on denomination
  subCommands.on(
    "edit",
    (args) => ({ denomination: args.string(), amount: args.string() }),
    async (message, { denomination, amount }) => {
      // Check's validity of arguments
      if (!(await denominationValidation(denomination, amount)))
        return await message.reply(
          "You did an oopsie with the arguments, you idiot stupid face"
        );

      // Apply multiplier
      const prefix = amount.startsWith("-") ? amount.charAt(0) : "+";
      const newAmount = await multiplier(
        denomination,
        parseInt(amount.replace(prefix, ""))
      );

      // Set currency and reply current cash
      await setCurrency(
        message.author,
        `${prefix}${await newAmount.toString()}`
      );
      await message.reply(
        await generateMessage(message.author, await getCurrency(message.author))
      );
    }
  );
});
