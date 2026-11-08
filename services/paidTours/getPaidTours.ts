"use server";

import axios from "axios";

import { handleApiError } from "../utils/handleApiError";
import { paidToursUrl } from "./baseUrl";
import { PaidTour } from "./types";

// Lista todos los tours de pago (activos e inactivos), ordenados por titulo.
export const getPaidTours = async (token: string): Promise<PaidTour[]> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get(
      paidToursUrl("/api/payments/admin/paid-tours"),
      { headers }
    );
    const list: PaidTour[] = response.data.list;
    return list;
  } catch (error) {
    handleApiError(error);
  }
};
