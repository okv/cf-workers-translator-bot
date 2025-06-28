import { ServerMessageTypesPatched, Text, sendMessage, markAsRead } from 'whatsapp';

export async function messageHandler(
  phoneID: string,
  from: string,
  message: ServerMessageTypesPatched,
  name: string,
  data: object,
  token: string,
) {
  console.log(`User ${name} (${from}) sent to bot ${phoneID} ${JSON.stringify(message)}`);

  let response;

  if (['text', 'image', 'document'].includes(message.type)) {
    let content = '';
    switch (message.type) {
      case 'text':
        content = `*${name}* said:\n\n${message.text.body}`;
        break;
      case 'image':
        content = `*${name}* shared:\n\n an image with ID ${message.image.id}`;
        break;
      case 'document':
        content = `*${name}* shared:\n\n an document with ID ${message.document.id}`;
        break;
    }

    response = await sendMessage(token, phoneID, from, new Text(content));
  }

  console.log(
    response ??
      'There are more types of messages, such as contacts, ' +
        'locations, templates, interactive, reactions and ' +
        'all the other media types.',
  );

  markAsRead(token, phoneID, message.id);
}
