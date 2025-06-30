import { ServerMessageTypesPatched, Text, sendMessage, markAsRead } from 'whatsapp';
import { parseBotCommand, execWelcome, execUnrecognized, execTranslate } from './bot-command';

export async function onMessage(
  phoneID: string,
  from: string,
  message: ServerMessageTypesPatched,
  name: string,
  data: object,
  token: string,
) {
  console.log(`User ${name} (${from}) sent to bot ${phoneID} ${JSON.stringify(message)}`);

  let replyText = await execWelcome(name);

  if (message.type === 'text') {
    const command = parseBotCommand(message.text.body);
    switch (command.name) {
      case 'welcome':
        replyText = await execWelcome(name);
        break;
      case 'unregonized':
        replyText = await execUnrecognized(command.args ?? []);
        break;
      case 'translate':
        if (command?.args?.length) {
          replyText = await execTranslate(command.args);
        } else {
          replyText = 'There is nothing to translate';
        }
        break;
    }
  }

  const response = await sendMessage(token, phoneID, from, new Text(replyText));

  console.log('Response from sendMessage', { response });

  markAsRead(token, phoneID, message.id);
}
