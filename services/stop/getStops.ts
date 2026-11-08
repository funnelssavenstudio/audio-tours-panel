"use server";

import axios from "axios";
import { UUID } from "crypto";
import { handleApiError } from "../utils/handleApiError";

export interface Location {
  longitude: number;
  latitude: number;
}

export interface Translation {
  language_code: string;
  title: string;
  description: string;
}

export interface Stop {
  uuid: UUID;
  active: boolean;
  location: Location;
  created_at: string;
  updated_at: string;
  type?: string;
  translations: Translation[];
}
export const getStops = async (token: string) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get(`${process.env.API_URL}stops`, {
      headers,
    });
    const users: Stop[] = response.data.list;
    return users;
  } catch (error) {
    handleApiError(error);
  }
};
