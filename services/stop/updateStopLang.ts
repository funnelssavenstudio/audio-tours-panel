"use server";

import axios from "axios";
import { handleApiError } from "../utils/handleApiError";

type StopResponse = {
  point_of_interest_uuid: string;
};

interface LanguageObject {
  language_code: string;
  title: string;
  description: string;
}

export const updateStopLang = async (
  token: string,
  stop_uuid: string,
  { language_code, title, description }: LanguageObject
): Promise<StopResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.put(
      `${process.env.API_URL}stop/${stop_uuid}/translation/${language_code}`,
      {
        title,
        description,
      },
      { headers }
    );
    const stopResponse: StopResponse = response.data;
    return stopResponse;
  } catch (error) {
    handleApiError(error);
  }
};
