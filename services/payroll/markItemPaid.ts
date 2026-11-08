"use server";

import axios from "axios";

import { handleApiError } from "../utils/handleApiError";
import { payrollUrl } from "./baseUrl";
import { PayrollItem } from "./types";

// Marca un item de liquidacion como pagado. El pago real (transferencia) es
// externo; aca solo se registra.
export const markItemPaid = async (
  token: string,
  uuid: string
): Promise<PayrollItem> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.put(
      payrollUrl(`/api/payroll/items/${uuid}`),
      {},
      { headers }
    );
    const item: PayrollItem = response.data.item;
    return item;
  } catch (error) {
    handleApiError(error);
  }
};
