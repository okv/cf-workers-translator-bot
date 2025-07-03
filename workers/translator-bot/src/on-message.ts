import {
  ServerMessageTypesPatched,
  MessageMetadata,
  Text,
  sendMessage,
  markAsRead,
} from 'whatsapp';
import { execMessageCommand } from './bot-command';

export type AppMessageMetadata = MessageMetadata & {
  whatsappToken: string;
  translationApiKey: string;
};

export async function onMessage(message: ServerMessageTypesPatched, metadata: AppMessageMetadata) {
  const { name, from, phoneID, translationApiKey } = metadata;
  console.log(`User ${name} (${from}) sent to bot ${phoneID} ${JSON.stringify(message)}`);

  let replyText: string | undefined;

  if (message.type === 'text') {
    replyText = await execMessageCommand(
      message.text.body,
      { name: metadata.name ?? 'my friend' },
      { translationApiKey },
    );
  } else {
    replyText = `I can only process text messages, don't know how what to do with "${message.type}" messages, sorry.`;
  }

  if (!replyText) {
    replyText = `Hm... I'm not sure what you mean by that, shall we maybe start with @hi?`;
  }

  const { whatsappToken } = metadata;
  const response = await sendMessage(whatsappToken, phoneID, from, new Text(replyText));
  console.log('Response from sendMessage', { response });

  markAsRead(whatsappToken, phoneID, message.id);
}
