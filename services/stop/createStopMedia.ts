"use server";

import axios from "axios";

type StopResponse = {
  stop_uuid: string;
};

export const createStopMedia = async (
  token: string,
  stop_uuid: string,
  language_code: string,
  audio?: FormData | undefined,
  image?: FormData | undefined
): Promise<StopResponse> => {
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
        `${process.env.API_URL}stop/${stop_uuid}/media/${fileName}/translation/${language_code}`,
        audioData,
        {
          headers: {
            ...headers,
            "Content-Type": audioFile.type,
          },
        }
      );
      const poiResponse: StopResponse = response.data;
      return poiResponse;
    }

    if (image) {
      const imageFile = image.get("image") as File;
      if (!imageFile) throw new Error("No image file found");

      const imageData = await imageFile.arrayBuffer();
      const fileName = encodeURIComponent(imageFile.name);

      const response = await axios.post(
        `${process.env.API_URL}stop/${stop_uuid}/media/${fileName}/translation/${language_code}`,
        imageData,
        {
          headers: {
            ...headers,
            "Content-Type": imageFile.type,
          },
        }
      );
      const poiResponse: StopResponse = response.data;
      return poiResponse;
    }

    return { stop_uuid: "Error no se pudo cargar el archivo" };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        (typeof error.response?.data === "string" && error.response.data) ||
        error.response?.data?.message ||
        error.message ||
        "Error al cargar media de la parada";

      console.log("Axios error createStopMedia:", {
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
