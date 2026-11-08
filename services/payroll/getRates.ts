"use server";

import axios from "axios";

import { handleApiError } from "../utils/handleApiError";
import { payrollUrl } from "./baseUrl";
import { GuideRate } from "./types";

// Lista las tarifas de los guias (monto por tour, moneda, vigente desde).
export const getRates = async (token: string): Promise<GuideRate[]> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get(payrollUrl("/api/payroll/rates"), {
      headers,
    });
    const rates: GuideRate[] = response.data.list;
    return rates;
  } catch (error) {
    handleApiError(error);
  }
};
