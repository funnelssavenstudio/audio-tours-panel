"use server";

import axios from "axios";
import { handleApiError } from "../utils/handleApiError";

type Location = {
  longitude: number;
  latitude: number;
};

export type List = {
  uuid: string;
  active: boolean;
  location: Location;
  factional_index: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  language_code: string;
  type: string;
  points_of_interest: { uuid: string; title: string; description: string }[];
  audios: any[];
  videos: any[];
  images: any[];
};

export type StopResponse = {
  list: List[];
};

export const getCheckpoints = async (
  token: string,
  uuid: string,
  lang: string
) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get(
      `${process.env.API_URL}checkpoints/${uuid}/${lang}`,
      { headers }
    );
    const users: StopResponse = response.data;
    return users;
  } catch (error) {
    handleApiError(error);
  }
};
