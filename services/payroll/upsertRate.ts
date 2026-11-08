"use server";

import axios from "axios";

import { handleApiError } from "../utils/handleApiError";
import { payrollUrl } from "./baseUrl";
import { GuideRate } from "./types";

export interface UpsertRateInput {
  userUuid: string;
  // Monto por tour en la unidad minima de la moneda (centavos).
  amountPerTour: number;
  currency?: string;
  // Fecha de vigencia en formato YYYY-MM-DD. Si no se envia, el backend usa hoy.
  validFrom?: string;
}

// Crea o actualiza la tarifa de un guia para una fecha de vigencia.
export const upsertRate = async (
  token: string,
  input: UpsertRateInput
): Promise<GuideRate> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.post(
      payrollUrl("/api/payroll/rates"),
      {
        user_uuid: input.userUuid,
        amount_per_tour: input.amountPerTour,
        currency: input.currency,
        valid_from: input.validFrom,
      },
      { headers }
    );
    const rate: GuideRate = response.data.rate;
    return rate;
  } catch (error) {
    handleApiError(error);
  }
};
