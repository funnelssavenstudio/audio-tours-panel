"use server";

import axios from "axios";

export interface UpdateLanguagePayload {
  active?: boolean;
  code?: string;
  name?: string;
}

type UpdateLanguageResponse = {
  language_uuid?: string;
  uuid?: string;
};

export const updateLanguage = async (
  token: string,
  uuid: string,
  payload: UpdateLanguagePayload
): Promise<UpdateLanguageResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.put(
      `${process.env.API_URL}language/${uuid}`,
      payload,
      { headers }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      switch (error.response?.status) {
        case 401:
          throw new Error("Token expired");
        case 400:
        case 403:
        case 404:
        case 409:
        case 500:
        case 502:
        case 503:
        case 504:
        case 530:
          throw new Error(
            error.response?.data?.message || "Internal server error"
          );
        default:
          throw new Error(error.message || "Internal server error");
      }
    }

    throw error;
  }
};

