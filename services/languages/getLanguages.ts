"use server";

import axios from "axios";
import { handleApiError } from "../utils/handleApiError";

export interface Language {
  uuid: string;
  active: boolean;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const getLanguages = async (
  token: string,
  active = true
) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get(
      `${process.env.API_URL}languages/${active}`,
      {
        headers,
      }
    );
    const users: Language[] = response.data.list;
    return users;
  } catch (error) {
    handleApiError(error);
  }
};
