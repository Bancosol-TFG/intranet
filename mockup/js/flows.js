/* Guía de flujos: ciclo de vida de una campaña y qué hace cada rol, con enlaces a cada pantalla. */
window.Flows = (() => {
  const { esc, icon, btn, pageHead } = UI;
  const R = { admin: 'Administración', coord: 'Coordinación', rcol: 'Resp. colaborador', rtienda: 'Resp. grupo' };
  const C = { admin: '#e8590c', coord: '#2563eb', rcol: '#7c3aed', rtienda: '#0f9d58' };
  const PHASES = [
    { t: 'Preparar la campaña', i: 'flag', steps: [
      ['admin', 'Mantener los catálogos', 'Zonas, localidades, cadenas y tipos: se eligen de listas en el resto de formularios.', 'catalogos'],
      ['admin', 'Crear la campaña', 'Asistente por pasos; se puede copiar una campaña anterior. Se crea Planificada y se activa desde su ficha.', 'campanas'],
      ['admin', 'Asignar zonas a coordinadores', 'Por campaña (zone_assignment): cada coordinador ve las tiendas de sus zonas.', 'campanas'],
      ['coord', 'Ajustar la participación de tiendas', 'Las tiendas de los listados participan por defecto; se desmarcan las que no, con motivo.', 'campanas'],
      ['admin', 'Importar los listados de cada cadena', 'Mapear columnas, revisar localidades y cambios de datos. Las nuevas toman la zona de su localidad. Se puede deshacer.', 'importar'],
      ['admin', 'Confirmar a mano las cadenas sin código', 'PDF o email sin identificador: alta manual y confirmación.', 'campanas'] ] },
    { t: 'Colaboradores', i: 'building', steps: [
      ['admin', 'Dar de alta y validar colaboradores', 'En un paso: datos, contactos, coordinación y cuenta del responsable. Coordinación puede proponer altas.', 'colaboradores'],
      ['coord', 'Confirmar su participación', 'Copiados de la campaña anterior como «Pendiente»; se marcan Confirmado o No participa.', 'colaboradores'],
      ['coord', 'Contactar con sus colaboradores', 'Cada coordinador solo ve los suyos en las campañas planificadas o activas.', 'colaboradores'],
      ['coord', 'Asignar tiendas al colaborador', 'En cada campaña. Su responsable gestiona los turnos de esas tiendas.', 'colaboradores'] ] },
    { t: 'Voluntarios', i: 'users', steps: [
      ['rcol', 'Registrar sus voluntarios', 'Solo él ve sus datos. Cada voluntario tiene un identificador global; se reutilizan para no duplicar. Se pueden importar desde Excel.', 'voluntarios'],
      ['rcol', 'Crear o revisar grupos', 'Los grupos se conservan entre campañas y se revisan al empezar. Bancosol solo ve el código y el número de personas.', 'grupos'],
      ['coord', 'Gestionar voluntariado independiente', 'Bancosol actúa como colaborador de sus propios voluntarios.', 'voluntarios'],
      ['rcol', 'Confirmar la propuesta de bajas', 'La app propone quién lleva varias campañas sin participar; lo confirma el responsable de cada colaborador.', 'voluntarios'] ] },
    { t: 'Turnos', i: 'clock', steps: [
      ['coord', 'Asignar grupos, entidades o independientes a turnos', 'Calendario semanal por tienda. Turnos libres además de mañana y tarde; se indica cuántas personas van y se puede superar la capacidad con aviso.', 'turnos'],
      ['rcol', 'Asignar sus grupos en sus tiendas', 'En sus tiendas de la campaña. Los cambios avisan a líderes, responsables y coordinación, con motivo.', 'turnos'] ] },
    { t: 'Días de campaña', i: 'alert', steps: [
      ['rtienda', 'Consultar los turnos de su grupo', 'Dónde y cuándo va su grupo.', 'inicio'],
      ['rtienda', 'Registrar incidencias', 'Ausencias, no presentados, falta de petos…', 'turnos'],
      ['coord', 'Resolver incidencias y buscar sustitutos', 'Avisos al momento; las urgentes salen primero. También las resuelve el responsable del colaborador.', 'incidencias'] ] },
  ];

  function view(S) {
    const admin = S.user.role === 'admin', mine = S.user.role;
    const sel = admin ? (S.f.flowRole || 'todos') : mine;
    const show = st => sel === 'todos' || st[0] === sel;
    const tabs = [['todos', 'Todos los roles'], ...Object.entries(R)].map(([k, l]) => {
      const open = admin || k === mine;
      return open ? `<button class="${sel === k ? 'active' : ''}" data-act="filter" data-k="flowRole" data-v="${k}">${l}</button>`
        : `<button disabled class="locked" title="Solo puedes ver el flujo de tu rol">${icon('lock')}${l}</button>`; }).join('');
    return `${pageHead(admin ? 'Flujos de trabajo' : 'Tu flujo de trabajo', admin ? 'Cómo avanza una campaña y qué hace cada rol en cada fase. Pulsa un paso para ir a su pantalla.' : `Qué te toca hacer como <b>${R[mine]}</b> en cada fase de la campaña. Pulsa un paso para ir a su pantalla.`, '', 'Guía')}
      <div class="row wrap" style="margin-bottom:20px"><div class="seg">${tabs}</div>
        <span class="spacer"></span><div class="row wrap small">${Object.entries(R).map(([k, l]) => `<span class="row"><span class="dot" style="background:${C[k]}"></span>${l}</span>`).join('')}</div></div>
      <div class="flow">${PHASES.map((p, i) => { const steps = p.steps.filter(show); return `
        <div class="flow-phase ${steps.length ? '' : 'dim'}"><div class="flow-head"><span class="flow-n">${i + 1}</span>${icon(p.i)}<b>${p.t}</b></div>
          ${steps.map(([r, t, d, to]) => `<button class="flow-step" data-act="go" data-to="${to}"><span class="small" style="color:${C[r]};font-weight:600">${R[r]}</span><b>${esc(t)}</b><span class="small muted">${esc(d)}</span></button>`).join('') || '<div class="small faint" style="padding:8px">Este rol no participa en esta fase</div>'}
        </div>`; }).join('')}</div>
      ${admin ? '' : `<div class="small muted" style="margin-top:12px">${icon('lock')} Las fases en gris corresponden a otros roles.</div>`}
      <div class="card card-pad" style="margin-top:20px;${admin ? '' : 'display:none'}"><h2 style="margin-bottom:10px">Reglas que vienen de Bancosol</h2><div class="grid g-2 small muted">
        <div>• Solo Administración crea colaboradores y los valida.</div><div>• Un colaborador puede tener varios coordinadores.</div>
        <div>• Jerarquía: decisor → responsable colaborador → responsables de tienda.</div><div>• Los voluntarios entran siempre por un colaborador; Bancosol es colaborador de los independientes y solo tiene los datos de estos.</div><div>• De las entidades, Bancosol solo conoce sus grupos: identificador y número de personas.</div>
        <div>• Si la entidad no gestiona voluntarios en la app, solo se asocia la entidad a la tienda.</div><div>• Las asignaciones no necesitan confirmación.</div>
        <div>• Solo Administración ve el histórico de campañas finalizadas; el resto de roles trabaja con las planificadas o activas.</div><div>• Horario: cada tienda hereda el de su cadena y puede tener uno propio y excepciones por fecha. Pendiente de definir con Bancosol: estadísticas.</div></div></div>`;
  }
  return { view };
})();
