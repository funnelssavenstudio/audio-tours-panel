"use server";

import axios from "axios";

import { handleApiError } from "../utils/handleApiError";
import { payrollUrl } from "./baseUrl";
import { PayrollPeriod } from "./types";

// Crea una quincena (periodo de liquidacion). Fechas en formato YYYY-MM-DD.
export const createPeriod = async (
  token: string,
  startDate: string,
  endDate: string
): Promise<PayrollPeriod> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.post(
      payrollUrl("/api/payroll/periods"),
      {
        start_date: startDate,
        end_date: endDate,
      },
      { headers }
    );
    const period: PayrollPeriod = response.data.period;
    return period;
  } catch (error) {
    handleApiError(error);
  }
};
