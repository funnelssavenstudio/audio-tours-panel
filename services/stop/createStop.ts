"use server";

import axios from "axios";
import { handleApiError } from "../utils/handleApiError";

type StopResponse = {
  stop_uuid: string;
};

export const createStop = async (
  token: string,
  latitude: number,
  longitude: number
): Promise<StopResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.post(
      `${process.env.API_URL}stop`,
      {
        latitude: latitude,
        longitude: longitude,
      },
      { headers }
    );
    const poiResponse: StopResponse = response.data;
    return poiResponse;
  } catch (error) {
    handleApiError(error);
  }
};
