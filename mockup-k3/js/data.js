const CONFIG = {
  SHOW_SECTIONS_IN_NAV: true
};

const DEFAULT_SCHEDULE = {
  1: { opening: "09:00", closing: "21:30" },
  2: { opening: "09:00", closing: "21:30" },
  3: { opening: "09:00", closing: "21:30" },
  4: { opening: "09:00", closing: "21:30" },
  5: { opening: "09:00", closing: "21:30" },
  6: { opening: "09:30", closing: "21:30" },
  7: { opening: "10:00", closing: "20:00" }
};

const chains = [
  { id: 1, name: "Alimenta", code: "ALI" },
  { id: 2, name: "Cesta Local", code: "CES" },
  { id: 3, name: "Mercaval", code: "MER" },
  { id: 4, name: "Clarobox", code: "CLA" }
];

const localities = [
  { id: 1, name: "Valverde", postalCode: "28001" },
  { id: 2, name: "San Adrián", postalCode: "28002" },
  { id: 3, name: "Los Olivos", postalCode: "28003" },
  { id: 4, name: "Puente Nuevo", postalCode: "28004" },
  { id: 5, name: "La Ribera", postalCode: "28005" }
];

const zones = [
  { id: 1, name: "Norte", code: "ZN-N", coordinatorId: 2 },
  { id: 2, name: "Centro", code: "ZN-C", coordinatorId: 2 },
  { id: 3, name: "Sur", code: "ZN-S", coordinatorId: 3 },
  { id: 4, name: "Este", code: "ZN-E", coordinatorId: 3 },
  { id: 5, name: "Oeste", code: "ZN-O", coordinatorId: 4 }
];

const users = [
  { id: 1, name: "Lucía Sanz", email: "lucia.sanz@example.test", phone: "+34 600 100 001", roles: ["ADMIN"] },
  { id: 2, name: "Daniel Ortega", email: "daniel.ortega@example.test", phone: "+34 600 100 002", roles: ["COORDINATOR"] },
  { id: 3, name: "Marta Vidal", email: "marta.vidal@example.test", phone: "+34 600 100 003", roles: ["COORDINATOR"] },
  { id: 4, name: "Pablo León", email: "pablo.leon@example.test", phone: "+34 600 100 004", roles: ["COORDINATOR"] },
  { id: 5, name: "Elena Campos", email: "elena.campos@example.test", phone: "+34 600 100 005", roles: ["COLLABORATOR-MANAGER"] },
  { id: 6, name: "Jorge Miranda", email: "jorge.miranda@example.test", phone: "+34 600 100 006", roles: ["COLLABORATOR-MANAGER"] },
  { id: 7, name: "Sara Beltrán", email: "sara.beltran@example.test", phone: "+34 600 100 007", roles: ["STORE-MANAGER"] },
  { id: 8, name: "Iván Ruiz", email: "ivan.ruiz@example.test", phone: "+34 600 100 008", roles: ["STORE-MANAGER"] },
  { id: 9, name: "Nuria Ferrer", email: "nuria.ferrer@example.test", phone: "+34 600 100 009", roles: ["STORE-MANAGER"] },
  { id: 10, name: "Óscar Molina", email: "oscar.molina@example.test", phone: "+34 600 100 010", roles: ["STORE-MANAGER"] },
  { id: 11, name: "Clara Serrano", email: "clara.serrano@example.test", phone: "+34 600 100 011", roles: ["STORE-MANAGER"] },
  { id: 12, name: "Andrés Prieto", email: "andres.prieto@example.test", phone: "+34 600 100 012", roles: ["STORE-MANAGER"] },
  { id: 13, name: "Mireia Costa", email: "mireia.costa@example.test", phone: "+34 600 100 013", roles: ["STORE-MANAGER"] },
  { id: 14, name: "Hugo Navarro", email: "hugo.navarro@example.test", phone: "+34 600 100 014", roles: ["STORE-MANAGER"] },
  { id: 15, name: "Teresa Gil", email: "teresa.gil@example.test", phone: "+34 600 100 015", roles: ["STORE-MANAGER"] },
  { id: 16, name: "Rubén Pardo", email: "ruben.pardo@example.test", phone: "+34 600 100 016", roles: ["STORE-MANAGER"] },
  { id: 17, name: "Alicia Roca", email: "alicia.roca@example.test", phone: "+34 600 100 017", roles: ["STORE-MANAGER"] },
  { id: 18, name: "Marcos Vera", email: "marcos.vera@example.test", phone: "+34 600 100 018", roles: ["STORE-MANAGER"] },
  { id: 19, name: "Patricia Soler", email: "patricia.soler@example.test", phone: "+34 600 100 019", roles: ["STORE-MANAGER"] },
  { id: 20, name: "Fernando Cano", email: "fernando.cano@example.test", phone: "+34 600 100 020", roles: ["STORE-MANAGER"] },
  { id: 21, name: "Beatriz Lago", email: "beatriz.lago@example.test", phone: "+34 600 100 021", roles: ["STORE-MANAGER"] },
  { id: 22, name: "Raúl Santos", email: "raul.santos@example.test", phone: "+34 600 100 022", roles: ["STORE-MANAGER"] },
  { id: 23, name: "Inés Bravo", email: "ines.bravo@example.test", phone: "+34 600 100 023", roles: ["STORE-MANAGER"] },
  { id: 24, name: "Víctor Peña", email: "victor.pena@example.test", phone: "+34 600 100 024", roles: ["STORE-MANAGER"] }
];

const collaborators = [
  {
    id: 1,
    name: "Entidad Solidaria del Valle",
    address: "Avenida de la Cooperación, 12",
    localityId: 1,
    managerId: 5,
    volunteerCount: 6,
    contacts: [
      { id: 101, name: "Elena Campos", email: "elena.campos@example.test", phone: "+34 600 100 005" },
      { id: 102, name: "Samuel Delgado", email: "samuel.delgado@example.test", phone: "+34 600 100 101" }
    ],
    groups: [
      { id: 1001, name: "Grupo Mañanas", leaderId: 7, volunteerCount: 3 },
      { id: 1002, name: "Grupo Tardes", leaderId: 8, volunteerCount: 3 }
    ]
  },
  {
    id: 2,
    name: "Asociación Puente Activo",
    address: "Calle del Encuentro, 8",
    localityId: 3,
    managerId: 6,
    volunteerCount: 6,
    contacts: [
      { id: 201, name: "Jorge Miranda", email: "jorge.miranda@example.test", phone: "+34 600 100 006" },
      { id: 202, name: "Lorena Arias", email: "lorena.arias@example.test", phone: "+34 600 100 201" }
    ],
    groups: [
      { id: 2001, name: "Grupo Centro", leaderId: 9, volunteerCount: 3 },
      { id: 2002, name: "Grupo Barrios", leaderId: 10, volunteerCount: 3 }
    ]
  }
];

const stores = [
  { id: 1, name: "Alimenta Central", chainId: 1, localityId: 1, zoneId: 1, collaboratorId: 1, managerId: 7, address: "Plaza Mayor, 1", checkouts: 5, required: 3, previousCoordinatorId: 2 },
  { id: 2, name: "Alimenta Estación", chainId: 1, localityId: 2, zoneId: 2, collaboratorId: 1, managerId: 8, address: "Paseo de la Estación, 14", checkouts: 4, required: 3, previousCoordinatorId: 2 },
  { id: 3, name: "Alimenta del Parque", chainId: 1, localityId: 3, zoneId: 3, collaboratorId: 2, managerId: 9, address: "Avenida del Parque, 22", checkouts: 3, required: 2, previousCoordinatorId: 3 },
  { id: 4, name: "Alimenta Ribera", chainId: 1, localityId: 5, zoneId: 4, collaboratorId: 2, managerId: 10, address: "Calle Ribera, 6", checkouts: 4, required: 2, previousCoordinatorId: 3 },
  { id: 5, name: "Alimenta Puente", chainId: 1, localityId: 4, zoneId: 5, collaboratorId: 1, managerId: 11, address: "Camino del Puente, 3", checkouts: 3, required: 2, previousCoordinatorId: null },
  { id: 6, name: "Alimenta Los Álamos", chainId: 1, localityId: 1, zoneId: 1, collaboratorId: 1, managerId: 12, address: "Calle Los Álamos, 19", checkouts: 2, required: 2, previousCoordinatorId: 2 },
  { id: 7, name: "Cesta Ayuntamiento", chainId: 2, localityId: 2, zoneId: 2, collaboratorId: 2, managerId: 13, address: "Calle Consistorio, 4", checkouts: 4, required: 3, previousCoordinatorId: 2 },
  { id: 8, name: "Cesta del Mercado", chainId: 2, localityId: 3, zoneId: 3, collaboratorId: 2, managerId: null, address: "Plaza del Mercado, 9", checkouts: 3, required: 2, previousCoordinatorId: 3 },
  { id: 9, name: "Cesta La Ermita", chainId: 2, localityId: 4, zoneId: 1, collaboratorId: 1, managerId: 14, address: "Subida a la Ermita, 2", checkouts: 2, required: 2, previousCoordinatorId: null },
  { id: 10, name: "Cesta Mirador", chainId: 2, localityId: 5, zoneId: 4, collaboratorId: 1, managerId: 15, address: "Avenida del Mirador, 30", checkouts: 4, required: 2, previousCoordinatorId: 3 },
  { id: 11, name: "Cesta Olivar", chainId: 2, localityId: 3, zoneId: 5, collaboratorId: 2, managerId: 16, address: "Camino del Olivar, 17", checkouts: 2, required: 2, previousCoordinatorId: null },
  { id: 12, name: "Cesta Universidad", chainId: 2, localityId: 2, zoneId: 2, collaboratorId: 2, managerId: 17, address: "Calle Universidad, 11", checkouts: 5, required: 3, previousCoordinatorId: 2 },
  { id: 13, name: "Mercaval Norte", chainId: 3, localityId: 1, zoneId: 1, collaboratorId: 1, managerId: 18, address: "Avenida Norte, 44", checkouts: 6, required: 3, previousCoordinatorId: 2 },
  { id: 14, name: "Mercaval San Roque", chainId: 3, localityId: 2, zoneId: 2, collaboratorId: 2, managerId: 19, address: "Plaza San Roque, 5", checkouts: 3, required: 2, previousCoordinatorId: 2 },
  { id: 15, name: "Mercaval del Río", chainId: 3, localityId: 5, zoneId: 4, collaboratorId: 1, managerId: 20, address: "Paseo del Río, 18", checkouts: 4, required: 2, previousCoordinatorId: 3 },
  { id: 16, name: "Mercaval Las Flores", chainId: 3, localityId: 4, zoneId: 5, collaboratorId: 2, managerId: 21, address: "Calle Las Flores, 7", checkouts: 2, required: 2, previousCoordinatorId: null },
  { id: 17, name: "Mercaval Sur", chainId: 3, localityId: 3, zoneId: 3, collaboratorId: 2, managerId: 22, address: "Avenida Sur, 27", checkouts: 5, required: 3, previousCoordinatorId: 3 },
  { id: 18, name: "Mercaval Centro", chainId: 3, localityId: 2, zoneId: 2, collaboratorId: 1, managerId: 23, address: "Calle Mayor, 21", checkouts: 4, required: 2, previousCoordinatorId: 2 },
  { id: 19, name: "Clarobox La Vega", chainId: 4, localityId: 1, zoneId: 1, collaboratorId: 1, managerId: 24, address: "Camino de La Vega, 13", checkouts: 3, required: 2, previousCoordinatorId: 2 },
  { id: 20, name: "Clarobox El Prado", chainId: 4, localityId: 3, zoneId: 3, collaboratorId: 2, managerId: 7, address: "Paseo del Prado, 16", checkouts: 3, required: 2, previousCoordinatorId: 3 },
  { id: 21, name: "Clarobox Poniente", chainId: 4, localityId: 4, zoneId: 5, collaboratorId: 1, managerId: 8, address: "Avenida Poniente, 36", checkouts: 4, required: 2, previousCoordinatorId: null },
  { id: 22, name: "Clarobox El Faro", chainId: 4, localityId: 5, zoneId: 4, collaboratorId: 2, managerId: 9, address: "Calle El Faro, 10", checkouts: 2, required: 2, previousCoordinatorId: 3 },
  { id: 23, name: "Clarobox Estación Norte", chainId: 4, localityId: 1, zoneId: 1, collaboratorId: 1, managerId: 10, address: "Calle Vía Nueva, 25", checkouts: 3, required: 2, previousCoordinatorId: 2 },
  { id: 24, name: "Clarobox Plaza Nueva", chainId: 4, localityId: 2, zoneId: 2, collaboratorId: 2, managerId: 11, address: "Plaza Nueva, 2", checkouts: 5, required: 3, previousCoordinatorId: 2 }
].map((store) => ({ ...store, schedule: DEFAULT_SCHEDULE, springParticipant: store.id <= 8 }));

const campaigns = [
  { id: 1, name: "Gran Recogida", typeId: 1, startDate: "2026-11-09", endDate: "2026-11-22", status: "current", readonly: false },
  { id: 2, name: "Recogida de Primavera", typeId: 2, startDate: "2026-04-13", endDate: "2026-04-19", status: "past", readonly: true }
];

const campaignTypes = [
  { id: 1, name: "Recogida extraordinaria" },
  { id: 2, name: "Recogida estacional" },
  { id: 3, name: "Campaña de proximidad" }
];

const slots = [
  { id: "morning", label: "Mañana", start: "10:00", end: "14:00" },
  { id: "afternoon", label: "Tarde", start: "17:00", end: "21:00" }
];

const volunteers = Array.from({ length: 12 }, (_, index) => ({ alias: `Voluntario V-${String(index + 1).padStart(2, "0")}` }));

const conflicts = [
  {
    id: 1,
    campaignId: 1,
    date: "2026-11-15",
    slotId: "morning",
    storeIds: [1, 2],
    collaboratorId: 1,
    volunteerAlias: "Voluntario V-07",
    assignedById: 7,
    type: "duplicate",
    reason: "La misma persona voluntaria aparece asignada a dos tiendas de la misma entidad colaboradora en la franja de 10:00 a 14:00.",
    detail: "Alimenta Central y Alimenta Estación comparten la asignación de Voluntario V-07. Debe liberarse una de las dos asignaciones."
  },
  {
    id: 2,
    campaignId: 1,
    date: "2026-11-15",
    slotId: "afternoon",
    storeIds: [9],
    collaboratorId: 1,
    volunteerAlias: "Voluntario V-03",
    assignedById: 14,
    type: "schedule",
    reason: "El turno de 17:00 a 21:00 quedó fuera del horario de apertura después de una modificación del horario.",
    detail: "Cesta La Ermita cierra ahora a las 19:30. El tramo de 19:30 a 21:00 está fuera del horario de apertura."
  }
];

const scheduleExceptions = [
  { id: 1, storeId: 9, campaignId: 1, date: "2026-11-15", opening: "10:00", closing: "19:30", closed: false, note: "Horario actualizado después de asignar el turno" }
];

const reports = [
  { id: 1, campaignId: 1, storeId: 7, type: "Incidencia de acceso", creationDate: "2026-11-14", description: "El acceso lateral está bloqueado por trabajos de mantenimiento y dificulta la entrada del material.", solution: null, reportedById: 13, solvedById: null },
  { id: 2, campaignId: 1, storeId: 14, type: "Cambio organizativo", creationDate: "2026-11-12", description: "La recepción de material se traslada durante la campaña a la puerta de carga del edificio contiguo.", solution: "La coordinación ha confirmado el nuevo punto de recepción y ha avisado a la persona que asigna turnos.", reportedById: 19, solvedById: 2 },
  { id: 3, campaignId: 2, storeId: 3, type: "Material", creationDate: "2026-04-15", description: "Faltaban carteles informativos en el punto de recogida durante la primera jornada.", solution: "Se entregó material adicional al grupo de la entidad colaboradora antes de la franja de tarde.", reportedById: 9, solvedById: 3 },
  { id: 4, campaignId: 2, storeId: 8, type: "Incidencia de acceso", creationDate: "2026-04-17", description: "El ascensor de acceso al almacén quedó temporalmente fuera de servicio.", solution: "Se habilitó un recorrido alternativo con el personal del centro comercial.", reportedById: 6, solvedById: 3 }
];

const notifications = [
  { id: 1, campaignId: 1, type: "calendar", title: "Conflicto en la planificación", text: "Hay 2 conflictos que requieren revisión el 15 de noviembre.", date: "2026-11-15", read: false },
  { id: 2, campaignId: 1, type: "report", title: "Incidencia pendiente de respuesta", text: "Cesta Ayuntamiento espera una respuesta sobre el acceso lateral.", targetId: 1, read: false },
  { id: 3, campaignId: 1, type: "assignment", title: "Cambio de asignación simulado", text: "Se ha propuesto liberar un turno en Alimenta Central.", targetId: 1, read: false }
];

const auditEvents = [
  { id: 1, timestamp: "2026-11-15T09:42:00", actorId: 1, action: "Actualización visual de una campaña", entity: "Campaña · Gran Recogida" },
  { id: 2, timestamp: "2026-11-14T18:10:00", actorId: 2, action: "Revisión de asignaciones", entity: "Zona · Norte" },
  { id: 3, timestamp: "2026-11-14T12:25:00", actorId: 5, action: "Consulta de contactos", entity: "Colaborador · Entidad Solidaria del Valle" },
  { id: 4, timestamp: "2026-11-13T16:05:00", actorId: 1, action: "Modificación simulada de un rol", entity: "Usuario · Cuenta 3" },
  { id: 5, timestamp: "2026-11-12T10:30:00", actorId: 3, action: "Consulta del calendario", entity: "Zona · Sur" }
];

window.MockData = {
  CONFIG,
  ROLE_CATALOG: ["ADMIN", "COORDINATOR", "COLLABORATOR-MANAGER", "STORE-MANAGER", "VOLUNTEER"],
  DEFAULT_SCHEDULE,
  chains,
  localities,
  zones,
  users,
  collaborators,
  stores,
  campaigns,
  campaignTypes,
  slots,
  volunteers,
  conflicts,
  scheduleExceptions,
  reports,
  notifications,
  auditEvents
};
