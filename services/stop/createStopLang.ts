"use server";

import axios from "axios";
import { handleApiError } from "../utils/handleApiError";

type StopLangResponse = {
  stop_uuid: string;
};

interface LanguageObject {
  language_code: string;
  title: string;
  description: string;
}

export const createStopLang = async (
  token: string,
  stop_uuid: string,
  { language_code, title, description }: LanguageObject
): Promise<StopLangResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.post(
      `${process.env.API_URL}stop/${stop_uuid}/translation`,
      {
        language_code,
        title,
        description,
      },
      { headers }
    );
    const stopLangResponse: StopLangResponse = response.data;
    return stopLangResponse;
  } catch (error) {
    handleApiError(error);
  }
};
