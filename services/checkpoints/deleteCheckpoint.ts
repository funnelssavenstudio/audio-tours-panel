"use server";

import axios from "axios";
import { handleApiError } from "../utils/handleApiError";

export type CheckpointResponse = {
  checkpoint_uuid: string;
};

export const deleteCheckpoint = async (
  token: string,
  uuid: string
): Promise<CheckpointResponse[]> => {
  const responses: CheckpointResponse[] = [];

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.delete(
      `${process.env.API_URL}checkpoint/${uuid}`,
      { headers }
    );
    const checkpoint: CheckpointResponse = response.data;
    console.log("Checkpoint delete:", checkpoint);

    responses.push(checkpoint);
  } catch (error) {
    handleApiError(error);
  }

  return responses;
};
