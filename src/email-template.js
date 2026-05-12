// ══════════════════════════════════════════════════════════════════════
// src/email-template.js — Roadmap email template
// Includes: gift, work, purpose, evidence, vision_summary, blueprint,
//           brand identity, vision_services_map, recommended_services
// ══════════════════════════════════════════════════════════════════════

export function renderRoadmapEmail({ userName, sessionId, result, brand, origin }) {
  const total = (result.recommended_services || []).reduce((sum, s) => {
    const n = parseInt((s.price || '').replace(/\D/g, ''));
    return sum + (isNaN(n) ? 0 : n);
  }, 0);
  const resumeUrl = sessionId ? `${origin}/r/${sessionId}` : `${origin}/`;
  const tierUrl = brand.ctaUrl || `${origin}/`;

  const blueprintItems = result.blueprint ? [
    { label: '🔍 How You Got Here',  val: result.blueprint.reverse_engineering },
    { label: '🧠 Mindset',           val: result.blueprint.mindset },
    { label: '⚡ Daily Discipline',   val: result.blueprint.discipline },
    { label: '🥗 Diet & Nutrition',   val: result.blueprint.diet },
    { label: '💪 Fitness',            val: result.blueprint.fitness },
    { label: '🤝 Your Circle',        val: result.blueprint.community },
    { label: '🎯 Work Ethic',         val: result.blueprint.work_ethic },
  ].filter(b => b.val) : [];

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Your Roadmap — ${escapeHtml(brand.name)}</title></head>
<body style="margin:0;background:#0d0b08;font-family:Georgia,serif;color:#e8dcc8;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0b08;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#111009;border:1px solid rgba(232,220,200,.1);border-radius:8px;overflow:hidden;">

<!-- Header -->
<tr><td style="padding:32px 40px;text-align:center;border-bottom:1px solid rgba(232,220,200,.1);">
  <div style="font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#c4923a;font-family:Georgia,serif;font-style:italic;">${escapeHtml(brand.name)}</div>
  <h1 style="margin:14px 0 0;font-size:32px;font-weight:400;color:#f7f2ea;font-style:italic;">Your Roadmap</h1>
  <p style="margin:8px 0 0;font-size:13px;color:rgba(232,220,200,.5);">${escapeHtml(userName)} · ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
</td></tr>

<!-- Body -->
<tr><td style="padding:32px 40px;">
  ${section('Your Gift', result.gift)}
  ${section('Your Work', result.work)}
  ${section('Your Purpose', result.purpose)}

  ${result.evidence ? `
    <div style="margin:0 0 24px;padding:18px 20px;background:rgba(100,200,255,.05);border:1px solid rgba(100,200,255,.15);border-radius:6px;">
      <h3 style="margin:0 0 10px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#64c8ff;">How We Got Here — The Evidence</h3>
      <p style="margin:0;font-size:14px;line-height:1.7;color:rgba(232,220,200,.8);font-style:italic;">${escapeHtml(result.evidence)}</p>
    </div>
  ` : ''}

  ${section('Your Happily Ever After — Mapped', result.vision_summary)}

  ${blueprintItems.length ? `
    <h3 style="margin:0 0 14px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#c4923a;">The Blueprint — What This Life Requires</h3>
    ${blueprintItems.map(b => `
      <div style="margin-bottom:10px;padding:12px 16px;background:rgba(255,255,255,.03);border:1px solid rgba(232,220,200,.08);border-radius:4px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#c4923a;margin-bottom:5px;">${escapeHtml(b.label)}</div>
        <div style="font-size:14px;line-height:1.6;color:rgba(232,220,200,.75);">${escapeHtml(b.val)}</div>
      </div>
    `).join('')}
  ` : ''}

  ${section('Your Brand Identity', `<strong style="color:#d4a843;">${escapeHtml(result.business_name_idea || '')}</strong><br>${escapeHtml(result.website_blueprint || '')}`)}

  ${(result.vision_services_map || []).length ? `
    <h3 style="margin:32px 0 14px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#c4923a;">Your Vision — What It Costs to Build</h3>
    ${(result.vision_services_map).map(item => `
      <div style="margin-bottom:16px;padding:14px;background:rgba(255,255,255,.02);border:1px solid rgba(232,220,200,.08);border-radius:6px;">
        <div style="font-size:14px;font-weight:600;color:#f7f2ea;margin-bottom:4px;">${escapeHtml(item.vision_element)}</div>
        ${item.quote ? `<div style="font-size:12px;font-style:italic;color:rgba(200,168,75,.7);margin-bottom:8px;">"${escapeHtml(item.quote)}"</div>` : ''}
        ${(item.services || []).map(svc => `
          <div style="display:flex;justify-content:space-between;padding:5px 0;border-top:1px solid rgba(232,220,200,.05);font-size:13px;">
            <span style="color:rgba(232,220,200,.7);">${escapeHtml(svc.name)}</span>
            <span style="color:#d4a843;font-weight:600;">${escapeHtml(svc.price)}</span>
          </div>
        `).join('')}
      </div>
    `).join('')}
  ` : ''}

  ${result.recommended_services && result.recommended_services.length ? `
    <h3 style="margin:32px 0 14px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#c4923a;">Your Full Roadmap — ${escapeHtml(brand.name)} Services</h3>
    ${result.recommended_services.map((s, i) => `
      <div style="border:1px solid rgba(232,220,200,.1);border-radius:4px;padding:14px;margin-bottom:10px;">
        <div style="font-size:11px;color:#c4923a;margin-bottom:4px;">${escapeHtml((s.phase || '').toUpperCase())} · STEP ${s.order || (i + 1)}</div>
        <div style="font-weight:600;color:#f7f2ea;">${escapeHtml(s.name)} <span style="float:right;color:#d4a843;">${escapeHtml(s.price)}</span></div>
        <div style="font-size:14px;color:rgba(232,220,200,.7);margin-top:6px;">${escapeHtml(s.why)}</div>
      </div>
    `).join('')}
    <div style="margin-top:18px;padding:14px;border-top:1px solid rgba(232,220,200,.1);text-align:right;">
      <span style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(232,220,200,.5);">Estimated investment&nbsp;</span>
      <span style="font-size:24px;color:#d4a843;font-weight:600;">$${total.toLocaleString()}</span>
    </div>
  ` : ''}

  ${result.closing_word ? `
    <div style="margin-top:32px;padding:24px;background:rgba(196,146,58,.05);border-left:3px solid #c4923a;font-style:italic;color:#e8dcc8;">
      ${escapeHtml(result.closing_word)}
    </div>
  ` : ''}
</td></tr>

<!-- CTAs -->
<tr><td style="padding:0 40px 32px;text-align:center;">
  <a href="${tierUrl}" style="display:inline-block;background:#c4923a;color:#111009;padding:14px 28px;text-decoration:none;font-weight:600;letter-spacing:.05em;text-transform:uppercase;font-size:13px;border-radius:2px;margin:8px;">Book a Service →</a>
  <br>
  <a href="${resumeUrl}" style="display:inline-block;color:#c4923a;padding:10px;text-decoration:underline;font-size:13px;margin-top:8px;">Resume / finish later</a>
</td></tr>

<!-- Footer -->
<tr><td style="padding:24px 40px;text-align:center;border-top:1px solid rgba(232,220,200,.1);font-size:11px;color:rgba(232,220,200,.4);">
  Generated by <a href="${escapeHtml(brand.url || '#')}" style="color:#c4923a;text-decoration:none;">${escapeHtml(brand.name)}</a>
  &nbsp;·&nbsp; Questions? <a href="mailto:info@swrvonthego.pro" style="color:#c4923a;text-decoration:none;">info@swrvonthego.pro</a>
</td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

function section(label, value) {
  return `
    <h3 style="margin:0 0 8px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#c4923a;">${escapeHtml(label)}</h3>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#e8dcc8;">${value}</p>
  `;
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
