const partners = (() => {
  const categoryBar = document.querySelector('#partnerCategories');
  const filters = categoryBar.parentElement;
  const heading = filters.parentElement;
  const title = document.querySelector('#partnersHeading');
  const titleReserve = title.querySelector('.partners-title-reserve');
  const titleText = title.querySelector('.partners-title-text');
  const titleCaret = title.querySelector('.partners-title-caret');
  const section = title.closest('.partners-slide');
  const panel = document.querySelector('#partnerPanel');
  const logos = document.querySelector('#partnerLogos');
  const message = document.querySelector('#partnerMessage');
  const pagination = document.querySelector('#partnerPagination');
  const pageLabel = document.querySelector('#partnerPage');
  const previous = document.querySelector('#partnerPrev');
  const next = document.querySelector('#partnerNext');
  const rotationDelay = 2000;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const cardRecords = new WeakMap();
  const categoryGroups = new Map([
    ['networking', { es: 'Redes y seguridad', en: 'Networking & Security', sources: ['Networking & cybersecurity', 'Structured cabling'] }],
    ['infrastructure', { es: 'Infraestructura', en: 'Infrastructure', sources: ['Critical power', 'Data center infrastructure', 'Compute & storage'] }],
    ['cloud', { es: 'Nube y colaboración', en: 'Cloud & Collaboration', sources: ['Cloud & software', 'Collaboration & displays'] }],
    ['surveillance', { es: 'Videovigilancia', en: 'Video surveillance', sources: ['Video surveillance'] }]
  ]);
  const copy = {
    es: {
      title: 'Partners',
      category: 'Categorías de partners', all: 'Todas', brands: 'Marcas',
      previous: 'Marca anterior', next: 'Siguiente marca',
      loading: 'Cargando marcas…', empty: 'No hay marcas para mostrar.',
      localFile: 'Para ver las marcas, ejecuta node server.mjs y abre la dirección local que aparece.',
      failed: 'Las marcas no están disponibles en este momento.'
    },
    en: {
      title: 'Partners',
      category: 'Partner categories', all: 'All', brands: 'Brands',
      previous: 'Previous brand', next: 'Next brand',
      loading: 'Loading brands…', empty: 'There are no brands to display.',
      localFile: 'To see the brands, run node server.mjs and open the local address it prints.',
      failed: 'Brands are currently unavailable.'
    }
  };
  let language = 'en';
  let records = [];
  let selectedCategory = '';
  let state = 'loading';
  let request;
  let currentIndex = 0;
  let rotationTimer;
  let visibleColumns = 0;
  let animations = [];
  let titlePlayed = false;
  let typingTimer;
  let caretTimer;
  let sequenceAt = 0;
  let filterEntrances = [];

  // Build category tabs and counts from the same records as the carousel.
  function renderCategories() {
    categoryBar.hidden = records.length === 0;
    const labels = [['', copy[language].all, records.length], ...Array.from(categoryGroups, ([key, group]) =>
      [key, group[language], filteredRecords(key).length])];
    categoryBar.replaceChildren(...labels.map(([key, label, count], index) => {
      const button = document.createElement('button');
      const name = document.createElement('span');
      const badge = document.createElement('span');
      button.type = 'button';
      button.id = `partnerCategory-${index}`;
      button.dataset.category = key;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', panel.id);
      badge.className = 'partners-category-count';
      badge.textContent = count;
      name.textContent = label;
      button.append(name, badge);
      return button;
    }));
    updateSelectedTab();
    if (sequenceAt && !reducedMotion.matches) animateFilters();
  }

  function updateSelectedTab() {
    for (const tab of categoryBar.children) {
      const selected = tab.dataset.category === selectedCategory;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected) panel.setAttribute('aria-labelledby', tab.id);
    }
    positionCategoryPill();
  }

  function positionCategoryPill() {
    const active = categoryBar.querySelector('[aria-selected="true"]');
    if (!active || !active.offsetWidth) return;
    categoryBar.style.setProperty('--pill-x', `${active.offsetLeft}px`);
    categoryBar.style.setProperty('--pill-y', `${active.offsetTop}px`);
    categoryBar.style.setProperty('--pill-width', `${active.offsetWidth}px`);
    categoryBar.style.setProperty('--pill-height', `${active.offsetHeight}px`);
  }

  // Points 1, 2 and 6: Use decorative logos, a common box and a localized label.
  // The PNG assets in the current catalog have transparent backgrounds.
  function createCard(record) {
    const { name, logo, height } = record;
    const card = document.createElement('li');
    const mark = document.createElement('span');
    const image = document.createElement('img');
    const label = document.createElement('span');
    const labelName = document.createElement('span');
    const labelCategory = document.createElement('span');
    card.setAttribute('aria-label', name);
    mark.className = 'partners-mark';
    image.alt = '';
    image.style.setProperty('--logo-height', `${height}px`);
    image.addEventListener('error', () => { mark.textContent = name; }, { once: true });
    image.src = `assets/logos/${encodeURIComponent(logo)}`;
    label.className = 'partners-card-label';
    label.setAttribute('aria-hidden', 'true');
    labelName.textContent = name;
    labelCategory.className = 'partners-card-category';
    label.append(labelName, labelCategory);
    mark.append(image);
    card.append(mark, label);
    cardRecords.set(card, record);
    return card;
  }

  function filteredRecords(category = selectedCategory) {
    if (!category) return records;
    const { sources } = categoryGroups.get(category);
    return records.filter(record => sources.includes(record.en));
  }

  // Keep exactly one current brand in the center and reuse the cards that remain visible.
  function renderCarousel({ animate = false, replay = false, direction = 0, announce = false, filterChange = false } = {}) {
    animations.forEach(animation => animation.cancel());
    animations = [];
    const filtered = filteredRecords();
    const total = filtered.length;
    const styles = getComputedStyle(logos);
    visibleColumns = Number(styles.getPropertyValue('--partners-columns'));
    const visibleCount = Math.min(total, visibleColumns);
    const leftCount = Math.floor((visibleCount - 1) / 2);
    const centerSlot = Math.ceil(visibleColumns / 2);
    const visible = Array.from({ length: visibleCount }, (_, index) => {
      const offset = index - leftCount;
      return { record: filtered[(currentIndex + offset + total) % total], offset };
    });
    const current = new Map(Array.from(logos.children, card => [cardRecords.get(card), card]));
    const motion = animate && !reducedMotion.matches;
    const before = motion ? new Map(Array.from(current.values(), card => [card, card.offsetLeft])) : new Map();
    const cards = visible.map(({ record, offset }) => {
      const card = current.get(record) ?? createCard(record);
      const categoryName = record[language];
      card.style.setProperty('--partner-slot', centerSlot + offset);
      card.toggleAttribute('data-current', offset === 0);
      if (offset === 0) card.setAttribute('aria-current', 'true');
      else card.removeAttribute('aria-current');
      card.querySelector('.partners-card-category').textContent = categoryName;
      card.setAttribute('aria-description', categoryName);
      return card;
    });
    logos.replaceChildren(...cards);
    message.textContent = total ? '' : copy[language][state];
    pagination.hidden = total === 0;
    pageLabel.setAttribute('aria-live', announce ? 'polite' : 'off');
    pageLabel.textContent = total ? `${filtered[currentIndex].name} · ${currentIndex + 1} / ${total}` : '';
    previous.hidden = total < 2;
    next.hidden = total < 2;

    if (motion && filterChange) {
      const duration = parseFloat(styles.getPropertyValue('--partners-enter-duration'));
      const stagger = parseFloat(styles.getPropertyValue('--partners-filter-stagger'));
      cards.forEach((card, index) => {
        animations.push(card.animate([
          { opacity: 0, transform: 'translateY(10px) scale(.96)' },
          { opacity: 1, transform: 'none' }
        ], { duration, delay: index * stagger, fill: 'backwards', easing: 'cubic-bezier(.4,0,.2,1)' }));
      });
      animations.push(pageLabel.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: parseFloat(styles.getPropertyValue('--partners-filter-duration')),
        fill: 'backwards'
      }));
    } else if (motion) {
      const duration = parseFloat(styles.getPropertyValue('--partners-enter-duration'));
      const stagger = parseFloat(styles.getPropertyValue('--partners-stagger'));
      const lead = Math.max(0, sequenceAt - performance.now());
      const offsets = cards.map(card => before.has(card) ? before.get(card) - card.offsetLeft : null);
      cards.forEach((card, index) => {
        const dx = offsets[index];
        if (dx === 0 && !replay) return;
        const incoming = replay || dx === null || Math.abs(dx) > card.offsetWidth * 1.5;
        const start = incoming ? `translate(${direction * 20}px, 8px)` : `translateX(${dx}px)`;
        const delay = direction ? 0 : lead + index * stagger;
        animations.push(card.animate([
          { transform: start, visibility: delay > 0 ? 'hidden' : 'visible' },
          { transform: 'none', visibility: 'visible' }
        ], {
          duration, delay, fill: 'backwards', easing: 'cubic-bezier(.2,.7,.3,1)'
        }));
      });
    }
    scheduleRotation();
  }

  function scheduleRotation() {
    clearTimeout(rotationTimer);
    if (reducedMotion.matches || !section.classList.contains('active') || document.hidden ||
        panel.matches(':focus-visible') || panel.querySelector(':focus-visible') || filteredRecords().length < 2) return;
    rotationTimer = setTimeout(() => move(1), rotationDelay);
  }

  function move(direction, announce = false) {
    const count = filteredRecords().length;
    if (count < 2) return;
    currentIndex = (currentIndex + direction + count) % count;
    renderCarousel({ animate: true, direction, announce });
  }

  function setLanguage(nextLanguage) {
    const changed = language !== nextLanguage;
    language = nextLanguage;
    if (changed) resetTitle();
    const labels = copy[language];
    categoryBar.setAttribute('aria-label', labels.category);
    logos.setAttribute('aria-label', labels.brands);
    previous.setAttribute('aria-label', labels.previous);
    next.setAttribute('aria-label', labels.next);
    renderCategories();
    renderCarousel();
    if (changed) observeTitle();
  }

  function load() {
    observeTitle();
    if (request) {
      scheduleRotation();
      return;
    }
    state = 'loading';
    renderCarousel();
    const localFile = location.protocol === 'file:';
    request = getPartnerCatalog()
      .then(catalog => {
        records = catalog;
        state = 'empty';
        renderCategories();
        renderCarousel({ animate: true });
      })
      .catch(() => {
        request = undefined;
        state = localFile ? 'localFile' : 'failed';
        renderCarousel();
      });
  }

  // Point 7: Type once per language after the active title intersects the viewport.
  function resetTitle() {
    clearInterval(typingTimer);
    clearTimeout(caretTimer);
    filterEntrances.forEach(animation => animation.cancel());
    filterEntrances = [];
    sequenceAt = 0;
    titlePlayed = false;
    const label = copy[language].title;
    title.setAttribute('aria-label', label);
    titleReserve.textContent = label;
    titleText.textContent = label;
    titleCaret.hidden = true;
    titleCaret.removeAttribute('data-fading');
  }

  function observeTitle() {
    if (!titlePlayed && !reducedMotion.matches && section.classList.contains('active')) {
      titleObserver.observe(title);
    }
  }

  function animateFilters() {
    filterEntrances.forEach(animation => animation.cancel());
    const styles = getComputedStyle(filters);
    const duration = parseFloat(styles.getPropertyValue('--partners-filter-duration'));
    const stagger = parseFloat(styles.getPropertyValue('--partners-stagger'));
    const lead = Math.max(0, sequenceAt - performance.now());
    filterEntrances = Array.from(categoryBar.children, (tab, index) => tab.animate(
      [{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'none' }],
      { duration, delay: lead + index * stagger, fill: 'backwards' }
    ));
  }

  const titleObserver = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting) || !section.classList.contains('active') ||
        titlePlayed || reducedMotion.matches) return;
    titleObserver.unobserve(title);
    titlePlayed = true;
    const label = Array.from(copy[language].title);
    const styles = getComputedStyle(title);
    const step = parseFloat(styles.getPropertyValue('--partners-title-step'));
    const lead = parseFloat(styles.getPropertyValue('--partners-title-lead'));
    sequenceAt = performance.now() + lead;
    titleText.textContent = '';
    titleCaret.hidden = false;
    let index = 0;
    typingTimer = setInterval(() => {
      titleText.textContent += label[index++];
      if (index < label.length) return;
      clearInterval(typingTimer);
      // The caret keeps blinking, as if waiting for more typing.
    }, step);
    animateFilters();
    if (logos.childElementCount) renderCarousel({ animate: true, replay: true });
  }, { threshold: .5 });

  // Point 4: Arrow keys move focus and select a tab, with Home and End as shortcuts.
  function selectTab(button) {
    if (button.dataset.category === selectedCategory) return;
    selectedCategory = button.dataset.category;
    updateSelectedTab();
    currentIndex = 0;
    renderCarousel({ animate: true, announce: true, filterChange: true });
  }

  categoryBar.addEventListener('click', event => {
    const button = event.target.closest('[role="tab"]');
    if (button) selectTab(button);
  });
  categoryBar.addEventListener('keydown', event => {
    const tabs = Array.from(categoryBar.children);
    const index = tabs.indexOf(event.target);
    const last = tabs.length - 1;
    const target = {
      ArrowLeft: index === 0 ? last : index - 1,
      ArrowRight: index === last ? 0 : index + 1,
      Home: 0,
      End: last
    }[event.key];
    if (index < 0 || !Number.isInteger(target)) return;
    event.preventDefault();
    tabs[target].focus({ preventScroll: true });
    selectTab(tabs[target]);
  });

  // Point 5: Update just the card under the pointer.
  logos.addEventListener('pointermove', event => {
    const card = event.target.closest('li');
    if (!card || event.pointerType === 'touch' || reducedMotion.matches) return;
    const bounds = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${event.clientX - bounds.left}px`);
    card.style.setProperty('--my', `${event.clientY - bounds.top}px`);
  }, { passive: true });
  // Point 6: A touch reveals the same label without making the card a link.
  logos.addEventListener('pointerup', event => {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
    const card = event.target.closest('li');
    if (!card) return;
    const wasOpen = card.hasAttribute('data-details');
    logos.querySelector('[data-details]')?.removeAttribute('data-details');
    card.toggleAttribute('data-details', !wasOpen);
  });
  reducedMotion.addEventListener('change', () => {
    titleObserver.unobserve(title);
    resetTitle();
    observeTitle();
    renderCarousel();
  });

  const resizeObserver = new ResizeObserver(() => {
    positionCategoryPill();
    if (Number(getComputedStyle(logos).getPropertyValue('--partners-columns')) !== visibleColumns) renderCarousel();
  });
  resizeObserver.observe(heading);
  resizeObserver.observe(categoryBar);
  window.addEventListener('resize', positionCategoryPill);
  document.fonts?.ready.then(positionCategoryPill);
  previous.addEventListener('click', () => move(-1, true));
  next.addEventListener('click', () => move(1, true));
  panel.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1, true);
  });
  panel.addEventListener('focusin', scheduleRotation);
  panel.addEventListener('focusout', () => queueMicrotask(scheduleRotation));
  document.addEventListener('visibilitychange', scheduleRotation);
  new MutationObserver(scheduleRotation).observe(section, { attributes: true, attributeFilter: ['class'] });
  return { load, getCatalog: getPartnerCatalog, setLanguage };
})();
