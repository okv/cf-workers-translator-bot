import { describe, it, expect } from 'vitest';
import { execMessageCommand } from '../src/bot-command';

const user = {
  name: 'test-user123',
};

describe('bot-command#execMessageCommand', () => {
  it('should welcome when the message is @hi', async () => {
    const replyText = await execMessageCommand('hi', user);
    expect(replyText).toMatch(/^Hey test-user123, I'm a translator bot/);
  });

  it('should be in doubt when the command is not recognized', async () => {
    const replyText = await execMessageCommand('blabla', user);
    expect(replyText).toMatch(/^Hm... "blabla" not sure what it means/);
  });

  it('should translate when it can', async () => {
    const replyText = await execMessageCommand('@trans 123', user);
    expect(replyText).toMatch(/^"123" means "321" in "de"/);
  });

  it('should put it straight when there is nothing translate', async () => {
    const replyText = await execMessageCommand('@trans', user);
    expect(replyText).toMatch(/^There is nothing to translate/);
  });
});
