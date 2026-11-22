/* Componentes de UI reutilizables. Cada uno devuelve HTML (string).
   Pensados para migrar 1:1 a componentes del frontend real (Button, Badge, Card, Table, Drawer...). */
window.UI = (() => {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const paths = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    flag: '<path d="M4 21V4m0 0h12l-2 4 2 4H4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    store: '<path d="M3 9l1.5-5h15L21 9M3 9v11h18V9M3 9h18M9 20v-6h6v6"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    cog: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m14 6 4 4"/>', trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>', check: '<path d="m5 12 5 5L20 7"/>', chev: '<path d="m9 6 6 6-6 6"/>', back: '<path d="m15 6-6 6 6 6"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>', pin: '<path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>', phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    logout: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3"/>', moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8"/>', bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>',
    upload: '<path d="M12 16V4m0 0-4 4m4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>', map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/>', route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h8a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h8"/>', building: '<path d="M4 21V5l8-3 8 3v16M9 21v-4h6v4M8 9h.01M12 9h.01M16 9h.01M8 13h.01M12 13h.01M16 13h.01"/>', file: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8zM14 3v5h5"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>', menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>', sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    sidebar: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01"/>', expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    alert: '<path d="M12 3 2 20h20zM12 10v4M12 17h.01"/>', heart: '<path d="M12 20s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z"/>',
  };
  const icon = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24">${paths[n] || ''}</svg>`;

  const palette = ['#e8590c', '#2563eb', '#7c3aed', '#0f9d58', '#db2777', '#0891b2', '#ca8a04'];
  const initials = n => (n || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const avatar = (name, size = '') => {
    const c = palette[[...(name || '')].reduce((a, ch) => a + ch.charCodeAt(0), 0) % palette.length];
    return `<span class="avatar ${size}" style="background:${c}" title="${esc(name)}">${esc(initials(name))}</span>`;
  };

  const tone = { Activa: 'ok', Activo: 'ok', Disponible: 'info', Completo: 'ok', Planificada: 'info', Finalizada: '', Pendiente: 'warn', Inactivo: '', Inactiva: '', Borrador: '', 'Sin cubrir': 'danger', Parcial: 'warn', Cubierto: 'ok' };
  const badge = (text, t) => `<span class="badge ${t ?? tone[text] ?? ''}">${esc(text)}</span>`;

  const btn = (label, { kind = '', icon: ic, act, data = '', size = '', title = '' } = {}) =>
    `<button class="btn ${kind} ${size} ${label ? '' : 'icon'}" ${act ? `data-act="${act}"` : ''} ${data} ${title ? `title="${esc(title)}" ${label ? '' : `aria-label="${esc(title)}"`}` : ''}>${ic ? icon(ic) : ''}${label ? esc(label) : ''}</button>`;

  const progress = (pct, t = '') => `<div class="progress ${t}"><i style="width:${Math.max(0, Math.min(100, pct))}%"></i></div>`;

  const empty = (title, text, action = '') => `<div class="empty"><div class="ic">${icon('box')}</div><h3>${esc(title)}</h3><p class="small">${esc(text)}</p>${action}</div>`;

  const pageHead = (title, sub, actions = '', eyebrow = '') =>
    `<div class="page-head"><div>${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ''}<h1>${esc(title)}</h1>${sub ? `<p>${sub}</p>` : ''}</div><div class="row wrap">${actions}</div></div>`;

  const kpi = (label, value, ic, foot = '') => `<div class="card kpi"><div class="label">${esc(label)}<span class="ic">${icon(ic)}</span></div><div class="value">${value}</div><div class="small muted">${foot}</div></div>`;

  /* Tabla genérica: columns = [{ label, render(row), width }] */
  const table = (columns, rows, { rowAct, emptyText = 'No hay resultados con estos filtros.' } = {}) => (columns = columns.filter(Boolean), rows.length)
    ? `<div class="table-wrap"><table><thead><tr>${columns.map(c => `<th style="${c.width ? `width:${c.width}` : ''}">${esc(c.label)}</th>`).join('')}</tr></thead><tbody>${rows.map(r =>
      `<tr class="${rowAct ? 'click' : ''}" ${rowAct ? `data-act="${rowAct}" data-id="${r.id}"` : ''}>${columns.map(c => `<td>${c.render(r)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
    : empty('Sin resultados', emptyText);

  const rowActions = (entity, id) => `<div class="actions">${btn('', { kind: 'ghost', size: 'sm', icon: 'edit', act: 'edit', data: `data-entity="${entity}" data-id="${id}"`, title: 'Editar' })}${btn('', { kind: 'ghost danger', size: 'sm', icon: 'trash', act: 'delete', data: `data-entity="${entity}" data-id="${id}"`, title: 'Eliminar' })}</div>`;

  /* Formularios generados desde un esquema: { key, label, type, options, full, hint, required } */
  const opts = f => (typeof f.options === 'function' ? f.options() : f.options).map(o => Array.isArray(o) ? o : [o, o]);
  const field = (f, v) => {
    const val = v ?? f.default ?? '';
    let input;
    if (f.type === 'select') input = `<select class="input" name="${f.key}" ${f.required ? 'required' : ''}>${opts(f).map(([ov, ol]) => `<option value="${esc(ov)}" ${String(ov) === String(val) ? 'selected' : ''}>${esc(ol)}</option>`).join('')}</select>`;
    else if (f.type === 'multi') { const sel = (Array.isArray(val) ? val : []).map(String);
      input = `<div class="multi">${opts(f).map(([ov, ol]) => `<label class="mchip"><input type="checkbox" name="${f.key}" value="${esc(ov)}" ${sel.includes(String(ov)) ? 'checked' : ''}><span>${esc(ol)}</span></label>`).join('') || '<span class="small faint">No hay opciones: créalas en Catálogos</span>'}</div>`; }
    else if (f.type === 'textarea') input = `<textarea class="input" name="${f.key}">${esc(val)}</textarea>`;
    else input = `<input class="input" name="${f.key}" type="${f.type || 'text'}" value="${esc(val)}" ${f.required ? 'required' : ''} ${f.pattern ? `pattern="${f.pattern}" title="${esc(f.title || '')}"` : ''} placeholder="${esc(f.placeholder || '')}">`;
    return `<div class="field ${f.full ? 'full' : ''}"><label>${esc(f.label)}${f.required ? ' <span style="color:var(--danger)">*</span>' : ''}${f.proposed ? ' <span class="prop" title="Este campo no existe todavía en model.dbml">Propuesta</span>' : ''}</label>${input}${f.hint ? `<span class="hint">${esc(f.hint)}</span>` : ''}</div>`;
  };
  const form = (schema, obj = {}) => `<form id="entity-form" class="form-grid">${schema.map(f => field(f, obj[f.key])).join('')}</form>`;
  const readForm = (schema) => {
    const fd = new FormData(document.getElementById('entity-form')); const out = {};
    schema.forEach(f => { if (f.type === 'multi') { out[f.key] = fd.getAll(f.key).map(x => f.numeric ? Number(x) : x); return; }
      let v = fd.get(f.key); if (f.type === 'number') v = Number(v); else if (f.numeric) v = v === '' || v == null ? null : Number(v); out[f.key] = v; });
    return out;
  };
  const link = (to, label, cls = '') => `<a class="ref ${cls}" href="#/${to}" data-act="go" data-to="${to}">${label}</a>`;

  /* Overlays */
  const overlay = document.getElementById('overlay');
  const close = () => { overlay.innerHTML = ''; };
  const drawer = (title, body, foot, sub = '') => {
    overlay.innerHTML = `<div class="backdrop" data-act="close"></div><aside class="drawer"><div class="drawer-head"><div><h2>${esc(title)}</h2>${sub ? `<div class="small muted">${sub}</div>` : ''}</div><div class="row">${btn('', { kind: 'ghost', icon: 'expand', act: 'panel-size', title: 'Pantalla completa' })}${btn('', { kind: 'ghost', icon: 'x', act: 'close' })}</div></div><div class="drawer-body">${body}</div>${foot ? `<div class="drawer-foot">${foot}</div>` : ''}</aside>`;
    overlay.querySelector('input,select')?.focus();
  };
  const modal = (title, body, foot, size = '') => {
    overlay.innerHTML = `<div class="backdrop" data-act="close"></div><div class="modal ${size}"><div class="modal-head"><h2>${esc(title)}</h2>${btn('', { kind: 'ghost', icon: 'x', act: 'close' })}</div><div class="modal-body">${body}</div>${foot ? `<div class="modal-foot">${foot}</div>` : ''}</div>`;
    overlay.querySelector('input')?.focus();
  };
  const confirm = (title, text, onOk, okLabel = 'Eliminar') => {
    modal(title, `<p class="muted" style="margin:0">${text}</p>`, btn('Cancelar', { act: 'close' }) + btn(okLabel, { kind: 'danger solid', act: 'confirm-ok' }), 'sm');
    UI._onConfirm = onOk;
  };

  /* Ayuda contextual: el botón «?» abre el panel con la ayuda de la vista actual */
  const HELP = {
    inicio: 'Resumen de la campaña activa: avisos, turnos sin cubrir y actividad reciente.',
    turnos: 'Calendario de la campaña activa. Selecciona un turno y arrastra o elige en el panel derecho los grupos o voluntarios compatibles.',
    incidencias: 'Incidencias de la campaña activa por tipo. Cada tipo tiene sus propias acciones.',
    campanas: 'Crea campañas con el asistente. La coordinación se asigna en un paso final opcional.',
    tiendas: 'Catálogo de tiendas. La participación (pendiente, participa, no participa) es por campaña.',
    colaboradores: 'Entidades colaboradoras y su participación en la campaña activa.',
    usuarios: 'Matriz de permisos de solo lectura. Para editarla abre el panel y confirma los cambios.',
    importar: 'Importa tiendas desde Excel o CSV y elige si entran como pendientes o como participantes.',
  };
  const help = (page, title) => drawer(`Ayuda · ${title || page}`, `<p>${esc(HELP[page] || 'Esta vista todavía no tiene ayuda específica.')}</p><p class="small muted">Consulta el flujo completo de tu rol en <a class="ref" href="#/flujos" data-act="go" data-to="flujos">Flujos de trabajo</a>.</p>`);

  const toast = (msg, undo) => {
    const el = document.createElement('div'); el.className = 'toast';
    el.innerHTML = `${icon('check')}<span>${msg}</span>${undo ? '<button>Deshacer</button>' : ''}`;
    if (undo) el.querySelector('button').onclick = () => { undo(); el.remove(); };
    document.getElementById('toasts').append(el); setTimeout(() => el.remove(), 4000);
  };

  const fmtDate = (d, opts = { day: 'numeric', month: 'short' }) => new Date(d + 'T12:00').toLocaleDateString('es-ES', opts);
  const fmtNum = n => Number(n).toLocaleString('es-ES');

  return { help, link, esc, icon, avatar, badge, btn, progress, empty, pageHead, kpi, table, rowActions, form, readForm, drawer, modal, confirm, close, toast, fmtDate, fmtNum, initials };
})();
