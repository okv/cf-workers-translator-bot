import { beforeEach, describe, it, expect, vi } from 'vitest';
import { execMessageCommand, stripCommandSpaces, parseCommandParam } from '../src/bot-command';
import { translateText } from 'translator';

const user = {
  name: 'test-user123',
};

const commandsParams = {
  translationApiKey: 'translation-api-key',
};

vi.mock('translator');

describe('bot-command#execMessageCommand', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should welcome when the message is "!hi"', async () => {
    const replyText = await execMessageCommand('!hi', user, commandsParams);
    expect(replyText).toMatch(/^Hey test-user123, I'm a translator bot/);
  });

  it('should welcome when the message is "!Hi"', async () => {
    const replyText = await execMessageCommand('!hi', user, commandsParams);
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

    const replyText = await execMessageCommand('!translate katzen', user, commandsParams);
    expect(replyText).toMatch(/^"katzen" means "cats" in "de"/);
  });

  it('should translate when it can with "to" param', async () => {
    vi.mocked(translateText).mockResolvedValueOnce([
      {
        text: 'cats are wild',
        fromLang: 'en',
        translatedText: 'katzen sind wild',
      },
    ]);

    const replyText = await execMessageCommand(
      '!translate cats are wild !to de',
      user,
      commandsParams,
    );
    expect(replyText).toMatch(/^"cats are wild" means "katzen sind wild" in "en"/);
  });

  it('should put it straight when there is nothing translate', async () => {
    const replyText = await execMessageCommand('!translate', user, commandsParams);
    expect(replyText).toMatch(/^There is nothing to translate/);
  });

  it('should say something when there is a translation error', async () => {
    vi.mocked(translateText).mockRejectedValueOnce(new Error('Cannot translate'));

    const replyText = await execMessageCommand('!translate katzen', user, commandsParams);
    expect(replyText).toMatch(/Oops... something went wrong while translating/);
  });
});

describe('bot-command#stripCommandSpaces', () => {
  it('should strip one space', () => {
    const stripped = stripCommandSpaces('! translate some text');
    expect(stripped).toBe('!translate some text');
  });

  it('should strip multiple space', () => {
    const stripped = stripCommandSpaces('!   translate some text');
    expect(stripped).toBe('!translate some text');
  });

  it('should do nothing when there are no spaces', () => {
    const stripped = stripCommandSpaces('!translate some text');
    expect(stripped).toBe('!translate some text');
  });
});

describe('bot-command#parseCommandParam', () => {
  it('should return null for a flag where the input is an empty array', () => {
    const parsed = parseCommandParam('nolinks', true, []);
    expect(parsed).toEqual({ param: null, restArgs: [] });
  });

  it('should properly parse a flag param when it is there', () => {
    const parsed = parseCommandParam('nolinks', true, ['some', 'text', '!nolinks']);
    expect(parsed).toEqual({ param: true, restArgs: ['some', 'text'] });
  });

  it('should return null for a flag param when it is not there', () => {
    const parsed = parseCommandParam('nolinks', true, ['some', 'text', 'nks']);
    expect(parsed).toEqual({ param: null, restArgs: ['some', 'text', 'nks'] });
  });

  it('should return null for a non-flag where the input is an empty array', () => {
    const parsed = parseCommandParam('to', false, []);
    expect(parsed).toEqual({ param: null, restArgs: [] });
  });

  it('should properly parse a non-flag param when it is there', () => {
    const parsed = parseCommandParam('to', false, ['some', 'text', '!to', 'de']);
    expect(parsed).toEqual({ param: 'de', restArgs: ['some', 'text'] });
  });

  it('should return null for a non-flag param when it is there but no value', () => {
    const parsed = parseCommandParam('to', false, ['some', 'text', '!to']);
    expect(parsed).toEqual({ param: null, restArgs: ['some', 'text', '!to'] });
  });

  it('should return null for a non-flag param when it is not there', () => {
    const parsed = parseCommandParam('to', false, ['some', 'text', 'en', 'de']);
    expect(parsed).toEqual({ param: null, restArgs: ['some', 'text', 'en', 'de'] });
  });
});
