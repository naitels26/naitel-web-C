import { copyFile, mkdir, readdir } from 'node:fs/promises';

const root = new URL('./', import.meta.url);
const output = new URL('./public/', root);
await mkdir(output, { recursive: true });
for (const page of ['index.html', 'privacidad.html', 'cookies.html']) {
  await copyFile(new URL(page, root), new URL(page, output));
}

// Match the local server's public asset allowlist. Never copy the project root.
for (const folder of ['assets/', 'assets/logos/']) {
  await mkdir(new URL(folder, output), { recursive: true });
  for (const entry of await readdir(new URL(folder, root), { withFileTypes: true })) {
    const allowed = folder === 'assets/'
      ? /^[a-z0-9_.-]+\.(?:png|jpe?g|svg|webp|avif|webm|mp4|css|js)$/i
      : /^(?:partners\.csv|[a-z0-9][a-z0-9_.-]*\.(?:svg|png|jpe?g|webp|avif))$/i;
    if (entry.isFile() && allowed.test(entry.name)) {
      await copyFile(new URL(folder + entry.name, root), new URL(folder + entry.name, output));
    }
  }
}
console.log('Vercel: páginas y recursos públicos preparados en public/.');
