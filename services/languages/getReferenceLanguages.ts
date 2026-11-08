"use server";
import axios from "axios";

export interface ReferenceLocale {
  uuid: string;
  key: string;
  value: string;
}

export interface ReferenceLocalesResponse {
  list: ReferenceLocale[];
  last_update: string;
}

export const getReferenceLocales = async (
  token: string,
  baseLangCode: string = "en"
): Promise<ReferenceLocale[]> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get<ReferenceLocalesResponse>(
      `${process.env.API_URL}language/${baseLangCode}/locales`,
      { headers }
    );
    return response.data.list ?? [];
  } catch (error) {
    console.error(
      `Error fetching reference locales for ${baseLangCode}:`,
      error
    );
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) throw new Error("Token expired");
      if (error.response?.status === 404) {
        console.warn(
          `No reference locales found for ${baseLangCode}. An empty list will be used.`
        );
        return [];
      }
      throw new Error(
        error.message || `Failed to fetch reference locales for ${baseLangCode}`
      );
    }
    throw new Error(
      "An unknown error occurred while fetching reference locales."
    );
  }
};
