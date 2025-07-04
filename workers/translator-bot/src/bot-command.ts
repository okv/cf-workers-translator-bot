import { translateText } from 'translator';

export type BotCommand = {
  name: 'welcome' | 'unrecognized' | 'translate';
  args?: string[];
};

export type UserInfo = {
  name: string;
};

export type CommandsParams = {
  translationApiKey: string;
};

export async function execMessageCommand(
  messageText: string,
  user: UserInfo,
  commandsParams: CommandsParams,
): Promise<string | undefined> {
  const command = parseBotCommand(messageText);
  let replyText;
  switch (command.name) {
    case 'welcome':
      replyText = await execWelcome(user.name);
      break;
    case 'unrecognized':
      replyText = await execUnrecognized(command.args ?? []);
      break;
    case 'translate':
      if (command?.args?.length) {
        replyText = await execTranslate(command.args, commandsParams);
      } else {
        replyText = 'There is nothing to translate ¯\_(ツ)_/¯';
      }
      break;
  }
  return replyText;
}

const commandsMap: Map<string, BotCommand['name']> = new Map([
  ['!hi', 'welcome'],
  ['hi', 'welcome'],
  ['!hello', 'welcome'],
  ['hello', 'welcome'],
  ['!translate', 'translate'],
  ['!trans', 'translate'],
  ['!tr', 'translate'],
]);

/**
 * This turns a message "! translate something" into "!translate something"
 */
export function stripCommandSpaces(text: string) {
  return text.trimStart().replace(/!\s+/, '!');
}

export function parseBotCommand(text: string): BotCommand {
  const words: string[] = stripCommandSpaces(text)
    .trim()
    .split(' ')
    .map((str) => str.trim());
  const firstWord = words.slice().shift()?.toLowerCase();
  const commandName = commandsMap.get(firstWord ?? '') ?? 'unrecognized';
  return {
    name: commandName,
    args: commandName === 'unrecognized' ? words : words.slice(1),
  };
}

export async function execWelcome(name: string): Promise<string> {
  return `Hey ${name}, I'm a translator bot and I can help you to learn languages 📚 just drop me a message like "!translate katzen sind super" to get it translated into English 🇬🇧`;
}

export async function execUnrecognized(args: string[]): Promise<string> {
  return `Hm... "${args.join(' ')}" not sure what it means, can we maybe start over with !hi 😉`;
}

/**
 * This function parses a command param from args, for example:
 *
 * > parseCommandModifier('to', false, ['some', 'text', '!to', 'de'])
 * { modifier: 'de', restArgs: ['some', 'text'] }
 *
 */
export function parseCommandParam(
  name: string,
  flag: boolean,
  args: string[],
): {
  param: string | boolean | null;
  restArgs: string[];
} {
  let modifier: string | boolean | null = null;
  const restArgs: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (modifier === null) {
      if (arg === `!${name}`) {
        if (flag) {
          modifier = true;
        } else if (!flag && args[index + 1]) {
          // inc the index to avoid including the value to the restArgs
          index += 1;
          modifier = args[index];
        } else {
          restArgs.push(arg);
        }
      } else {
        restArgs.push(arg);
      }
    } else {
      restArgs.push(arg);
    }
  }

  return { param: modifier, restArgs };
}

export async function execTranslate(
  args: string[],
  commandsParams: CommandsParams,
): Promise<string> {
  let toLang: string;
  let text: string;

  const { param: toLangParam, restArgs } = parseCommandParam('to', false, args);
  if (typeof toLangParam === 'string') {
    toLang = toLangParam;
    text = restArgs.join(' ');
  } else {
    toLang = 'en';
    text = args.join(' ');
  }

  let translation;
  try {
    const apiKey = commandsParams.translationApiKey;
    [translation] = await translateText(text, toLang, { apiKey });
  } catch (error) {
    console.error('Error while translating:', { error });
    return 'Oops... something went wrong while translating 😅 sorry, try again later';
  }

  if (translation) {
    return `"${translation.text}" means "${translation.translatedText}" in "${translation.fromLang}" 💡`;
  } else {
    return `I don't know what "${text}" means, sorry 😢`;
  }
}
