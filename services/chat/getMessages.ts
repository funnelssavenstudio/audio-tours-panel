"use server";

import axios from "axios";

import { handleApiError } from "../utils/handleApiError";
import { chatUrl } from "./baseUrl";
import { ChatMessage } from "./types";

// Trae el hilo de mensajes del chat de un evento. Para el panel admin alcanza
// con el texto original (y su idioma), que el backend devuelve igual.
export const getMessages = async (
  token: string,
  eventUuid: string
): Promise<ChatMessage[]> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get(
      chatUrl(`/api/chat/${eventUuid}/messages`),
      { headers }
    );
    const messages: ChatMessage[] = response.data.list;
    return messages;
  } catch (error) {
    handleApiError(error);
  }
};
