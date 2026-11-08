// Utilidades de formato para la seccion de liquidaciones (modulo cliente).

// Los montos del backend vienen en la unidad minima de la moneda (centavos).
export const formatMoney = (amountInCents: number, currency: string): string => {
  const code = (currency || "usd").toUpperCase();
  const value = (amountInCents ?? 0) / 100;
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: code,
    }).format(value);
  } catch {
    // Si la moneda no es un codigo ISO valido, mostramos el numero + codigo.
    return `${value.toFixed(2)} ${code}`;
  }
};

// Fechas que llegan como YYYY-MM-DD (o ISO). Se muestran como DD/MM/YYYY sin
// aplicar zona horaria (evita el corrimiento de un dia).
export const formatDate = (value: string | null): string => {
  if (!value) return "-";
  const datePart = value.slice(0, 10);
  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
};

export const periodStatusLabel = (status: string): string => {
  switch (status) {
    case "open":
      return "Abierto";
    case "calculated":
      return "Calculado";
    case "paid":
      return "Pagado";
    default:
      return status;
  }
};

export const periodStatusColor = (
  status: string
): "default" | "primary" | "success" | "warning" => {
  switch (status) {
    case "open":
      return "warning";
    case "calculated":
      return "primary";
    case "paid":
      return "success";
    default:
      return "default";
  }
};

export const itemStatusLabel = (status: string): string => {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "paid":
      return "Pagado";
    default:
      return status;
  }
};
