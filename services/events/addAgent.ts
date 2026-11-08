"use server";

import axios from "axios";
import { handleApiError } from "../utils/handleApiError";

type AddTourGuideResponse = {
  tour_guide_uuid: string;
};

export const addAgent = async (
  token: string,
  eventId: string,
  tourGuideId: string
): Promise<AddTourGuideResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.post(
      `${process.env.API_URL}event/${eventId}/tour_guide`,
      {
        tour_guide_uuid: tourGuideId,
      },
      { headers }
    );
    const addTourGuideResponse: AddTourGuideResponse = response.data;
    return addTourGuideResponse;
  } catch (error) {
    handleApiError(error);
  }
};
