"use server";

import axios from "axios";

export interface CheckInTicketResponse {
  message?: string;
  [key: string]: unknown;
}

export const checkInTicket = async (
  token: string,
  code: string
): Promise<CheckInTicketResponse> => {
  if (!code) {
    throw new Error("Código de ticket inválido");
  }

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.put<CheckInTicketResponse>(
      `${process.env.API_URL}ticket/${encodeURIComponent(code)}/checkin`,
      undefined,
      { headers }
    );

    return response.data ?? {};
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendMessage =
        (typeof error.response?.data === "string" && error.response.data) ||
        error.response?.data?.message ||
        error.message;

      switch (error.response?.status) {
        case 401:
          if (
            typeof backendMessage === "string" &&
            backendMessage.toLowerCase().includes("expired")
          ) {
            throw new Error("Token expired");
          }
          throw new Error(
            backendMessage || "No autorizado para registrar el check-in"
          );
        case 404:
          throw new Error(backendMessage || "Código de ticket inválido");
        case 409:
          throw new Error(backendMessage || "El ticket ya fue registrado");
        case 400:
        case 403:
        case 422:
          throw new Error(backendMessage || "No se pudo registrar el ticket");
        case 500:
        case 502:
        case 503:
        case 504:
        case 530:
          throw new Error("Internal server error");
        default:
          throw new Error(backendMessage || "No se pudo registrar el ticket");
      }
    }

    throw error;
  }
};
