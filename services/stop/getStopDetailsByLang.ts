"use server";

import axios from "axios";
import { handleApiError } from "../utils/handleApiError";

type Location = {
  longitude: number;
  latitude: number;
};

export type Stop = {
  uuid: string;
  active: boolean;
  location: Location;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  language_code: string;
  points_of_interest: { uuid: string; title: string; description: string }[];
  audios: any[];
  videos: any[];
  images: any[];
};

export type StopResponse = {
  stop: Stop;
};

export const getStopDetailsByLang = async (
  token: string,
  uuid: string,
  lang: string
) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get(
      `${process.env.API_URL}stop/${uuid}/${lang}`,
      { headers }
    );
    const users: StopResponse = response.data;
    return users;
  } catch (error) {
    handleApiError(error);
  }
};
