"use server";

import axios from "axios";
import { handleApiError } from "../utils/handleApiError";

export const deleteMedia = async (
  token: string,
  uuidMedia: string
) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.delete(
      `${process.env.API_URL}media/${uuidMedia}`,
      { headers }
    );

    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};
