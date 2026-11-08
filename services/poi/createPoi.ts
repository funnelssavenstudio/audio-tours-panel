"use server";

import axios from "axios";
import { handleApiError } from "../utils/handleApiError";

type PoiResponse = {
  point_of_interest_uuid: string;
};

export const createPoi = async (
  token: string,
  latitude: number,
  longitude: number
): Promise<PoiResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.post(
      `${process.env.API_URL}point_of_interest`,
      {
        latitude: latitude,
        longitude: longitude,
      },
      { headers }
    );
    const poiResponse: PoiResponse = response.data;
    return poiResponse;
  } catch (error) {
    handleApiError(error);
  }
};
