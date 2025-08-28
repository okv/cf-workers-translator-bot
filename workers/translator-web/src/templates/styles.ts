import { html } from 'hono/html';

export const stylesHtml = html` <!-- Skeleton CSS -->
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/skeleton/2.0.4/skeleton.min.css"
  />
  <style>
    /* Common styles for all pages */
    body {
      margin-top: 50px;
    }
    .container {
      max-width: 800px;
    }
    .panel {
      border: 1px solid #e1e1e1;
      border-radius: 4px;
      padding: 20px 25px;
      margin-bottom: 40px;
    }
    h1 {
      margin-bottom: 40px;
      font-size: 4rem;
    }

    /* Button styles */
    .button-delete {
      background-color: #ff6b6b;
      border-color: #ff6b6b;
      color: white;
      padding: 0 15px;
      height: 30px;
      line-height: 30px;
    }
    .button-delete:hover {
      background-color: #ff5252;
      border-color: #ff5252;
    }

    /* Success styling */
    .success-title {
      color: #1eaedb; /* Skeleton's blue */
    }

    /* Form elements */
    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20px;
    }

    /* Remove bottom margin from forms in tables */
    td form {
      margin-bottom: 0;
    }

    /* Action buttons container */
    .action-buttons {
      display: flex;
      gap: 15px;
      margin-bottom: 30px;
    }
    .action-buttons form {
      margin: 0;
    }

    /* Instruction text */
    .instruction {
      font-style: italic;
      color: #888;
      margin-bottom: 15px;
    }

    /* Editor textarea */
    textarea.editor {
      font-family: monospace;
      min-height: 300px;
      width: 100%;
      margin-bottom: 30px;
    }

    /* Tables */
    table {
      width: 100%;
    }
  </style>`;
