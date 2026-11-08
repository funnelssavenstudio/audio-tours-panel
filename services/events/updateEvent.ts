"use server";

import axios from "axios";

export type EventStatus = "open" | "closed";
export type EventProgress = "pending" | "open" | "in_progress" | "finished";

export interface UpdateEventPayload {
  status: EventStatus;
  progress: EventProgress;
}

export interface UpdateEventResponse {
  message?: string;
  [key: string]: unknown;
}

export const updateEvent = async (
  token: string,
  eventUuid: string,
  payload: UpdateEventPayload
): Promise<UpdateEventResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.post<UpdateEventResponse>(
      `${process.env.API_URL}event/${eventUuid}/updates`,
      payload,
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
          throw new Error("Token expired");
        case 400:
        case 403:
        case 404:
        case 409:
        case 422:
          throw new Error(
            backendMessage || "No se pudo actualizar el estado del evento"
          );
        case 500:
        case 502:
        case 503:
        case 504:
        case 530:
          throw new Error("Internal server error");
        default:
          throw new Error(
            backendMessage || "No se pudo actualizar el estado del evento"
          );
      }
    }

    throw error;
  }
};

