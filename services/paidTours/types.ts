// Tipos del modulo de tours de pago. Reflejan la forma que devuelve el backend
// nuevo (ver backend-nuevo/lib/payments.ts). Solo son tipos, por eso este modulo
// se puede importar tanto desde server actions como desde componentes cliente.

export interface PaidTour {
  uuid: string;
  tour_uuid: string;
  title: string;
  description: string | null;
  // Precio en la unidad minima de la moneda (centavos).
  price_cents: number;
  currency: string;
  active: boolean;
  // Punto de inicio del tour (de public.tours del Rust). Puede ser null.
  pickup_lat: number | null;
  pickup_lng: number | null;
}
