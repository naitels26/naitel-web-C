// Visible artwork bounds, measured from the original project assets.
const carouselLogoMetrics={"cisco.svg":{"width":576,"height":304,"x":51,"y":200,"visibleWidth":474,"visibleHeight":104},"fortinet.svg":{"width":2731,"height":331,"x":9,"y":10,"visibleWidth":2714,"visibleHeight":312},"palo-alto.svg":{"width":928,"height":173,"x":1,"y":0,"visibleWidth":927,"visibleHeight":173},"sonicwall.svg":{"width":2731,"height":467,"x":15,"y":13,"visibleWidth":2701,"visibleHeight":440},"hpe-aruba-networking.svg":{"width":2107,"height":480,"x":2,"y":2,"visibleWidth":2102,"visibleHeight":476},"ekahau.png":{"width":1843,"height":786,"x":234,"y":169,"visibleWidth":1375,"visibleHeight":382},"schneider-electric.svg":{"width":2551,"height":1163,"x":94,"y":94,"visibleWidth":2363,"visibleHeight":975},"eaton.svg":{"width":926,"height":255,"x":1,"y":1,"visibleWidth":924,"visibleHeight":253},"cdp-azul.png":{"width":320,"height":320,"x":16,"y":106,"visibleWidth":288,"visibleHeight":107},"panduit.svg":{"width":363,"height":80,"x":0,"y":2,"visibleWidth":362,"visibleHeight":78},"commscope.png":{"width":1920,"height":262,"x":0,"y":0,"visibleWidth":1913,"visibleHeight":253},"belden.svg":{"width":1427,"height":307,"x":16,"y":16,"visibleWidth":1400,"visibleHeight":280},"axis.svg":{"width":533,"height":192,"x":0,"y":0,"visibleWidth":533,"visibleHeight":192},"milestone.png":{"width":4173,"height":743,"x":0,"y":0,"visibleWidth":4173,"visibleHeight":743},"hikvision.svg":{"width":2731,"height":365,"x":10,"y":10,"visibleWidth":2711,"visibleHeight":345},"hanwha-vision.svg":{"width":481,"height":377,"x":0,"y":234,"visibleWidth":481,"visibleHeight":143},"mobotix.svg":{"width":15246,"height":2325,"x":0,"y":0,"visibleWidth":15246,"visibleHeight":2325},"cpi.svg":{"width":683,"height":128,"x":170,"y":10,"visibleWidth":504,"visibleHeight":108},"rittal.svg":{"width":1501,"height":2048,"x":0,"y":1648,"visibleWidth":1301,"visibleHeight":301},"dell-technologies.svg":{"width":192,"height":25,"x":0,"y":0,"visibleWidth":192,"visibleHeight":25},"hpe.svg":{"width":1680,"height":480,"x":96,"y":0,"visibleWidth":1584,"visibleHeight":480},"microsoft.svg":{"width":900,"height":192,"x":0,"y":0,"visibleWidth":900,"visibleHeight":192},"azure.svg":{"width":1067,"height":307,"x":1,"y":0,"visibleWidth":1066,"visibleHeight":307},"aws.svg":{"width":811,"height":485,"x":4,"y":2,"visibleWidth":803,"visibleHeight":481},"logitech.svg":{"width":2667,"height":811,"x":2,"y":1,"visibleWidth":2663,"visibleHeight":809},"samsung.svg":{"width":18804,"height":2880,"x":0,"y":0,"visibleWidth":18804,"visibleHeight":2880},"genetec.svg":{"width":269,"height":51,"x":0,"y":0,"visibleWidth":267,"visibleHeight":50},"hoffman.svg":{"width":1858,"height":563,"x":0,"y":0,"visibleWidth":1858,"visibleHeight":563},"amd.svg":{"width":64,"height":16,"x":0,"y":0,"visibleWidth":64,"visibleHeight":16},"sandisk.svg":{"width":64,"height":13,"x":0,"y":0,"visibleWidth":64,"visibleHeight":13},"honeywell.svg":{"width":6667,"height":1259,"x":0,"y":0,"visibleWidth":6667,"visibleHeight":1259},"cyberpower.png":{"width":433,"height":80,"x":0,"y":0,"visibleWidth":433,"visibleHeight":80},"huawei.svg":{"width":64,"height":48,"x":0,"y":0,"visibleWidth":64,"visibleHeight":48},"lenovo.svg":{"width":64,"height":22,"x":0,"y":0,"visibleWidth":64,"visibleHeight":22},"qnap.svg":{"width":64,"height":11,"x":0,"y":0,"visibleWidth":64,"visibleHeight":11},"synology.svg":{"width":64,"height":17,"x":0,"y":0,"visibleWidth":64,"visibleHeight":17},"h3c.png":{"width":362,"height":98,"x":0,"y":0,"visibleWidth":362,"visibleHeight":98},"asus.svg":{"width":64,"height":13,"x":1,"y":0,"visibleWidth":62,"visibleHeight":13},"huawei.png":{"width":266,"height":60,"x":0,"y":1,"visibleWidth":266,"visibleHeight":58}};
const logoCarousel = (() => {
  const carousel = document.querySelector('.logo-carousel');
  const list = document.querySelector('#carouselLogos');
  const message = document.querySelector('#logoCarouselMessage');
  const labels = {
    en: ['Partner logos', 'Partner logos are currently unavailable.'],
    es: ['Logos de marcas aliadas', 'Los logos no están disponibles en este momento.']
  };
  const SPEED = 28; // píxeles por segundo
  const certifications = new Map([
    ['schneider-electric.svg', 'Schneider Certified Partner'],
    ['genetec.svg', 'Genetec Certified Partner'],
    ['milestone.png', 'Milestone Certified Partner'],
    ['microsoft.svg', 'Microsoft Partner'],
    ['axis.svg', 'Axis Gold Parner'],
    ['panduit.svg', 'Panduit Gold Partner'],
    ['cisco.svg', 'Cisco Certified Partner'],
    ['fortinet.svg', 'Fortinet Advocate Partner'],
    ['belden.svg', 'Belden Certified Partner'],
    ['commscope.png', 'Commscope Certified Partner']
  ]);
  let language = 'en';
  let cards = [];
  let resizeTimer;
  let activeTrigger = null;
  let closeTimer;
  const preview = document.createElement('section');
  preview.id = 'brandCertifications';
  preview.className = 'brand-certifications';
  preview.hidden = true;
  preview.setAttribute('role', 'region');
  preview.innerHTML = `<header><span class="certification-eyebrow"></span><strong></strong></header><div class="certification-cards"><div class="certification-card"><div class="certification-credential"><span class="certification-emblem" aria-hidden="true"><svg class="certification-diploma" viewBox="0 0 52 40" fill="none"><rect x="2" y="2" width="46" height="32" rx="3" fill="currentColor" fill-opacity=".06" stroke="currentColor" stroke-width="1.4"/><path d="M7 11V7h4M39 7h4v4M7 25v4h4M39 29h4v-4" stroke="currentColor" stroke-opacity=".45" stroke-linecap="round"/><path d="M17 11h16M12 17h26M16 22h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="m12 28 2-2 2 2 3-3" stroke="currentColor" stroke-opacity=".65" stroke-linecap="round" stroke-linejoin="round"/></svg><svg class="certification-seal" aria-hidden="true" viewBox="0 0 36 42" fill="none"><path d="m9 25-3 14 7-3 4 5 3-15M19 26l3 15 4-5 7 3-5-15" fill="currentColor" fill-opacity=".2" stroke="currentColor" stroke-linejoin="round"/><path d="m18 2 4 3 5 .5 1.5 5 3 4-1.5 5 .2 5-4.5 2.5-3 4-4.7-1-4.7 1-3-4L5.8 25l.2-5-1.5-5 3-4 1.5-5 5-.5Z" fill="currentColor" fill-opacity=".13" stroke="currentColor"/><circle cx="18" cy="16" r="8" stroke="currentColor" stroke-opacity=".5"/><path d="m14 16 2.7 2.7 5.3-5.4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span data-certification></span></div></div></div>`;
  document.body.append(preview);

  function positionPreview() {
    if (!activeTrigger) return;
    const rect = activeTrigger.getBoundingClientRect();
    const width = preview.getBoundingClientRect().width;
    preview.style.left = `${Math.max(12, Math.min(innerWidth - width - 12, rect.left + rect.width / 2 - width / 2))}px`;
    preview.style.bottom = `${innerHeight - rect.top + 18}px`;
  }

  function closePreview() {
    clearTimeout(closeTimer);
    activeTrigger?.setAttribute('aria-expanded', 'false');
    activeTrigger?.removeAttribute('aria-describedby');
    activeTrigger = null;
    preview.hidden = true;
    carousel.classList.remove('has-certification-preview');
  }

  function showPreview(trigger) {
    clearTimeout(closeTimer);
    if (activeTrigger !== trigger) closePreview();
    activeTrigger = trigger;
    const spanish = language === 'es';
    preview.querySelector('.certification-eyebrow').textContent = spanish ? 'Certificaciones' : 'Certifications';
    preview.querySelector('strong').textContent = trigger.dataset.brand;
    preview.querySelector('[data-certification]').textContent = trigger.dataset.certification;
    preview.classList.toggle('is-gold', trigger.dataset.certification.includes('Gold'));
    preview.setAttribute('aria-label', `${spanish ? 'Certificaciones de' : 'Certifications for'} ${trigger.dataset.brand}`);
    trigger.setAttribute('aria-expanded', 'true');
    trigger.setAttribute('aria-describedby', preview.id);
    preview.hidden = false;
    carousel.classList.add('has-certification-preview');
    positionPreview();
  }

  const scheduleClose = () => { clearTimeout(closeTimer); closeTimer = setTimeout(closePreview, 180); };
  list.addEventListener('pointerover', event => {
    const trigger = event.target.closest('.carousel-brand');
    if (trigger && event.pointerType !== 'touch') showPreview(trigger);
  });
  list.addEventListener('pointerout', event => {
    if (!event.target.closest('.carousel-brand')?.contains(event.relatedTarget)) scheduleClose();
  });
  list.addEventListener('focusin', event => {
    const trigger = event.target.closest('.carousel-brand');
    if (trigger) showPreview(trigger);
  });
  list.addEventListener('focusout', scheduleClose);
  list.addEventListener('click', event => {
    const trigger = event.target.closest('.carousel-brand');
    if (trigger) showPreview(trigger);
  });
  preview.addEventListener('pointerenter', () => clearTimeout(closeTimer));
  preview.addEventListener('pointerleave', scheduleClose);
  document.addEventListener('pointerdown', event => {
    if (!preview.contains(event.target) && !event.target.closest('.carousel-brand')) closePreview();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closePreview(); });

  function setLanguage(nextLanguage) {
    language = nextLanguage;
    const [name, unavailable] = labels[language];
    carousel.setAttribute('aria-label', name);
    message.textContent = unavailable;
    cards.forEach(card => {
      const trigger = card.querySelector('.carousel-brand');
      if (trigger) trigger.setAttribute('aria-label', `${language === 'es' ? 'Ver certificaciones de' : 'View certifications for'} ${trigger.dataset.brand}`);
    });
    list.querySelectorAll('.carousel-brand').forEach(trigger => {
      trigger.setAttribute('aria-label', `${language === 'es' ? 'Ver certificaciones de' : 'View certifications for'} ${trigger.dataset.brand}`);
    });
    if (activeTrigger) showPreview(activeTrigger);
  }

  function copyOf(card) {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelector('img')?.setAttribute('alt', '');
    clone.querySelector('button')?.setAttribute('tabindex', '-1');
    return clone;
  }

  // Arma el bucle: una "mitad" con suficientes logos para cubrir el ancho de la
  // pantalla, y una segunda mitad idéntica. La animación recorre exactamente
  // una mitad (-50%), así que el reinicio es imperceptible.
  function render() {
    closePreview();
    if (!cards.length) return;
    list.replaceChildren(...cards);
    const setWidth = list.scrollWidth;
    if (!setWidth) return;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){list.classList.add('is-static');return;}
    const repeats = Math.max(1, Math.ceil(carousel.clientWidth / setWidth));
    const half = [...cards];
    for (let i = 1; i < repeats; i++) half.push(...cards.map(copyOf));
    list.replaceChildren(...half, ...half.map(copyOf));
    list.style.animationDuration = `${Math.round((setWidth * repeats) / SPEED)}s`;
    list.classList.toggle('is-static', cards.length < 2);
  }

  async function load() {
    try {
      const catalog = await getPartnerCatalog();
      cards = catalog.map(({ name, logo }) => {
        if(logo==='huawei.svg') logo='huawei.png';
        const item = document.createElement('li');
        const certification = certifications.get(logo);
        const hasCertifications = Boolean(certification);
        const trigger = document.createElement(hasCertifications ? 'button' : 'span');
        trigger.className = 'carousel-brand-mark';
        if (hasCertifications) {
          trigger.type = 'button';
          trigger.classList.add('carousel-brand');
          trigger.dataset.brand = name;
          trigger.dataset.certification = certification;
          trigger.setAttribute('aria-expanded', 'false');
          trigger.setAttribute('aria-controls', preview.id);
          trigger.setAttribute('aria-label', `${language === 'es' ? 'Ver certificaciones de' : 'View certifications for'} ${name}`);
        }
        const frame = document.createElement('span');
        frame.className='carousel-logo-frame';
        const image = document.createElement('img');
        image.alt = name;
        image.src = `assets/logos/${encodeURIComponent(logo)}`;
        image.loading = 'eager';
        image.decoding = 'async';
        const metrics=typeof carouselLogoMetrics==='undefined'?null:carouselLogoMetrics[logo];
        if(metrics){
          // Normalize the visible artwork, excluding transparent margins.
          const targetHeight=14.4;
          const scale=targetHeight/metrics.visibleHeight;
          const width=metrics.visibleWidth*scale;
          frame.style.width=`${width}px`;
          image.style.width=`${metrics.width*scale}px`;
          image.style.height=`${metrics.height*scale}px`;
          image.style.left=`${-metrics.x*scale}px`;
          image.style.top=`${(26-targetHeight)/2-metrics.y*scale}px`;
        }
        image.addEventListener('error', () => {
          frame.textContent = name;
          item.classList.add('logo-fallback');
        }, { once: true });
        frame.append(image);
        trigger.append(frame);
        item.append(trigger);
        return item;
      });
      render();
      message.hidden = cards.length > 0;
    } catch {
      cards = [];
      list.replaceChildren();
      message.hidden = false;
    }
  }

  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',render);
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 200);
  });

  return { load, setLanguage };
})();
