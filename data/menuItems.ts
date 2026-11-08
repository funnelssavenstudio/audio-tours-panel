export const generalItemsMenu = [
  {
    title: "Inicio",
    icon: "solar:home-angle-2-outline",
    href: "/backoffice",
  },
  {
    title: "Usuarios",
    icon: "ph:user",
    href: "/backoffice/users",
  },
];

export const toursItemsMenu = [
  {
    title: "Tours",
    icon: "fluent:vehicle-bus-16-regular",
    href: "/backoffice/tours",
  },
  {
    title: "Paradas",
    icon: "bi:sign-stop-lights",
    href: "/backoffice/stops",
  },
  {
    title: "Puntos de interés",
    icon: "solar:map-point-linear",
    href: "/backoffice/poi",
  },
];

export const adminItemsMenu = [
  {
    title: "Eventos",
    icon: "fluent:task-list-square-16-regular",
    href: "/backoffice/events",
  },
  {
    title: "Idiomas",
    icon: "solar:globus-outline",
    href: "/backoffice/languages",
  },
  {
    title: "Liquidaciones",
    icon: "solar:wallet-money-outline",
    href: "/backoffice/payroll",
  },
  {
    title: "Tours de pago",
    icon: "solar:ticket-outline",
    href: "/backoffice/paid-tours",
  },
  {
    title: "Chats",
    icon: "solar:chat-round-line-outline",
    href: "/backoffice/chats",
  },
];

export const internalRoutes = [
  {
    title: "Crear nuevo tour",
    href: "/backoffice/tours/create-tour",
  },
  {
    title: "Crear nueva parada",
    href: "/backoffice/stops/create-stop",
  },
  {
    title: "Crear nuevo punto de interés",
    href: "/backoffice/poi/create-poi",
  },
  {
    title: "Crear nuevo usuario",
    href: "/backoffice/users/create-user",
  },
  {
    title: "Editar tour",
    href: "/backoffice/tours/edit-tour",
  },
  {
    title: "Editar parada",
    href: "/backoffice/stops/edit-stop",
  },
  {
    title: "Editar punto de interés",
    href: "/backoffice/poi/edit-poi",
  },
  {
    title: "Editar usuario",
    href: "/backoffice/users/edit-user",
  },
  {
    title: "Editar idioma",
    href: "/backoffice/languages/edit-language",
  },
  {
    title: "Tarifas de guias",
    href: "/backoffice/payroll/rates",
  },
  {
    title: "Detalle de la quincena",
    href: "/backoffice/payroll",
  },
  {
    title: "Tours de pago",
    href: "/backoffice/paid-tours",
  },
  {
    title: "Conversacion de chat",
    href: "/backoffice/chats",
  },
];

export const backofficeSections = [
  { basePath: "/backoffice/users", listLabel: "Usuarios" },
  { basePath: "/backoffice/tours", listLabel: "Tours" },
  { basePath: "/backoffice/stops", listLabel: "Paradas" },
  { basePath: "/backoffice/poi", listLabel: "Puntos de interés" },
  { basePath: "/backoffice/events", listLabel: "Eventos" },
  { basePath: "/backoffice/languages", listLabel: "Idiomas" },
  { basePath: "/backoffice/payroll", listLabel: "Liquidaciones" },
  { basePath: "/backoffice/paid-tours", listLabel: "Tours de pago" },
  { basePath: "/backoffice/chats", listLabel: "Chats" },
];
