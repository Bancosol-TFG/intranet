(() => {
  const storeRows = [
    ["s01", "Mercado Central", "c-mercado", "z-centro", "Valencia", "46001", "Calle del Mercado, 14", 7, "u-ana", "col-senda", 2, 2, 2, 2, "09:00", "14:00", "16:00", "21:00"],
    ["s02", "Alianza Plaza Mayor", "c-alianza", "z-centro", "Valencia", "46002", "Plaza Mayor, 6", 5, "u-lucia", "col-senda", 2, 2, 1, 2, "09:00", "14:00", "16:00", "21:00"],
    ["s03", "AhorraMás Alameda", "c-ahorra", "z-centro", "Valencia", "46003", "Paseo de la Alameda, 31", 4, "u-marta", "col-senda", 1, 2, 2, 2, "09:00", "14:00", "15:00", "16:00"],
    ["s04", "SuperSol Ruzafa", "c-supersol", "z-centro", "Valencia", "46005", "Calle Sueca, 28", 6, "u-pablo", "col-senda", 2, 2, 2, 2, "09:00", "14:00", "16:00", "21:00"],
    ["s05", "Mercado Colón", "c-mercado", "z-centro", "Valencia", "46004", "Calle Jorge Juan, 19", 8, "u-elena", "col-senda", 2, 2, 1, 2, "09:00", "14:00", "16:00", "21:00"],
    ["s06", "Alianza Benimaclet", "c-alianza", "z-norte", "Valencia", "46020", "Avenida Valladolid, 42", 5, "u-ana", "col-senda", 2, 2, 2, 2, "09:00", "14:00", "16:00", "21:00"],
    ["s07", "SuperSol Primado Reig", "c-supersol", "z-norte", "Valencia", "46010", "Avenida Primado Reig, 77", 6, "u-lucia", "col-senda", 1, 2, 2, 2, "09:00", "14:00", "16:00", "21:00"],
    ["s08", "AhorraMás Orriols", "c-ahorra", "z-norte", "Valencia", "46019", "Calle San Vicente de Paúl, 9", 3, "u-marta", "col-senda", 2, 2, 1, 2, "09:00", "14:00", "16:00", "21:00"],
    ["s09", "Mercado Benicalap", "c-mercado", "z-norte", "Valencia", "46025", "Calle de la Safor, 18", 5, "u-pablo", "col-senda", 2, 2, 2, 2, "09:00", "14:00", "16:00", "21:00"],
    ["s10", "Alianza Tavernes", "c-alianza", "z-norte", "Valencia", "46015", "Calle Tavernes Blanques, 3", 4, "u-elena", "col-senda", 1, 2, 1, 2, "09:00", "14:00", "16:00", "21:00"],
    ["s11", "SuperSol Patraix", "c-supersol", "z-sur", "Valencia", "46018", "Calle Gaspar Aguilar, 52", 6, "u-diego", "col-puentes", 2, 2, 2, 2, "09:00", "14:00", "16:00", "21:00"],
    ["s12", "AhorraMás Jesús", "c-ahorra", "z-sur", "Valencia", "46017", "Calle Campos Crespo, 24", 4, "u-sofia", "col-puentes", 2, 2, 1, 2, "09:00", "14:00", "16:00", "21:00"],
    ["s13", "Mercado Malilla", "c-mercado", "z-sur", "Valencia", "46026", "Calle Pianista Amparo Iturbi, 10", 7, "u-nuria", "col-puentes", 2, 2, 2, 2, "09:00", "14:00", "16:00", "21:00"],
    ["s14", "Alianza Tres Forques", "c-alianza", "z-sur", "Valencia", "46014", "Avenida Tres Forques, 88", 5, "u-javier", "col-puentes", 2, 2, 1, 2, "09:00", "14:00", "16:00", "21:00"],
    ["s15", "SuperSol La Raiosa", "c-supersol", "z-sur", "Valencia", "46007", "Calle Uruguay, 17", 6, "u-ruben", "col-puentes", 1, 2, 2, 2, "09:00", "14:00", "16:00", "21:00"],
    ["s16", "AhorraMás Campanar", "c-ahorra", "z-este", "Valencia", "46015", "Calle Vall de la Ballestera, 12", 5, "u-sofia", "col-puentes", 2, 2, 2, 2, "09:00", "14:00", "16:00", "21:00"],
    ["s17", "Mercado Benimàmet", "c-mercado", "z-este", "Valencia", "46035", "Calle Felipe V, 21", 3, "u-celia", "col-puentes", 1, 2, 1, 2, "09:00", "14:00", "16:00", "21:00"],
    ["s18", "Alianza Nou Moles", "c-alianza", "z-este", "Valencia", "46018", "Calle Brasil, 40", 6, "u-diego", "col-puentes", 2, 2, 2, 2, "09:00", "14:00", "16:00", "21:00"],
    ["s19", "SuperSol Campanar", "c-supersol", "z-este", "Valencia", "46015", "Avenida Pío XII, 64", 8, "u-nuria", "col-puentes", 2, 2, 1, 2, "09:00", "14:00", "16:00", "21:00"],
    ["s20", "Mercado Mislata", "c-mercado", "z-oeste", "Mislata", "46920", "Calle San Antonio, 33", 5, "u-javier", "col-puentes", 2, 2, 2, 2, "09:00", "14:00", "16:00", "21:00"],
    ["s21", "Alianza Quart", "c-alianza", "z-oeste", "Quart de Poblet", "46930", "Avenida San Onofre, 51", 4, "u-ruben", "col-puentes", 1, 2, 2, 2, "09:00", "14:00", "16:00", "21:00"],
    ["s22", "SuperSol Burjassot", "c-supersol", "z-oeste", "Burjassot", "46100", "Calle Jorge Juan, 7", 6, "u-celia", "col-puentes", 2, 2, 1, 2, "09:00", "14:00", "16:00", "21:00"],
    ["s23", "AhorraMás Paterna", "c-ahorra", "z-oeste", "Paterna", "46980", "Calle Mayor, 102", 5, "u-diego", "col-puentes", 2, 2, 2, 2, "09:00", "14:00", "16:00", "21:00"],
    ["s24", "Mercado Oeste", "c-mercado", "z-oeste", "Paterna", "46980", "Avenida Europa, 15", 4, null, "col-puentes", 1, 2, 1, 2, "09:00", "14:00", "16:00", "21:00"]
  ];

  const stores = storeRows.map((row, index) => ({
    id: row[0],
    name: row[1],
    chainId: row[2],
    zoneId: row[3],
    locality: row[4],
    postalCode: row[5],
    address: row[6],
    checkoutShelfs: row[7],
    managerId: row[8],
    collaboratorId: row[9],
    coverage: {
      morning: { assigned: row[10], total: row[11] },
      afternoon: { assigned: row[12], total: row[13] }
    },
    schedule: {
      morning: { opening: row[14], closing: row[15] },
      afternoon: { opening: row[16], closing: row[17] }
    },
    order: index + 1
  }));

  const users = [
    { id: "u-admin", name: "Alex Demo", email: "admin@demo.local", phone: "+34 600 100 001", roles: ["ADMIN"], collaboratorId: null },
    { id: "u-ana", name: "Ana Ruiz", email: "ana.ruiz@demo.local", phone: "+34 600 100 002", roles: ["COORDINATOR", "STORE-MANAGER"], collaboratorId: "col-senda" },
    { id: "u-marco", name: "Marco Soler", email: "marco.soler@demo.local", phone: "+34 600 100 003", roles: ["COORDINATOR"], collaboratorId: "col-puentes" },
    { id: "u-lucia", name: "Lucía Navarro", email: "lucia.navarro@demo.local", phone: "+34 600 100 004", roles: ["COLLABORATOR-MANAGER", "STORE-MANAGER"], collaboratorId: "col-senda" },
    { id: "u-marta", name: "Marta Gil", email: "marta.gil@demo.local", phone: "+34 600 100 005", roles: ["STORE-MANAGER"], collaboratorId: "col-senda" },
    { id: "u-pablo", name: "Pablo Ferrer", email: "pablo.ferrer@demo.local", phone: "+34 600 100 006", roles: ["STORE-MANAGER"], collaboratorId: "col-senda" },
    { id: "u-elena", name: "Elena Costa", email: "elena.costa@demo.local", phone: "+34 600 100 007", roles: ["STORE-MANAGER"], collaboratorId: "col-senda" },
    { id: "u-diego", name: "Diego Martín", email: "diego.martin@demo.local", phone: "+34 600 100 008", roles: ["STORE-MANAGER"], collaboratorId: "col-puentes" },
    { id: "u-sofia", name: "Sofía Vidal", email: "sofia.vidal@demo.local", phone: "+34 600 100 009", roles: ["COLLABORATOR-MANAGER", "STORE-MANAGER"], collaboratorId: "col-puentes" },
    { id: "u-nuria", name: "Nuria León", email: "nuria.leon@demo.local", phone: "+34 600 100 010", roles: ["STORE-MANAGER"], collaboratorId: "col-puentes" },
    { id: "u-javier", name: "Javier Mora", email: "javier.mora@demo.local", phone: "+34 600 100 011", roles: ["STORE-MANAGER"], collaboratorId: "col-puentes" },
    { id: "u-ruben", name: "Rubén Alba", email: "ruben.alba@demo.local", phone: "+34 600 100 012", roles: ["STORE-MANAGER"], collaboratorId: "col-puentes" },
    { id: "u-celia", name: "Celia Roca", email: "celia.roca@demo.local", phone: "+34 600 100 013", roles: ["STORE-MANAGER"], collaboratorId: "col-puentes" }
  ];

  const chains = [
    { id: "c-mercado", name: "Mercado Uno", code: "MU" },
    { id: "c-alianza", name: "Alianza", code: "AL" },
    { id: "c-supersol", name: "SuperSol", code: "SS" },
    { id: "c-ahorra", name: "AhorraMás", code: "AM" }
  ];

  const zones = [
    { id: "z-centro", name: "Centro", code: "CEN", coordinatorId: "u-ana" },
    { id: "z-norte", name: "Norte", code: "NOR", coordinatorId: "u-ana" },
    { id: "z-sur", name: "Sur", code: "SUR", coordinatorId: "u-marco" },
    { id: "z-este", name: "Este", code: "EST", coordinatorId: "u-marco" },
    { id: "z-oeste", name: "Oeste", code: "OES", coordinatorId: "u-marco" }
  ].map((zone) => ({ ...zone, storeIds: stores.filter((store) => store.zoneId === zone.id).map((store) => store.id) }));

  const volunteers = [
    { id: "v-01", alias: "Voluntario V-01", collaboratorId: "col-senda" },
    { id: "v-02", alias: "Voluntario V-02", collaboratorId: "col-senda" },
    { id: "v-03", alias: "Voluntario V-03", collaboratorId: "col-senda" },
    { id: "v-04", alias: "Voluntario V-04", collaboratorId: "col-senda" },
    { id: "v-05", alias: "Voluntario V-05", collaboratorId: "col-senda" },
    { id: "v-06", alias: "Voluntario V-06", collaboratorId: "col-senda" },
    { id: "v-07", alias: "Voluntario V-07", collaboratorId: "col-senda" },
    { id: "v-08", alias: "Voluntario V-08", collaboratorId: "col-puentes" },
    { id: "v-09", alias: "Voluntario V-09", collaboratorId: "col-puentes" },
    { id: "v-10", alias: "Voluntario V-10", collaboratorId: "col-puentes" },
    { id: "v-11", alias: "Voluntario V-11", collaboratorId: "col-puentes" },
    { id: "v-12", alias: "Voluntario V-12", collaboratorId: "col-puentes" }
  ];

  const campaignTypes = [
    { id: "type-annual", name: "Recogida anual" },
    { id: "type-seasonal", name: "Recogida estacional" },
    { id: "type-special", name: "Operación especial" }
  ];

  const campaigns = [
    { id: "grand", name: "Gran Recogida", typeId: "type-annual", startDate: "2026-11-09", endDate: "2026-11-29", status: "En curso", readOnly: false, storeIds: null },
    { id: "spring", name: "Recogida de Primavera", typeId: "type-seasonal", startDate: "2026-03-16", endDate: "2026-03-22", status: "Finalizada", readOnly: true, storeIds: ["s01", "s02", "s03", "s04", "s05", "s06", "s07", "s08"] }
  ];

  const collaborators = [
    { id: "col-senda", name: "Fundación Senda", address: "Calle de la Solidaridad, 8", locality: "Valencia", responsibleId: "u-lucia", contactIds: ["u-lucia", "u-ana"], groups: [{ id: "g-senda-centro", name: "Grupo Centro", leaderId: "u-ana", volunteerCount: 4 }, { id: "g-senda-norte", name: "Grupo Norte", leaderId: "u-lucia", volunteerCount: 3 }], campaignIds: ["grand", "spring"] },
    { id: "col-puentes", name: "Red Puentes", address: "Avenida del Encuentro, 24", locality: "Valencia", responsibleId: "u-sofia", contactIds: ["u-sofia", "u-marco"], groups: [{ id: "g-puentes-sur", name: "Grupo Sur", leaderId: "u-marco", volunteerCount: 3 }, { id: "g-puentes-oeste", name: "Grupo Oeste", leaderId: "u-sofia", volunteerCount: 2 }], campaignIds: ["grand"] }
  ];

  const reports = [
    { id: "r01", campaignId: "grand", creationDate: "2026-11-10", resolutionDate: null, type: "Acceso", description: "Falta confirmar el acceso al almacén antes de la apertura de la franja.", solution: null, reportedBy: "u-lucia", solvedBy: null },
    { id: "r02", campaignId: "grand", creationDate: "2026-11-11", resolutionDate: null, type: "Material", description: "El punto de recogida necesita una mesa adicional para ordenar las cajas.", solution: null, reportedBy: "u-marta", solvedBy: null },
    { id: "r03", campaignId: "grand", creationDate: "2026-11-12", resolutionDate: null, type: "Horario", description: "El horario de tarde se actualizó después de publicar los turnos.", solution: null, reportedBy: "u-ana", solvedBy: null },
    { id: "r04", campaignId: "grand", creationDate: "2026-11-14", resolutionDate: null, type: "Logística", description: "Se solicita confirmar el lugar de entrega del material informativo.", solution: null, reportedBy: "u-pablo", solvedBy: null },
    { id: "r05", campaignId: "grand", creationDate: "2026-11-12", resolutionDate: "2026-11-13", type: "Material", description: "Faltaban carteles para señalizar el punto de recogida.", solution: "Se entregaron los carteles en el punto de encuentro.", reportedBy: "u-elena", solvedBy: "u-ana" },
    { id: "r06", campaignId: "grand", creationDate: "2026-11-10", resolutionDate: "2026-11-11", type: "Acceso", description: "La puerta lateral permanecía cerrada al inicio del turno.", solution: "Se coordinó la apertura con el personal del establecimiento.", reportedBy: "u-lucia", solvedBy: "u-ana" },
    { id: "r07", campaignId: "spring", creationDate: "2026-03-20", resolutionDate: "2026-03-21", type: "Logística", description: "Se modificó el punto de entrega de material de la campaña.", solution: "El nuevo punto quedó indicado en la ficha de la tienda.", reportedBy: "u-ana", solvedBy: "u-lucia" }
  ];

  const conflicts = [
    { id: "cf01", campaignId: "grand", type: "same-person", date: "2026-11-10", slot: "morning", collaboratorId: "col-senda", volunteerAlias: "Voluntario V-07", storeIds: ["s01", "s02"], assignerIds: ["u-ana", "u-lucia"], reason: "La misma persona aparece asignada en dos tiendas de Fundación Senda durante la misma franja." },
    { id: "cf02", campaignId: "grand", type: "outside-hours", date: "2026-11-12", slot: "afternoon", collaboratorId: "col-senda", volunteerAlias: "Voluntario V-02", storeIds: ["s03"], assignerIds: ["u-marta"], reason: "El cierre del establecimiento cambió a las 16:00 después de asignar un turno de 17:00 a 21:00." }
  ];

  const slotOverrides = [
    { date: "2026-11-09", slot: "morning", complete: true },
    { date: "2026-11-09", slot: "afternoon", complete: true },
    { date: "2026-11-13", slot: "afternoon", complete: true }
  ];

  const audit = [
    { id: "a01", date: "2026-11-14 09:12", action: "Consulta de calendario", entity: "Gran Recogida", actorId: "u-ana" },
    { id: "a02", date: "2026-11-13 16:40", action: "Resolución de incidencia", entity: "Incidencia r05", actorId: "u-ana" },
    { id: "a03", date: "2026-11-12 13:25", action: "Actualización de horario", entity: "AhorraMás Alameda", actorId: "u-marta" },
    { id: "a04", date: "2026-11-11 10:05", action: "Asignación de turno", entity: "Mercado Central", actorId: "u-ana" },
    { id: "a05", date: "2026-11-10 08:30", action: "Creación de incidencia", entity: "Incidencia r01", actorId: "u-lucia" },
    { id: "a06", date: "2026-11-09 17:10", action: "Acceso a campaña", entity: "Gran Recogida", actorId: "u-admin" }
  ];

  const notifications = [
    { id: "n01", kind: "calendar", title: "Conflicto detectado en una franja", detail: "10 nov · mañana · 2 tiendas", date: "2026-11-10", slot: "morning", conflictId: "cf01" },
    { id: "n02", kind: "report", title: "Incidencia pendiente de respuesta", detail: "Acceso · creada el 10 nov", reportId: "r01" },
    { id: "n03", kind: "store", title: "Asignación de turnos actualizada", detail: "SuperSol Ruzafa · 11 nov", storeId: "s04" }
  ];

  window.CONFIG = { SHOW_SECTIONS_IN_NAV: true };
  window.ICONS = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9M9 21v-7h6v7"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>',
    store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 10h18l-1.4-6H4.4L3 10Z"/><path d="M5 10v10h14V10M9 20v-6h6v6"/><path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M10.3 3.9 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 9h18M8 13h2M14 13h2M8 17h2"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M9.6 9a2.5 2.5 0 1 1 4.5 1.5c-1 1.1-2.1 1.3-2.1 3M12 17h.01"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m7 10 5 5 5-5"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m15 18-6-6 6-6"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9 18 6-6-6-6"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M10.3 3.9 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 3h3l2 5-2 1.5a15 15 0 0 0 4.5 4.5L16 12l5 2v3c0 1.1-.9 2-2 2C10.7 19 5 13.3 5 6c0-1.7.7-3 2-3Z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 21V5l8-3v19M12 8h8v13M2 21h20"/><path d="M7 7h2M7 11h2M7 15h2M15 12h2M15 16h2"/></svg>',
    audit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 3h8l4 4v14H4V3h4ZM8 12h8M8 16h8M8 8h3"/><path d="M16 3v5h4"/></svg>',
    campaign: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 20h16M6 17l1-8 5-5 5 5 1 8M9 12h6M12 4V2"/><path d="M10 17v-3h4v3"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m4 16.5-.8 4.3 4.3-.8L19 8.5 15.5 5 4 16.5Z"/><path d="m13.5 7 3.5 3.5"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M9 6h12M9 12h12M9 18h12M3 6h.01M3 12h.01M3 18h.01"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/></svg>'
  };

  window.MOCK_DATA = {
    roleNames: {
      admin: "ADMIN",
      coordinator: "COORDINATOR",
      collaboratorManager: "COLLABORATOR-MANAGER",
      storeManager: "STORE-MANAGER",
      volunteer: "VOLUNTEER"
    },
    users,
    chains,
    zones,
    stores,
    volunteers,
    collaborators,
    campaignTypes,
    campaigns,
    zoneAssignments: [
      { campaignId: "grand", userId: "u-ana", zoneIds: ["z-centro", "z-norte"] },
      { campaignId: "grand", userId: "u-marco", zoneIds: ["z-sur", "z-este", "z-oeste"] },
      { campaignId: "spring", userId: "u-ana", zoneIds: ["z-centro"] },
      { campaignId: "spring", userId: "u-marco", zoneIds: ["z-norte"] }
    ],
    reports,
    conflicts,
    slotOverrides,
    audit,
    notifications
  };
})();
