import { ServerMessageTypesPatched, Text, sendMessage, markAsRead } from 'whatsapp';
import { parseBotCommand, execTranslate } from './bot-command';

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
    const command = parseBotCommand(message.text.body);
    if (command.name === 'translate') {
      if (command?.args?.length) {
        replyText = await execTranslate(command.args);
      } else {
        replyText = 'There is nothing to translate';
      }
    }
  }

  const response = await sendMessage(token, phoneID, from, new Text(replyText));

  console.log('Response from sendMessage', { response });

  markAsRead(token, phoneID, message.id);
}
