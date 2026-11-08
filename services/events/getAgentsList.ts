"use server";

import axios from "axios";
import { handleApiError } from "../utils/handleApiError";

export interface TourGuide {
  uuid: string;
  name: string;
  last_name: string;
  email: string;
  active: boolean;
  phone_number: string;
  roles: string[];
  avatar: string | null;
  language: string;
  created_at: string;
  updated_at: string;
}

interface TourGuideResponse {
  list: TourGuide[];
}

export const getAgentsList = async (
  token: string
): Promise<TourGuide[]> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get<TourGuideResponse>(
      `${process.env.API_URL}users/role/tour_guide`,
      {
        headers,
      }
    );
    console.log("response", response.data.list);

    return response.data.list;
  } catch (error) {
    handleApiError(error);
  }
};
