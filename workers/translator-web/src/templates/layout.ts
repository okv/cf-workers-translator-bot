import { html } from 'hono/html';
import { stylesHtml } from './styles';

export function layoutTemplate(title: string, content: any) {
  return html`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${title}</title>
        ${stylesHtml}
      </head>
      <body>
        <div class="container">${content}</div>
      </body>
    </html>`;
}

export function pageHeaderTemplate(title: string, actions?: any) {
  return html`
    <h1>${title}</h1>
    ${actions ? html`<div class="action-buttons">${actions}</div>` : ''}
  `;
}

export function panelTemplate(content: any, className?: string) {
  return html`<div class="panel ${className || ''}">${content}</div>`;
}

export function errorPageTemplate(title: string, message: string, details?: string) {
  const header = pageHeaderTemplate(title);

  const errorContent = html`
    <div class="error-message">
      <h3>⚠️ Error</h3>
      <p><strong>${message}</strong></p>
      ${details ? html`<div class="error-details"><pre>${details}</pre></div>` : ''}

      <div class="form-actions">
        <a href="/words" class="button button-primary">Back To Words</a>
      </div>
    </div>
  `;

  return layoutTemplate(
    `Error - ${title}`,
    html`${header}${panelTemplate(errorContent, 'error-panel')}`,
  );
}
