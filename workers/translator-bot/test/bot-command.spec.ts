import { describe, it, expect, vi } from 'vitest';
import { execMessageCommand } from '../src/bot-command';
import { translateText } from 'translator';

const user = {
  name: 'test-user123',
};

const commandsParams = {
  translationApiKey: 'translation-api-key',
};

vi.mock('translator');

describe('bot-command#execMessageCommand', () => {
  it('should welcome when the message is @hi', async () => {
    const replyText = await execMessageCommand('hi', user, commandsParams);
    expect(replyText).toMatch(/^Hey test-user123, I'm a translator bot/);
  });

  it('should be in doubt when the command is not recognized', async () => {
    const replyText = await execMessageCommand('blabla', user, commandsParams);
    expect(replyText).toMatch(/^Hm... "blabla" not sure what it means/);
  });

  it('should translate when it can', async () => {
    vi.mocked(translateText).mockResolvedValueOnce([
      {
        text: 'katzen',
        fromLang: 'de',
        translatedText: 'cats',
      },
    ]);

    const replyText = await execMessageCommand('@trans katzen', user, commandsParams);
    expect(replyText).toMatch(/^"katzen" means "cats" in "de"/);
  });

  it('should put it straight when there is nothing translate', async () => {
    const replyText = await execMessageCommand('@trans', user, commandsParams);
    expect(replyText).toMatch(/^There is nothing to translate/);
  });
});
