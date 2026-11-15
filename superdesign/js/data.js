window.CONFIG = {
  SHOW_SECTIONS_IN_NAV: true
};

window.ICONS = {
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-6h-4v6H4a1 1 0 0 1-1-1z"/><path d="M9 21v-6h6v6"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>',
  map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/></svg>',
  store: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10h18l-1.5-6h-15zM5 10v10h14V10M9 20v-6h6v6"/><path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/></svg>',
  users: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  alert: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>',
  chart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5M4 19h17"/><path d="m7 15 4-4 3 2 6-7"/><path d="M17 6h3v3"/></svg>',
  shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></svg>',
  bell: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>',
  chevronDown: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  chevronLeft: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
  chevronRight: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m18 6-12 12M6 6l12 12"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  help: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.6 9a2.5 2.5 0 1 1 4.7 1.2c-.8 1.2-2.3 1.4-2.3 3M12 17h.01"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m16 4 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"/></svg>',
  eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h4l2 5-3 2a15 15 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2Z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  building: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V4l8-2v19M12 9h8v12M8 7h.01M8 11h.01M8 15h.01M16 13h.01M16 17h.01M2 21h20"/></svg>',
  list: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  filter: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10m-7 6h4"/></svg>',
  logout: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3M21 4v16"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
  warning: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5M12 17h.01"/></svg>',
  dots: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9a7 7 0 0 1 11.8-2L20 12M4 12l2.6 5a7 7 0 0 0 11.8-2"/></svg>'
};

window.MOCK_DATA = {
  today: '2026-11-15',
  roles: ['ADMIN', 'COORDINATOR', 'COLLABORATOR-MANAGER', 'STORE-MANAGER', 'VOLUNTEER'],
  people: [
    { id: 'p-admin', name: 'Elena García', title: 'Administradora', email: 'elena.garcia@bancosol.test', phone: '600 100 101', roles: ['ADMIN'] },
    { id: 'p-coord-ana', name: 'Ana Martínez', title: 'Coordinadora de zonas', email: 'ana.martinez@bancosol.test', phone: '600 100 102', roles: ['COORDINATOR', 'STORE-MANAGER'], collaboratorId: 'c01' },
    { id: 'p-coord-diego', name: 'Diego Ruiz', title: 'Coordinador de zonas', email: 'diego.ruiz@bancosol.test', phone: '600 100 103', roles: ['COORDINATOR'] },
    { id: 'p-collab-01', name: 'Rosa Navarro', title: 'Responsable de entidad', email: 'rosa.navarro@bancosol.test', phone: '600 100 104', roles: ['COLLABORATOR-MANAGER'], collaboratorId: 'c01' },
    { id: 'p-collab-02', name: 'Luis Romero', title: 'Responsable de entidad', email: 'luis.romero@bancosol.test', phone: '600 100 105', roles: ['COLLABORATOR-MANAGER'], collaboratorId: 'c02' },
    { id: 'p-store-01', name: 'Marta Gil', title: 'Persona que asigna turnos', email: 'marta.gil@bancosol.test', phone: '600 100 106', roles: ['STORE-MANAGER'], collaboratorId: 'c01' },
    { id: 'p-store-02', name: 'Pablo Sanz', title: 'Persona que asigna turnos', email: 'pablo.sanz@bancosol.test', phone: '600 100 107', roles: ['STORE-MANAGER'], collaboratorId: 'c01' },
    { id: 'p-store-03', name: 'Nuria Torres', title: 'Persona que asigna turnos', email: 'nuria.torres@bancosol.test', phone: '600 100 108', roles: ['STORE-MANAGER'], collaboratorId: 'c01' },
    { id: 'p-store-04', name: 'Sergio León', title: 'Persona que asigna turnos', email: 'sergio.leon@bancosol.test', phone: '600 100 109', roles: ['STORE-MANAGER'], collaboratorId: 'c01' },
    { id: 'p-store-05', name: 'Irene Calvo', title: 'Persona que asigna turnos', email: 'irene.calvo@bancosol.test', phone: '600 100 110', roles: ['STORE-MANAGER'], collaboratorId: 'c02' },
    { id: 'p-store-06', name: 'Hugo Martín', title: 'Persona que asigna turnos', email: 'hugo.martin@bancosol.test', phone: '600 100 111', roles: ['STORE-MANAGER'], collaboratorId: 'c02' },
    { id: 'p-store-07', name: 'Clara Vega', title: 'Persona que asigna turnos', email: 'clara.vega@bancosol.test', phone: '600 100 112', roles: ['STORE-MANAGER'], collaboratorId: 'c02' },
    { id: 'p-store-08', name: 'Óscar Pardo', title: 'Persona que asigna turnos', email: 'oscar.pardo@bancosol.test', phone: '600 100 113', roles: ['STORE-MANAGER'], collaboratorId: 'c02' },
    { id: 'p-group-01', name: 'Inés Rubio', title: 'Líder de grupo', email: 'ines.rubio@bancosol.test', phone: '600 100 114', roles: ['COLLABORATOR-MANAGER'], collaboratorId: 'c01' },
    { id: 'p-group-02', name: 'Marcos Vidal', title: 'Líder de grupo', email: 'marcos.vidal@bancosol.test', phone: '600 100 115', roles: ['COLLABORATOR-MANAGER'], collaboratorId: 'c01' },
    { id: 'p-group-03', name: 'Eva Blanco', title: 'Líder de grupo', email: 'eva.blanco@bancosol.test', phone: '600 100 116', roles: ['COLLABORATOR-MANAGER'], collaboratorId: 'c02' },
    { id: 'p-group-04', name: 'Raúl Moya', title: 'Líder de grupo', email: 'raul.moya@bancosol.test', phone: '600 100 117', roles: ['COLLABORATOR-MANAGER'], collaboratorId: 'c02' }
  ],
  zones: [
    { id: 'z01', name: 'Centro', code: 'Z-CEN', coordinatorIds: ['p-coord-ana'] },
    { id: 'z02', name: 'Norte', code: 'Z-NOR', coordinatorIds: ['p-coord-ana'] },
    { id: 'z03', name: 'Este', code: 'Z-EST', coordinatorIds: ['p-coord-diego'] },
    { id: 'z04', name: 'Sur', code: 'Z-SUR', coordinatorIds: ['p-coord-diego'] }
  ],
  localities: [
    { id: 'l01', name: 'Zaragoza', postalCode: '50001' },
    { id: 'l02', name: 'Utebo', postalCode: '50180' },
    { id: 'l03', name: 'La Puebla', postalCode: '50190' },
    { id: 'l04', name: 'Cuarte', postalCode: '50410' },
    { id: 'l05', name: 'Villanueva', postalCode: '50830' }
  ],
  chains: [
    { id: 'ch01', name: 'Bancosol Market', code: 'BSM' },
    { id: 'ch02', name: 'Cesta Viva', code: 'CSV' },
    { id: 'ch03', name: 'Compra Fácil', code: 'CPF' },
    { id: 'ch04', name: 'Norte & Sur', code: 'NYS' }
  ],
  collaborators: [
    {
      id: 'c01', name: 'Asociación Vecinal La Vega', address: 'Calle del Parque, 18', localityId: 'l01', contactIds: ['p-collab-01', 'p-group-01'], managerId: 'p-collab-01', campaignIds: ['grand', 'spring'], groups: [
        { id: 'g01', name: 'Grupo Ribera', leaderId: 'p-group-01', volunteerCount: 3 },
        { id: 'g02', name: 'Grupo Puente', leaderId: 'p-group-02', volunteerCount: 2 }
      ]
    },
    {
      id: 'c02', name: 'Fundación Puente Abierto', address: 'Avenida de la Paz, 42', localityId: 'l03', contactIds: ['p-collab-02', 'p-group-03'], managerId: 'p-collab-02', campaignIds: ['grand', 'spring'], groups: [
        { id: 'g03', name: 'Grupo Horizonte', leaderId: 'p-group-03', volunteerCount: 3 },
        { id: 'g04', name: 'Grupo Brújula', leaderId: 'p-group-04', volunteerCount: 2 }
      ]
    }
  ],
  stores: [
    { id: 's01', name: 'Bancosol Centro', chainId: 'ch01', zoneId: 'z01', localityId: 'l01', address: 'Plaza Aragón, 4', checkoutShelves: 3, collaboratorId: 'c01', managerId: 'p-store-01', opening: '09:00', closing: '21:00', updatedClosing: '21:00', morning: { assigned: 3, required: 3 }, afternoon: { assigned: 2, required: 2 }, pastStatus: 'complete' },
    { id: 's02', name: 'Bancosol Universidad', chainId: 'ch01', zoneId: 'z01', localityId: 'l01', address: 'Calle Pedro Cerbuna, 12', checkoutShelves: 3, collaboratorId: 'c01', managerId: 'p-store-01', opening: '09:00', closing: '21:00', updatedClosing: '21:00', morning: { assigned: 3, required: 3 }, afternoon: { assigned: 2, required: 2 }, pastStatus: 'complete' },
    { id: 's03', name: 'Bancosol Norte', chainId: 'ch01', zoneId: 'z02', localityId: 'l01', address: 'Avenida San Juan, 30', checkoutShelves: 3, collaboratorId: 'c01', managerId: 'p-coord-ana', opening: '09:00', closing: '21:00', updatedClosing: '21:00', morning: { assigned: 3, required: 3 }, afternoon: { assigned: 2, required: 2 }, pastStatus: 'complete' },
    { id: 's04', name: 'Bancosol Utebo', chainId: 'ch01', zoneId: 'z02', localityId: 'l02', address: 'Paseo Berbegal, 7', checkoutShelves: 3, collaboratorId: 'c01', managerId: 'p-store-02', opening: '09:00', closing: '21:00', updatedClosing: '21:00', morning: { assigned: 2, required: 3 }, afternoon: { assigned: 2, required: 2 }, pastStatus: 'pending' },
    { id: 's05', name: 'Cesta Viva Delicias', chainId: 'ch02', zoneId: 'z03', localityId: 'l01', address: 'Calle Rioja, 8', checkoutShelves: 3, collaboratorId: 'c01', managerId: 'p-store-02', opening: '09:00', closing: '21:00', updatedClosing: '21:00', morning: { assigned: 3, required: 3 }, afternoon: { assigned: 2, required: 2 }, pastStatus: 'complete' },
    { id: 's06', name: 'Cesta Viva Las Fuentes', chainId: 'ch02', zoneId: 'z03', localityId: 'l01', address: 'Compromiso de Caspe, 61', checkoutShelves: 2, collaboratorId: 'c01', managerId: 'p-store-03', opening: '09:00', closing: '21:00', updatedClosing: '21:00', morning: { assigned: 2, required: 2 }, afternoon: { assigned: 1, required: 2 }, pastStatus: 'complete' },
    { id: 's07', name: 'Cesta Viva Cuarte', chainId: 'ch02', zoneId: 'z04', localityId: 'l04', address: 'Camino del Plano, 15', checkoutShelves: 2, collaboratorId: 'c01', managerId: 'p-store-03', opening: '09:00', closing: '21:00', updatedClosing: '21:00', morning: { assigned: 2, required: 2 }, afternoon: { assigned: 2, required: 2 }, pastStatus: 'complete' },
    { id: 's08', name: 'Cesta Viva Sur', chainId: 'ch02', zoneId: 'z04', localityId: 'l04', address: 'Avenida de Valencia, 92', checkoutShelves: 2, collaboratorId: 'c01', managerId: 'p-store-04', opening: '09:00', closing: '21:00', updatedClosing: '19:30', morning: { assigned: 2, required: 2 }, afternoon: { assigned: 2, required: 2 }, pastStatus: 'complete' },
    { id: 's09', name: 'Compra Fácil Centro', chainId: 'ch03', zoneId: 'z01', localityId: 'l01', address: 'Paseo Independencia, 35', checkoutShelves: 3, collaboratorId: 'c01', managerId: 'p-store-01', opening: '09:00', closing: '21:00', updatedClosing: '21:00', morning: { assigned: 3, required: 3 }, afternoon: { assigned: 2, required: 2 }, pastStatus: 'complete' },
    { id: 's10', name: 'Compra Fácil Norte', chainId: 'ch03', zoneId: 'z02', localityId: 'l02', address: 'Calle Navarra, 16', checkoutShelves: 2, collaboratorId: 'c01', managerId: null, opening: '09:00', closing: '21:00', updatedClosing: '21:00', morning: { assigned: 1, required: 2 }, afternoon: { assigned: 2, required: 2 }, pastStatus: 'pending' },
    { id: 's11', name: 'Norte & Sur Actur', chainId: 'ch03', zoneId: 'z03', localityId: 'l01', address: 'Calle María Zambrano, 5', checkoutShelves: 3, collaboratorId: 'c02', managerId: 'p-store-05', opening: '09:00', closing: '21:00', updatedClosing: '21:00', morning: { assigned: 3, required: 3 }, afternoon: { assigned: 2, required: 2 }, pastStatus: 'complete' },
    { id: 's12', name: 'Norte & Sur La Jota', chainId: 'ch03', zoneId: 'z03', localityId: 'l01', address: 'Avenida La Jota, 20', checkoutShelves: 2, collaboratorId: 'c02', managerId: 'p-store-05', opening: '09:00', closing: '21:00', updatedClosing: '21:00', morning: { assigned: 2, required: 2 }, afternoon: { assigned: 1, required: 2 }, pastStatus: 'complete' },
    { id: 's13', name: 'Bancosol La Puebla', chainId: 'ch04', zoneId: 'z01', localityId: 'l03', address: 'Calle Mayor, 11', checkoutShelves: 2, collaboratorId: 'c02', managerId: 'p-store-06', opening: '09:00', closing: '21:00', updatedClosing: '21:00', morning: { assigned: 1, required: 2 }, afternoon: { assigned: 2, required: 2 }, pastStatus: 'complete' },
    { id: 's14', name: 'Bancosol Villanueva', chainId: 'ch04', zoneId: 'z02', localityId: 'l05', address: 'Avenida Zaragoza, 3', checkoutShelves: 2, collaboratorId: 'c02', managerId: 'p-store-06', opening: '09:00', closing: '21:00', updatedClosing: '21:00', morning: { assigned: 2, required: 2 }, afternoon: { assigned: 2, required: 2 }, pastStatus: 'complete' },
    { id: 's15', name: 'Cesta Viva Parque', chainId: 'ch04', zoneId: 'z03', localityId: 'l01', address: 'Paseo Echegaray, 90', checkoutShelves: 3, collaboratorId: 'c02', managerId: 'p-store-07', opening: '09:00', closing: '21:00', updatedClosing: '21:00', morning: { assigned: 3, required: 3 }, afternoon: { assigned: 2, required: 2 }, pastStatus: 'complete' },
    { id: 's16', name: 'Cesta Viva Camino Real', chainId: 'ch04', zoneId: 'z04', localityId: 'l04', address: 'Camino Real, 24', checkoutShelves: 2, collaboratorId: 'c02', managerId: 'p-store-07', opening: '09:00', closing: '21:00', updatedClosing: '21:00', morning: { assigned: 2, required: 2 }, afternoon: { assigned: 2, required: 2 }, pastStatus: 'complete' },
    { id: 's17', name: 'Compra Fácil Alameda', chainId: 'ch01', zoneId: 'z01', localityId: 'l01', address: 'Paseo de la Alameda, 17', checkoutShelves: 3, collaboratorId: 'c02', managerId: 'p-store-08', opening: '09:00', closing: '21:00', updatedClosing: '21:00', morning: { assigned: 3, required: 3 }, afternoon: { assigned: 1, required: 2 }, pastStatus: 'complete' },
    { id: 's18', name: 'Compra Fácil Norte II', chainId: 'ch01', zoneId: 'z02', localityId: 'l02', address: 'Avenida Logroño, 41', checkoutShelves: 2, collaboratorId: 'c02', managerId: 'p-store-08', opening: '09:00', closing: '21:00', updatedClosing: '21:00', morning: { assigned: 2, required: 2 }, afternoon: { assigned: 2, required: 2 }, pastStatus: 'complete' },
    { id: 's19', name: 'Norte & Sur Río', chainId: 'ch02', zoneId: 'z03', localityId: 'l01', address: 'Calle del Río, 28', checkoutShelves: 2, collaboratorId: 'c02', managerId: 'p-store-08', opening: '09:00', closing: '21:00', updatedClosing: '21:00', morning: { assigned: 2, required: 2 }, afternoon: { assigned: 2, required: 2 }, pastStatus: 'complete' },
    { id: 's20', name: 'Norte & Sur Sur', chainId: 'ch02', zoneId: 'z04', localityId: 'l04', address: 'Calle Pilar, 6', checkoutShelves: 2, collaboratorId: 'c02', managerId: 'p-store-08', opening: '09:00', closing: '21:00', updatedClosing: '21:00', morning: { assigned: 2, required: 2 }, afternoon: { assigned: 2, required: 2 }, pastStatus: 'complete' }
  ],
  campaigns: [
    { id: 'grand', name: 'Gran Recogida', campaignTypeId: 'type-gr', startDate: '2026-11-09', endDate: '2026-11-22', status: 'En curso', storeIds: ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09', 's10', 's11', 's12', 's13', 's14', 's15', 's16', 's17', 's18', 's19', 's20'], slotTemplate: [{ id: 'morning', label: 'Mañana', start: '10:00', end: '14:00' }, { id: 'afternoon', label: 'Tarde', start: '17:00', end: '21:00' }] },
    { id: 'spring', name: 'Recogida de Primavera', campaignTypeId: 'type-pr', startDate: '2026-04-13', endDate: '2026-04-19', status: 'Finalizada', storeIds: ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08'], slotTemplate: [{ id: 'morning', label: 'Mañana', start: '09:00', end: '12:00' }, { id: 'afternoon', label: 'Tarde', start: '16:00', end: '19:00' }] }
  ],
  campaignTypes: [
    { id: 'type-gr', name: 'Gran recogida' },
    { id: 'type-pr', name: 'Recogida estacional' },
    { id: 'type-cm', name: 'Campaña de sensibilización' }
  ],
  incidents: [
    { id: 'inc01', campaignId: 'grand', type: 'Horario de tienda', title: 'Cambio de cierre en Cesta Viva Sur', description: 'El horario efectivo del establecimiento se ha actualizado hasta las 19:30. Hay una asignación que termina después del cierre.', date: '2026-11-15', storeId: 's08', reportedBy: 'p-store-04', status: 'pending', response: null },
    { id: 'inc02', campaignId: 'grand', type: 'Asignación', title: 'Revisar cobertura de la franja de mañana', description: 'La misma asignación aparece en dos tiendas de la entidad colaboradora durante la misma franja.', date: '2026-11-15', storeId: 's02', reportedBy: 'p-coord-ana', status: 'answered', response: { text: 'Se ha identificado el cruce de asignaciones. La coordinación revisará la cobertura con la entidad colaboradora.', by: 'p-admin', date: '2026-11-15' } },
    { id: 'inc03', campaignId: 'spring', type: 'Cobertura', title: 'Cobertura pendiente en Bancosol Utebo', description: 'Consulta histórica de una franja pendiente en la campaña de primavera.', date: '2026-04-16', storeId: 's04', reportedBy: 'p-store-02', status: 'answered', response: { text: 'La incidencia quedó resuelta durante la campaña.', by: 'p-coord-diego', date: '2026-04-17' } }
  ],
  shiftAssignments: [
    { id: 'assignment-01', campaignId: 'grand', date: '2026-11-15', slotId: 'morning', storeId: 's02', collaboratorId: 'c01', assignedById: 'p-store-01', personAlias: 'Voluntario V-07', startTime: '10:00', endTime: '14:00' },
    { id: 'assignment-02', campaignId: 'grand', date: '2026-11-15', slotId: 'morning', storeId: 's03', collaboratorId: 'c01', assignedById: 'p-coord-ana', personAlias: 'Voluntario V-07', startTime: '10:00', endTime: '14:00' },
    { id: 'assignment-03', campaignId: 'grand', date: '2026-11-15', slotId: 'afternoon', storeId: 's08', collaboratorId: 'c01', assignedById: 'p-store-04', personAlias: 'Voluntario V-12', startTime: '17:00', endTime: '21:00' }
  ],
  notifications: [
    { id: 'note01', type: 'shift', title: 'Franja con incidencias', description: 'Hay dos conflictos que revisar en la franja de hoy.', date: '2026-11-15', slotId: 'morning', campaignId: 'grand' },
    { id: 'note02', type: 'incident', title: 'Incidencia pendiente', description: 'Cambio de horario en Cesta Viva Sur.', incidentId: 'inc01', campaignId: 'grand' },
    { id: 'note03', type: 'store', title: 'Desasignación de turno', description: 'Bancosol Universidad · franja de mañana. Revisa la tienda.', storeId: 's02', campaignId: 'grand' }
  ],
  audit: [
    { id: 'a01', date: '2026-11-15 09:14', actorId: 'p-admin', action: 'Actualización de horario', entity: 'Tienda', detail: 'Cesta Viva Sur · cierre actualizado a las 19:30' },
    { id: 'a02', date: '2026-11-14 17:36', actorId: 'p-coord-ana', action: 'Revisión de franja', entity: 'Turno', detail: 'Gran Recogida · zona Centro' },
    { id: 'a03', date: '2026-11-12 11:02', actorId: 'p-collab-01', action: 'Actualización de contacto', entity: 'Colaborador', detail: 'Asociación Vecinal La Vega' },
    { id: 'a04', date: '2026-04-19 20:15', actorId: 'p-admin', action: 'Cierre de campaña', entity: 'Campaña', detail: 'Recogida de Primavera' }
  ],
  coordinatorZones: { 'p-coord-ana': ['z01', 'z02'], 'p-coord-diego': ['z03', 'z04'] },
  previousCoordinators: { s01: 'p-coord-ana', s02: 'p-coord-ana', s03: 'p-coord-ana', s04: 'p-coord-ana', s05: 'p-coord-diego', s06: 'p-coord-diego', s07: 'p-coord-diego', s08: 'p-coord-diego' }
};
