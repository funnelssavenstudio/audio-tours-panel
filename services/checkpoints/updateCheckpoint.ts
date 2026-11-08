"use server";

import axios from "axios";
import { handleApiError } from "../utils/handleApiError";

type Tab = {
  label: string;
  value: string;
  checkpoint_uuid?: string;
  fractional_index?: string;
  type?: string;
  language: string;
  description: string;
};

export type CheckpointResponse = {
  checkpoint_uuid: string;
  checkpoint_fractional_index: string;
};

export const updateCheckpoint = async (
  token: string,
  reorderedCheckpoints: Tab[]
): Promise<CheckpointResponse[]> => {
  const responses: CheckpointResponse[] = [];
  let previousCheckpointIndex: string | null = null;

  // The visual list is top→bottom = first→last stop, but the backend assigns
  // ascending fractional_index when chained via `before` and the app reads them
  // DESC (highest = first stop). So we iterate bottom→top: the last visual item
  // gets the lowest fi, the top visual item gets the highest fi.
  const queue = [...reorderedCheckpoints].reverse();

  for (let i = 0; i < queue.length; i++) {
    const tab = queue[i];
    const before: string | null = previousCheckpointIndex;
    const after = null;

    const payload: { before: string | null; after: string | null } = {
      before,
      after,
    };

    try {
      console.log("tab", tab);
      console.log("payload", payload);

      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.post(
        `${process.env.API_URL}checkpoint/${tab.checkpoint_uuid}/reorder`,
        payload,
        { headers }
      );

      const checkpoint: CheckpointResponse = response.data;

      console.log("response", checkpoint);
      responses.push(checkpoint);
      previousCheckpointIndex = response.data.checkpoint_fractional_index;
    } catch (error) {
      handleApiError(error);
    }
  }

  return responses;
};
