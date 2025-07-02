import { ServerMessageTypesPatched, Text, sendMessage, markAsRead } from 'whatsapp';
import { execMessageCommand } from './bot-command';

export async function onMessage(
  phoneID: string,
  from: string,
  message: ServerMessageTypesPatched,
  name: string,
  data: object,
  token: string,
  env: Env,
) {
  console.log(`User ${name} (${from}) sent to bot ${phoneID} ${JSON.stringify(message)}`);

  let replyText: string | undefined;

  if (message.type === 'text') {
    replyText = await execMessageCommand(
      message.text.body,
      { name },
      {
        translationApiKey: env.TRANSLATION_API_KEY,
      },
    );
  } else {
    replyText = `I can only process text messages, don't know how what to do with "${message.type}" messages, sorry.`;
  }

  if (!replyText) {
    replyText = `Hm... I'm not sure what you mean by that, shall we maybe start with @hi?`;
  }

  const response = await sendMessage(token, phoneID, from, new Text(replyText));

  console.log('Response from sendMessage', { response });

  markAsRead(token, phoneID, message.id);
}
