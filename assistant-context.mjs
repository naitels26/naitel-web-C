const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const stopWords = new Set(('que como cuales cuando donde para por con una uno los las del ' +
  'tienen tiene hacen ofrecen ofrece servicios servicio soluciones solucion naitel mas ' +
  'quiero necesito saber informacion detalles favor puedes sobre esta este esto esa eso ' +
  'the and what how which when where with your have does about more information ' +
  'services service solutions solution please tell would could').split(' '));
const translations = new Map(Object.entries({
  network: 'redes', networking: 'redes', networks: 'redes', storage: 'almacenamiento', ups: 'energia',
  cooling: 'climatizacion', power: 'energia', backup: 'respaldos', backups: 'respaldos',
  cabling: 'cableado', fiber: 'fibra', surveillance: 'videovigilancia', fire: 'incendio',
  access: 'accesos', maintenance: 'mantenimiento', support: 'soporte', managed: 'administrados',
  cybersecurity: 'ciberseguridad'
}));

// Keep original source sections intact. Every request retains identity, commercial
// limits and a complete service index; technical detail follows the current topic.
export function selectCatalogContext(catalog, input) {
  const sections = catalog.split(/\r?\n(?=\d{2}\. )/);
  const first = sections.shift() ?? '';
  // The source preamble precedes section 01, which must always be retained.
  const identity = sections[0]?.startsWith('01.') ? sections.shift() : '';
  const tokens = value => [...new Set(normalize(value).match(/[a-z0-9]{3,}/g) ?? [])]
    .filter(word => !stopWords.has(word));
  const current = tokens(input.question);
  const previous = tokens(input.history?.at(-1)?.question ?? '');
  const terms = new Map();
  for (const [words, weight] of [[previous, 1], [current, 3]]) {
    for (const word of words) {
      terms.set(word, weight);
      if (translations.has(word)) terms.set(translations.get(word), weight);
    }
  }
  const index = sections.map(section => section.split(/\r?\n/, 1)[0]).join('\n');
  let result = [first, identity, 'ÍNDICE COMPLETO DE SERVICIOS Y REFERENCIAS', index].filter(Boolean).join('\n\n');
  const ranked = sections.map((section, position) => {
    const text = normalize(section);
    const heading = text.split(/\r?\n/, 1)[0];
    let score = 0;
    for (const [term, weight] of terms) {
      if (text.includes(term)) score += weight;
      if (heading.includes(term)) score += weight * 4;
    }
    return { section, position, score };
  }).filter(record => record.score > 0).sort((a, b) => b.score - a.score || a.position - b.position);
  let selected = 0;
  for (const { section } of ranked) {
    if (selected === 3) break;
    if (result.length + section.length + 2 > 18000) continue;
    result += '\n\n' + section;
    selected++;
  }
  return result;
}
