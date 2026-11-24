const getPartnerCatalog = (() => {
  let catalogRequest;

  function parseCatalog(csv) {
    return csv.replace(/^\uFEFF/, '').trim().split(/\r?\n/).slice(1).flatMap(line => {
      const fields = [...line.matchAll(/(?:^|,)(?:"((?:[^"]|"")*)"|([^",]*))(?=,|$)/g)]
        .map(([, quoted, unquoted]) => (quoted?.replaceAll('""', '"') ?? unquoted).trim());
      const [name, logo, es, en, logoHeight, country] = fields;
      if (fields.length < 4 || fields.length > 6 || !name || !es || !en ||
          !/^[a-z0-9][a-z0-9_.-]*\.(?:svg|png|jpe?g|webp|avif)$/i.test(logo)) return [];
      const height = Number(logoHeight);
      return [{ name, logo, es, en, country: country?.toUpperCase(), height: height >= 12 && height <= 64 ? height : 32 }];
    });
  }

  async function loadCsv() {
    const response = await fetch('assets/logos/partners.csv', { cache: 'no-cache' });
    if (!response.ok) throw new Error('Partner catalog unavailable');
    return response.text();
  }

  function loadLocalPreview() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'assets/logos/partners-preview.js';
      script.onload = () => {
        script.remove();
        resolve(window.partnersPreviewCsv);
      };
      script.onerror = () => {
        script.remove();
        reject(new Error('Local partner catalog unavailable'));
      };
      document.head.append(script);
    });
  }

  function getCatalog() {
    catalogRequest ??= (location.protocol === 'file:' ? loadLocalPreview() : loadCsv())
      .then(parseCatalog)
      .catch(error => {
        catalogRequest = undefined;
        throw error;
      });
    return catalogRequest;
  }

  return getCatalog;
})();
