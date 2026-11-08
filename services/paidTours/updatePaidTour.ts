"use server";

import axios from "axios";

import { handleApiError } from "../utils/handleApiError";
import { paidToursUrl } from "./baseUrl";
import { PaidTour } from "./types";

export interface UpdatePaidTourInput {
  title?: string;
  description?: string;
  // Precio en la unidad minima de la moneda (centavos).
  priceCents?: number;
  currency?: string;
  active?: boolean;
}

// Actualiza un tour de pago por su tour_uuid. Solo se envian los campos a
// cambiar. Los montos van en centavos.
export const updatePaidTour = async (
  token: string,
  tourUuid: string,
  input: UpdatePaidTourInput
): Promise<PaidTour> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.put(
      paidToursUrl(`/api/payments/admin/paid-tours/${tourUuid}`),
      {
        title: input.title,
        description: input.description,
        price_cents: input.priceCents,
        currency: input.currency,
        active: input.active,
      },
      { headers }
    );
    const paidTour: PaidTour = response.data.paid_tour;
    return paidTour;
  } catch (error) {
    handleApiError(error);
  }
};
