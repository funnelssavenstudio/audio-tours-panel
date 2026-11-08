"use server";

import axios from "axios";

export interface Tourist {
  uuid: string;
  email: string;
  name: string;
  last_name: string | null;
  checked: boolean;
}

export interface TouristsResponse {
  list: Tourist[];
  status: string;
}

export const getTouristsByEvent = async (
  token: string,
  eventId: string
): Promise<Tourist[]> => {
  if (!eventId) {
    throw new Error("Event ID is required");
  }
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get<TouristsResponse>(
      `${process.env.API_URL}event/${eventId}/list`, // Endpoint correcto
      {
        headers,
      }
    );
    return response.data.list;
  } catch (error) {
    console.error("Error fetching tourists:", error);

    if (axios.isAxiosError(error)) {
      switch (error.response?.status) {
        case 401:
          throw new Error("Token expired");
        case 404:
          // Podría ser que el evento no exista o no tenga tickets
          console.warn(
            `No tourists found for event ${eventId} or event not found.`
          );
          return []; // Devuelve lista vacía en lugar de error
        case 400:
        case 403:
        case 500:
        case 502:
        case 503:
        case 504:
        case 530:
          throw new Error("Internal server error fetching tourists");
        default:
          throw new Error(error.message || "Failed to fetch tourists");
      }
    } else if (error instanceof Error) {
      throw new Error(error.message || "An unknown error occurred");
    } else {
      throw new Error("An unknown error occurred");
    }
  }
};
