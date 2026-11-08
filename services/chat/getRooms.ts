"use server";

import axios from "axios";

import { handleApiError } from "../utils/handleApiError";
import { chatUrl } from "./baseUrl";
import { ChatRoomSummary } from "./types";

// Lista todas las salas de chat (una por evento), con ultimo mensaje y titulo
// del tour, ordenadas por el ultimo mensaje mas reciente primero.
export const getRooms = async (
  token: string
): Promise<ChatRoomSummary[]> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get(chatUrl("/api/chat/rooms"), { headers });
    const rooms: ChatRoomSummary[] = response.data.list;
    return rooms;
  } catch (error) {
    handleApiError(error);
  }
};
