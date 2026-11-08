// Tipos del modulo de liquidaciones (payroll). Reflejan las formas que devuelve
// el backend nuevo (ver backend-nuevo/lib/payroll.ts). Solo son tipos, por eso
// este modulo se puede importar tanto desde server actions como desde componentes
// cliente sin problemas.

export type PayrollPeriodStatus = "open" | "calculated" | "paid";
export type PayrollItemStatus = "pending" | "paid";

export interface GuideRate {
  uuid: string;
  user_uuid: string;
  // Monto por tour en la unidad minima de la moneda (centavos).
  amount_per_tour: number;
  currency: string;
  valid_from: string;
}

export interface PayrollPeriod {
  uuid: string;
  start_date: string;
  end_date: string;
  status: PayrollPeriodStatus | string;
}

export interface PayrollItem {
  uuid: string;
  period_uuid: string;
  user_uuid: string;
  tours_count: number;
  // Monto total del item en la unidad minima de la moneda (centavos).
  amount: number;
  currency: string;
  status: PayrollItemStatus | string;
  paid_at: string | null;
  detail: string[];
}
