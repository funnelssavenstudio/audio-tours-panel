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

export interface Poi {
  uuid: UUID;
  active: boolean;
  location: Location;
  created_at: string;
  updated_at: string;
  type?: string;
  translations: Translation[];
}
export const getPois = async (token: string) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get(
      `${process.env.API_URL}points_of_interest`,
      { headers }
    );
    const users: Poi[] = response.data.list;
    return users;
  } catch (error) {
    handleApiError(error);
  }
};
