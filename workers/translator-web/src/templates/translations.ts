import { html } from 'hono/html';
import { TranslationData, Translation } from '../types';
import { layoutTemplate, pageHeaderTemplate, panelTemplate } from './layout';

export function translationFormTemplate(transationData: TranslationData) {
  return html`
    <form method="GET" action="/translations">
      <div>
        <label for="translationText">Text to translate:</label>
        <textarea id="translationText" name="translationText" class="json-editor">
${transationData.text}</textarea
        >
      </div>
      <div>
        <label for="translationFromLang">From:</label>
        <input
          type="text"
          id="translationFromLang"
          name="translationFromLang"
          value="${transationData.fromLang}"
        />

        <label for="translationToLang">To:</label>
        <input
          type="text"
          id="translationToLang"
          name="translationToLang"
          value="${transationData.toLang}"
        />
      </div>

      <div class="form-actions">
        <button type="submit" class="button-primary">Translate</button>
      </div>
    </form>
  `;
}

export function translationPageTemplate(translationData: TranslationData) {
  const header = pageHeaderTemplate('Translator Web: Translate');
  const translationForm = panelTemplate(translationFormTemplate(translationData));

  return layoutTemplate('Translator Web - Translate', html`${header}${translationForm}`);
}

export function translatedPageTemplate(translation: Translation) {
  const header = pageHeaderTemplate('Translated!');
  const translationForm = panelTemplate(translationFormTemplate(translation));

  const content = html`
    ${translationForm}

    <div class="instruction">${translation.translateText}</div>
  `;

  return layoutTemplate('Translator Web - Translated', html`${header}${panelTemplate(content)}`);
}
