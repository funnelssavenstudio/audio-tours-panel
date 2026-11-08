"use server";

import axios from "axios";
import { handleApiError } from "../utils/handleApiError";

type DeletePoiResponse = {
  point_of_interest_uuid: string;
};

export const deletePoi = async (
  token: string,
  uuid: string
): Promise<DeletePoiResponse | undefined> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.delete(
      `${process.env.API_URL}point_of_interest/${uuid}`,
      { headers }
    );
    return response.data as DeletePoiResponse;
  } catch (error) {
    handleApiError(error);
  }
};
