"use server";

import axios from "axios";

type TourResponse = {
  tour_uuid: string;
};

export const createTourMedia = async (
  token: string,
  tour_uuid: string,
  language_code: string,
  audio?: FormData | undefined,
  image?: FormData | undefined
): Promise<TourResponse> => {
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  try {
    if (audio) {
      const audioFile = audio.get("audio") as File;
      if (!audioFile) throw new Error("No audio file found");

      const audioData = await audioFile.arrayBuffer();
      const fileName = encodeURIComponent(audioFile.name);

      const response = await axios.post(
        `${process.env.API_URL}tour/${tour_uuid}/media/${fileName}/translation/${language_code}`,
        audioData,
        {
          headers: {
            ...headers,
            "Content-Type": audioFile.type,
          },
        }
      );
      const poiResponse: TourResponse = response.data;
      return poiResponse;
    }

    if (image) {
      const imageFile = image.get("image") as File;
      if (!imageFile) throw new Error("No image file found");

      const imageData = await imageFile.arrayBuffer();
      const fileName = encodeURIComponent(imageFile.name);

      const response = await axios.post(
        `${process.env.API_URL}tour/${tour_uuid}/media/${fileName}/translation/${language_code}`,
        imageData,
        {
          headers: {
            ...headers,
            "Content-Type": imageFile.type,
          },
        }
      );
      const poiResponse: TourResponse = response.data;
      return poiResponse;
    }

    return { tour_uuid: "Error no se pudo cargar el archivo" };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        (typeof error.response?.data === "string" && error.response.data) ||
        error.response?.data?.message ||
        error.message ||
        "Error al cargar media del tour";

      console.log("Axios error createTourMedia:", {
        status: error.response?.status,
        data: error.response?.data,
        message: errorMessage,
      });

      throw new Error(errorMessage);
    } else {
      console.log("Non-Axios error:", error);
      throw error;
    }
  }
};
