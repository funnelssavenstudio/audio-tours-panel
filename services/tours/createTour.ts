"use server";

import axios from "axios";
import { handleApiError } from "../utils/handleApiError";

type TourResponse = {
  tour_uuid: string;
};

export const createTour = async (
  token: string,
  external_id: number,
  pickup_latitude: number,
  pickup_longitude: number
): Promise<TourResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.post(
      `${process.env.API_URL}tour`,
      {
        external_id,
        pickup_latitude,
        pickup_longitude,
      },
      { headers }
    );
    const poiResponse: TourResponse = response.data;
    return poiResponse;
  } catch (error) {
    handleApiError(error);
  }
};
