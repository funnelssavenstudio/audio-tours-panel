// Utilidades de formato para la seccion de chats (modulo cliente).

// Fecha y hora de un mensaje. Llega como ISO (timestamptz). Se muestra como
// DD/MM/YYYY HH:mm. Si no hay valor, devuelve "-".
export const formatDateTime = (value: string | null): string => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, "0");
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// Recorta un texto largo para la vista de lista.
export const truncate = (value: string | null, max = 60): string => {
  if (!value) return "";
  const trimmed = value.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max)}...` : trimmed;
};

export const roomStatusLabel = (status: string): string => {
  switch (status) {
    case "open":
      return "Abierta";
    case "closed":
      return "Cerrada";
    default:
      return status;
  }
};

export const roomStatusColor = (
  status: string
): "default" | "primary" | "success" | "warning" => {
  switch (status) {
    case "open":
      return "success";
    case "closed":
      return "default";
    default:
      return "default";
  }
};

// Etiqueta legible del rol del remitente de un mensaje.
export const senderRoleLabel = (role: string): string => {
  switch (role) {
    case "admin":
      return "Administrador";
    case "tour_guide":
      return "Guia";
    case "tourist":
      return "Turista";
    default:
      return role;
  }
};
