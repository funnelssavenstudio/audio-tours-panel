"use server";

import axios from "axios";
import { handleApiError } from "../utils/handleApiError";

type TourLangResponse = {
  tour_uuid: string;
};

interface LanguageObject {
  language_code: string;
  title: string;
  description: string;
}

export const updateTourLang = async (
  token: string,
  tour_uuid: string,
  { language_code, title, description }: LanguageObject
): Promise<TourLangResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.put(
      `${process.env.API_URL}tour/${tour_uuid}/translation/${language_code}`,
      {
        title,
        description,
      },
      { headers }
    );
    const tourLangResponse: TourLangResponse = response.data;
    return tourLangResponse;
  } catch (error) {
    handleApiError(error);
  }
};
