import { ServerMessageTypesPatched, Text, sendMessage, markAsRead } from 'whatsapp';

export async function onMessage(
  phoneID: string,
  from: string,
  message: ServerMessageTypesPatched,
  name: string,
  data: object,
  token: string,
) {
  console.log(`User ${name} (${from}) sent to bot ${phoneID} ${JSON.stringify(message)}`);

  const text = `Hey ${name}, I'm a bot and I cannot do much yet, but I'll learn 😉`;
  const response = await sendMessage(token, phoneID, from, new Text(text));

  console.log('Response from sendMessage', { response });

  markAsRead(token, phoneID, message.id);
}
