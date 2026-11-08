"use server";

import axios from "axios";

import { handleApiError } from "../utils/handleApiError";
import { payrollUrl } from "./baseUrl";
import { PeriodDetailResponse } from "./getPeriod";

// Recalcula la liquidacion de una quincena (idempotente en el backend).
export const calculatePeriod = async (
  token: string,
  uuid: string
): Promise<PeriodDetailResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.post(
      payrollUrl(`/api/payroll/periods/${uuid}/calculate`),
      {},
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
