"use server";

import axios from "axios";

type TourResponse = {
  tour_uuid: string;
};

export const updateTour = async (
  token: string,
  uuid: string,
  external_id: number,
  active: boolean,
  pickup_latitude: number,
  pickup_longitude: number
): Promise<TourResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.put(
      `${process.env.API_URL}tour/${uuid}`,
      {
        external_id,
        active,
        pickup_latitude,
        pickup_longitude,
      },
      { headers },
    );
    const tourResponse: TourResponse = response.data;
    return tourResponse;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendMessage =
        (typeof error.response?.data === "string" && error.response.data) ||
        error.response?.data?.message ||
        error.message ||
        "No se pudo actualizar el tour";

      switch (error.response?.status) {
        case 401:
          throw new Error("Token expired");
        case 400:
        case 403:
        case 404:
        case 409:
        case 422:
          throw new Error(backendMessage);
        case 500:
        case 502:
        case 503:
        case 504:
        case 530:
          throw new Error("Internal server error");
        default:
          throw new Error(backendMessage);
      }
    } else {
      console.log("Non-Axios error:", error);
      throw error;
    }
  }
};
