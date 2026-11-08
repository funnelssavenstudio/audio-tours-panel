"use server";

import axios from "axios";
import { UUID } from "crypto";
import { handleApiError } from "../utils/handleApiError";

export interface ActiveLang {
  uuid: UUID;
  active: boolean;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const getActiveLangs = async (
  token: string,
  isActive: boolean = true
) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get(
      `${process.env.API_URL}languages/${isActive}`,
      {
        headers,
      }
    );
    const users: ActiveLang[] = response.data.list;
    return users;
  } catch (error) {
    handleApiError(error);
  }
};
