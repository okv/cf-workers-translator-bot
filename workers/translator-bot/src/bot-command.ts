import { translateText } from 'translator';

export type BotCommand = {
  name: 'unregonized' | 'translate';
  args?: string[];
};

export function parseBotCommand(text: string): BotCommand {
  const words: string[] = text
    .trim()
    .split(' ')
    .map((str) => str.trim());
  const cmd = words.shift();
  return {
    name: cmd && ['@translate', '@trans', '@tr'].includes(cmd) ? 'translate' : 'unregonized',
    args: words,
  };
}

export async function execTranslate(args: string[]): Promise<string> {
  const translation = await translateText(args.join(' '), 'en', { apiKey: '123' });
  return `This means "${translation}"`;
}
