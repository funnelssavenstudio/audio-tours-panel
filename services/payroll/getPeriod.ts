"use server";

import axios from "axios";

import { handleApiError } from "../utils/handleApiError";
import { payrollUrl } from "./baseUrl";
import { PayrollItem, PayrollPeriod } from "./types";

export interface PeriodDetailResponse {
  period: PayrollPeriod;
  items: PayrollItem[];
}

// Trae el detalle de una quincena con sus items (un item por guia).
export const getPeriod = async (
  token: string,
  uuid: string
): Promise<PeriodDetailResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get(
      payrollUrl(`/api/payroll/periods/${uuid}`),
      { headers }
    );
    return {
      period: response.data.period,
      items: response.data.items,
    };
  } catch (error) {
    handleApiError(error);
  }
};
