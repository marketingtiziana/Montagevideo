// Fit each [data-fit] line to an exact pixel width (keeps headline blocks optically justified).
// Edit the text freely: the size recalculates. data-fit="560" => line width 560px.
function fitLines() {
  document.querySelectorAll('[data-fit]').forEach(el => {
    const target = parseFloat(el.dataset.fit);
    let lo = 10, hi = 400;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      el.style.fontSize = mid + 'px';
      const w = el.getBoundingClientRect().width;
      if (w > target) hi = mid; else lo = mid;
    }
    el.style.fontSize = lo + 'px';
  });
  // data-size-of="#id": copy the computed size of another line (same cap height)
  document.querySelectorAll('[data-size-of]').forEach(el => {
    const src = document.querySelector(el.dataset.sizeOf);
    el.style.fontSize = (parseFloat(src.style.fontSize) * parseFloat(el.dataset.scale || 1)) + 'px';
  });
}
// Draw geography from assets/geo.js into <svg data-geo="france|europe">
function drawGeo() {
  document.querySelectorAll('svg[data-geo]').forEach(svg => {
    const g = window.GEO[svg.dataset.geo];
    svg.setAttribute('viewBox', `0 0 ${g.w} ${g.h}`);
    svg.querySelectorAll('[data-d]').forEach(p => p.setAttribute('d', g[p.dataset.d]));
    svg.querySelectorAll('[data-paris]').forEach(c => { c.setAttribute('cx', g.paris[0]); c.setAttribute('cy', g.paris[1]); });
  });
}
window.addEventListener('DOMContentLoaded', () => {
  if (window.GEO) drawGeo();
  document.fonts.ready.then(() => { fitLines(); document.body.dataset.ready = '1'; });
});
