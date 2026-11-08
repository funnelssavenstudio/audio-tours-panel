"use server";

import axios from "axios";
import { handleApiError } from "../utils/handleApiError";

export interface Translation {
  language_code: string;
  title: string;
  description: string;
}

export interface TourGuide {
  uuid: string;
  name: string;
  last_name: string;
}

export interface Event {
  uuid: string;
  tour_uuid: string;
  datetime: string;
  status: "open" | "closed";
  progress: "pending" | "open" | "in_progress" | "finished" | "completed";
  created_at: string;
  updated_at: string;
  translations: Translation[];
  tour_guide: TourGuide | null;
}

export interface EventsResponse {
  list: Event[];
}
export const getEvents = async (token: string): Promise<Event[]> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get<EventsResponse>(
      `${process.env.API_URL}events`,
      {
        headers,
      }
    );
    return response.data.list;
  } catch (error) {
    handleApiError(error);
  }
};
