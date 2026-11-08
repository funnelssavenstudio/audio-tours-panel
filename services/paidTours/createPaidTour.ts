"use server";

import axios from "axios";

import { handleApiError } from "../utils/handleApiError";
import { paidToursUrl } from "./baseUrl";
import { PaidTour } from "./types";

export interface CreatePaidTourInput {
  tourUuid: string;
  title: string;
  // Precio en la unidad minima de la moneda (centavos).
  priceCents: number;
  description?: string;
  currency?: string;
  active?: boolean;
}

// Crea un tour de pago en el backend nuevo. Los montos van en centavos.
export const createPaidTour = async (
  token: string,
  input: CreatePaidTourInput
): Promise<PaidTour> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.post(
      paidToursUrl("/api/payments/admin/paid-tours"),
      {
        tour_uuid: input.tourUuid,
        title: input.title,
        price_cents: input.priceCents,
        description: input.description,
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
