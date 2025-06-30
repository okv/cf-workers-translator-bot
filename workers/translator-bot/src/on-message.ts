import { ServerMessageTypesPatched, Text, sendMessage, markAsRead } from 'whatsapp';
import { translateText } from 'translator';

type BotCommand = {
  name: 'unregonized' | 'translate';
  args?: string[];
};

function parseCommand(text: string): BotCommand {
  const words: string[] = text
    .trim()
    .split(' ')
    .map((str) => str.trim());
  const name = words.shift();
  return {
    name: name === 'translate' ? 'translate' : 'unregonized',
    args: words,
  };
}

export async function onMessage(
  phoneID: string,
  from: string,
  message: ServerMessageTypesPatched,
  name: string,
  data: object,
  token: string,
) {
  console.log(`User ${name} (${from}) sent to bot ${phoneID} ${JSON.stringify(message)}`);

  const welcomeText = `Hey ${name}, I'm a translator bot and I can help you to learn languages 📚 just drop me a message like "translate katzen sind super" to get it translated into English 🇬🇧`;
  let replyText = welcomeText;

  if (message.type === 'text') {
    const command = parseCommand(message.text.body);
    if (command.name === 'translate' && command?.args?.length) {
      replyText = await translateText(command.args.join(' '), 'en', { apiKey: '123' });
    }
  }

  const response = await sendMessage(token, phoneID, from, new Text(replyText));

  console.log('Response from sendMessage', { response });

  markAsRead(token, phoneID, message.id);
}
