"use server";

import axios from "axios";
import { UUID } from "crypto";
import { handleApiError } from "../utils/handleApiError";

export interface User {
  uuid: UUID;
  email: string;
  name: string;
  last_name: string;
  active: boolean;
  roles: string[];
  phone_number: string;
  created_at: string;
  updated_at: string;
}

export const getUsers = async (token: string) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get(`${process.env.API_URL}users`, {
      headers,
    });
    const users: User[] = response.data.list;
    return users;
  } catch (error) {
    handleApiError(error);
  }
};
