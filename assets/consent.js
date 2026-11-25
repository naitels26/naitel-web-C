// Google tag (gtag.js) — basic consent mode. No Google request before opt-in.
(() => {
  const key = 'naitel-cookie-choice-v1';
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  const state = allowed => Object.fromEntries(
    ['ad_storage', 'analytics_storage', 'ad_user_data', 'ad_personalization']
      .map(name => [name, allowed ? 'granted' : 'denied'])
  );
  window.gtag('consent', 'default', state(false));
  let choice = null;
  let loaded = false;
  try { choice = localStorage.getItem(key); } catch {}
  if (!['essential', 'optional'].includes(choice)) choice = null;
  function apply() {
    const allowed = choice === 'optional';
    window['ga-disable-AW-18496508499'] = !allowed;
    window.gtag('consent', 'update', state(allowed));
    if (!allowed || loaded) return;
    loaded = true;
    window.gtag('js', new Date());
    window.gtag('config', 'AW-18496508499');
    const script = document.createElement('script');
    script.id = 'optionalAnalytics';
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-18496508499';
    document.head.append(script);
  }
  window.naitelConsent = {
    get choice() { return choice; },
    save(next) {
      if (!['essential', 'optional'].includes(next)) return;
      const revoke = loaded && next === 'essential';
      choice = next;
      try { localStorage.setItem(key, choice); } catch {}
      apply();
      // Unload the Google library after withdrawing an existing consent.
      if (revoke) location.reload();
    }
  };
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) location.reload();
  });
  apply();
})();
