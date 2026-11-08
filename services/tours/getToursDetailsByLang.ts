"use server";

import axios from "axios";
import { handleApiError } from "../utils/handleApiError";

type Location = {
  longitude: number;
  latitude: number;
};

type Checkpoint = {
  uuid: string;
  title: string;
  entity_uuid: string;
  fractional_index: string;
  type: string;
};

export type Tour = {
  uuid: string;
  active: boolean;
  pickup_location: Location;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  language_code: string;
  checkpoints: Checkpoint[] | null;
  audios: string[] | null;
  videos: string[] | null;
  images: string[] | null;
};

export type TourResponse = {
  tour: Tour;
};

export const getTourDetailsByLang = async (
  token: string,
  uuid: string,
  lang: string
) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get(
      `${process.env.API_URL}tour/${uuid}/${lang}`,
      { headers }
    );
    const users: TourResponse = response.data;
    return users;
  } catch (error) {
    handleApiError(error);
  }
};
