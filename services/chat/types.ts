// Tipos del modulo de chat. Reflejan las formas que devuelve el backend nuevo
// (ver backend-nuevo/lib/chat.ts). Solo son tipos, por eso este modulo se puede
// importar tanto desde server actions como desde componentes cliente.

// Resumen de una sala de chat (una por evento) para el listado del panel.
export interface ChatRoomSummary {
  event_uuid: string;
  status: string;
  // Titulo del tour del evento (best-effort, puede venir null).
  tour_title: string | null;
  // Cantidad de mensajes en la sala.
  message_count: number;
  // Fecha y texto del ultimo mensaje (null si la sala no tiene mensajes).
  last_message_at: string | null;
  last_message_text: string | null;
}

// Un mensaje del hilo de chat de un evento.
export interface ChatMessage {
  uuid: string;
  sender_user_uuid: string;
  // tourist | tour_guide | admin
  sender_role: string;
  // Texto resuelto al idioma pedido (para el panel, el original).
  text: string;
  original_text: string;
  original_language_code: string;
  created_at: string;
}
