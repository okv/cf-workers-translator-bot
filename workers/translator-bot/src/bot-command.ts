import { translateText } from 'translator';

export type BotCommand = {
  name: 'welcome' | 'unregonized' | 'translate';
  args?: string[];
};

const commandsMap: Map<string, BotCommand['name']> = new Map([
  ['@hi', 'welcome'],
  ['hi', 'welcome'],
  ['@hello', 'welcome'],
  ['hello', 'welcome'],
  ['@translate', 'translate'],
  ['@trans', 'translate'],
  ['@tr', 'translate'],
]);

export function parseBotCommand(text: string): BotCommand {
  const words: string[] = text
    .trim()
    .split(' ')
    .map((str) => str.trim());
  const cmd = words.shift();
  return {
    name: commandsMap.get(cmd ?? '') ?? 'unregonized',
    args: words,
  };
}

export async function execWelcome(name: string): Promise<string> {
  return `Hey ${name}, I'm a translator bot and I can help you to learn languages 📚 just drop me a message like "@trans katzen sind super" to get it translated into English 🇬🇧`;
}

export async function execUnrecognized(args: string[]): Promise<string> {
  const translation = await translateText(args.join(' '), 'en', { apiKey: '123' });
  return `Hm... "${args.join(' ')}" not sure what it means, can we maybe start over with @hi 😉`;
}

export async function execTranslate(args: string[]): Promise<string> {
  const translation = await translateText(args.join(' '), 'en', { apiKey: '123' });
  return `This means "${translation}"`;
}
