"use server";

import axios from "axios";

import { handleApiError } from "../utils/handleApiError";
import { payrollUrl } from "./baseUrl";
import { PayrollPeriod } from "./types";

// Lista las quincenas (periodos de liquidacion), mas recientes primero.
export const getPeriods = async (token: string): Promise<PayrollPeriod[]> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get(payrollUrl("/api/payroll/periods"), {
      headers,
    });
    const periods: PayrollPeriod[] = response.data.list;
    return periods;
  } catch (error) {
    handleApiError(error);
  }
};
