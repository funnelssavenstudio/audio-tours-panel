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

export interface Tour {
  external_id: number;
  uuid: UUID;
  active: boolean;
  pickup_location: Location;
  created_at: string;
  updated_at: string;
  translations: Translation[];
}

export const getTours = async (token: string) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get(`${process.env.API_URL}tours`, {
      headers,
    });
    const users: Tour[] = response.data.list;
    return users;
  } catch (error) {
    handleApiError(error);
  }
};
