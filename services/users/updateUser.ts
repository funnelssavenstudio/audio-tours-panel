"use server";

import axios from "axios";
import { UUID } from "crypto";

export interface UpdateUserPayload {
  email?: string;
  name?: string;
  last_name?: string;
  active?: boolean;
  phone_number?: string;
}

type UpdateUserResponse = {
  user_uuid: UUID;
};

export const updateUser = async (
  token: string,
  uuid: UUID | string,
  user: UpdateUserPayload
) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.put(`${process.env.API_URL}user/${uuid}`, user, {
      headers,
    });
    const updatedUser: UpdateUserResponse = response.data;
    return updatedUser;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (typeof error.response?.data === "string" && error.response.data) ||
        error.response?.data?.message ||
        error.message ||
        "Internal server error";
      throw new Error(message);
    } else {
      throw error;
    }
  }
};
