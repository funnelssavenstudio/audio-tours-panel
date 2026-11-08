"use server";
import axios from "axios";
import { Language } from "./getLanguages"; // Suponiendo que la respuesta es similar a la interfaz Language

export interface NewLocaleData {
  key: string;
  value: string;
}

export interface CreateLanguagePayload {
  name: string;
  code: string;
  active?: boolean; // El backend podría definir esto por defecto
  locales: NewLocaleData[];
}

// Asume que tu backend responde con el objeto Language creado o un mensaje de éxito.
// Ajusta el tipo de retorno según tu API.
export const createLanguage = async (
  token: string,
  payload: CreateLanguagePayload
): Promise<Language> => {
  // O Promise<void> o Promise<{ message: string }>
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    // Este es un endpoint HIPOTÉTICO. Debes crear esto en tu backend.
    // Por ejemplo, un POST a /api/v1/languages
    const response = await axios.post<Language>(
      `${process.env.API_URL}languages`, // Ajusta este endpoint
      payload,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating new language:", error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) throw new Error("Token expired");
      if (error.response?.status === 409)
        throw new Error("El código de idioma ya existe.");
      const backendError =
        error.response?.data?.message || error.response?.data?.detail;
      throw new Error(
        backendError || error.message || "Fallo al crear el idioma."
      );
    }
    throw new Error("Ocurrió un error desconocido al crear el idioma.");
  }
};
