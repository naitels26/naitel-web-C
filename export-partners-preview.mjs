import { readFile, writeFile } from 'node:fs/promises';

const csv = await readFile(new URL('./assets/logos/partners.csv', import.meta.url), 'utf8');
await writeFile(
  new URL('./assets/logos/partners-preview.js', import.meta.url),
  `// Generated from partners.csv by export-partners-preview.mjs.\nwindow.partnersPreviewCsv = ${JSON.stringify(csv)};\n`
);
