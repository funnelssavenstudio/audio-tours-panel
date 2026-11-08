"use server";

import axios from "axios";

interface CreateLocaleParams {
  code: string;
  key: string;
  value: string;
  language_uuid?: string;
  language?: string;
}

interface CreateLocaleResult {
  success: boolean;
  message?: string;
}

export async function createLocale(
  token: string,
  params: CreateLocaleParams
): Promise<CreateLocaleResult> {
  try {
    const response = await axios.post(
      `${process.env.API_URL}language/locale`,
      {
        code: params.code,
        key: params.key,
        value: params.value,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("response", response);

    return {
      success: true,
      message: response.data?.message || "Traducción guardada con éxito.",
    };
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 422) {
      if (params.language_uuid && params.language) {
        try {
          await axios.put(
            `${process.env.API_URL}language/${params.language_uuid}`,
            {
              active: true,
              code: params.code,
              name: params.language,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const retryResponse = await axios.post(
            `${process.env.API_URL}language/locale`,
            {
              code: params.code,
              key: params.key,
              value: params.value,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          return {
            success: true,
            message:
              retryResponse.data?.message ||
              "Traducción guardada con éxito tras activar el idioma.",
          };
        } catch (retryError: any) {
          return {
            success: false,
            message:
              retryError?.response?.data?.message ||
              retryError?.message ||
              "Error al activar el idioma y guardar la traducción.",
          };
        }
      }
      return {
        success: false,
        message:
          "El idioma no está activo y no se pudo activar automáticamente.",
      };
    }
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Error al crear la traducción del idioma.",
    };
  }
}
