"use server";
import axios from "axios";

export interface UpdateLocaleParams {
  token: string;
  localeUuid: string;
  value: string;
}

export const updateLocale = async ({
  token,
  localeUuid,
  value,
}: UpdateLocaleParams): Promise<void> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    await axios.put(
      `${process.env.API_URL}language/locale/${localeUuid}`,
      { value },
      { headers }
    );
  } catch (error) {
    console.error(`Error updating locale ${localeUuid}:`, error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) throw new Error("Token expired");
      if (error.response?.status === 404) throw new Error("Locale not found");
      throw new Error(error.message || `Failed to update locale ${localeUuid}`);
    }
    throw new Error("An unknown error occurred while updating the locale.");
  }
};
