const page = require('../.next/server/app/page.js');
console.log('page export keys:', Object.keys(page));
// try to find the exported page function
const maybeDefault = page && (page.default || page.__next_app__ || page.routeModule || page.pages);
console.log('maybeDefault type:', typeof maybeDefault);
// attempt to inspect deep properties
try {
  console.log('page snapshot:', Object.keys(page).slice(0,20));
} catch (e) {}

(async () => {
  try {
    // Some build outputs expose an exported function under .__next_app__. We'll attempt to call known shapes.
    if (typeof page.default === 'function') {
      const res = await page.default({ params: { locale: 'en' } });
      console.log('page.default returned type:', typeof res);
    } else if (page.routeModule && typeof page.routeModule.load === 'function') {
      console.log('routeModule detected');
    } else {
      console.log('No callable default found; skipping direct invocation.');
    }
  } catch (err) {
    console.error('prerender invocation error:', err);
    process.exit(1);
  }
})();
