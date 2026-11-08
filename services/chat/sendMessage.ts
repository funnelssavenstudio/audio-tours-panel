"use server";

import axios from "axios";

import { handleApiError } from "../utils/handleApiError";
import { chatUrl } from "./baseUrl";
import { ChatMessage } from "./types";

// Envia un mensaje del admin al chat del evento. El backend detecta el rol del
// remitente (administrator -> 'admin') a partir del token y crea la sala si no
// existe.
export const sendMessage = async (
  token: string,
  eventUuid: string,
  text: string
): Promise<ChatMessage> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.post(
      chatUrl(`/api/chat/${eventUuid}/messages`),
      { text },
      { headers }
    );
    const message: ChatMessage = response.data.message;
    return message;
  } catch (error) {
    handleApiError(error);
  }
};
