/**
 * SWRV On The Go — Powered By Badge
 * Add to any website footer with one script tag:
 *
 * <script src="https://swrvonthego.pro/swrv-badge.js" data-ref="YOUR_CODE"></script>
 *
 * Replace YOUR_CODE with your unique referral code.
 * When someone books via your link, SWRV sends you 15% of the sale.
 */
(function() {
  const script = document.currentScript;
  const ref = script?.getAttribute('data-ref') || '';
  const url = 'https://swrvonthego.pro' + (ref ? '?ref=' + encodeURIComponent(ref) : '');
  const badge = document.createElement('div');
  badge.setAttribute('style', [
    'display:inline-flex', 'align-items:center', 'gap:8px',
    'padding:8px 14px', 'background:rgba(10,8,4,0.9)',
    'border:1px solid rgba(200,168,75,0.3)', 'border-radius:999px',
    'font-family:-apple-system,BlinkMacSystemFont,sans-serif',
    'text-decoration:none', 'cursor:pointer', 'transition:all 0.2s',
  ].join(';'));
  badge.innerHTML = '<span style="font-size:11px;color:rgba(200,168,75,0.6);letter-spacing:.1em;text-transform:uppercase;font-weight:600">Built by</span>' +
    '<span style="font-size:12px;font-weight:800;color:#c8a84b;letter-spacing:.05em">SWRV On The Go</span>' +
    '<span style="font-size:11px;color:rgba(200,168,75,0.5)">→</span>';
  badge.title = 'Like this site? Get one from SWRV On The Go';
  badge.onclick = function() { window.open(url, '_blank', 'noopener'); };
  badge.onmouseenter = function() { this.style.borderColor = 'rgba(200,168,75,0.7)'; this.style.background = 'rgba(10,8,4,1)'; };
  badge.onmouseleave = function() { this.style.borderColor = 'rgba(200,168,75,0.3)'; this.style.background = 'rgba(10,8,4,0.9)'; };
  const container = document.createElement('div');
  container.setAttribute('style', 'text-align:center;padding:20px 0 8px;');
  container.appendChild(badge);
  document.addEventListener('DOMContentLoaded', function() {
    document.body.appendChild(container);
  });
})();
