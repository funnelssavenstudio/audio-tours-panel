"use server";

import axios from "axios";
import { handleApiError } from "../utils/handleApiError";

type Tab = {
  label: string;
  value: string;
  type: string;
  language: string;
  description: string;
};

export type CheckpointResponse = {
  checkpoint_uuid: string;
  checkpoint_fractional_index: string;
};

export const createCheckpoint = async (
  token: string,
  tourUuid: string,
  tabs: Tab[]
): Promise<CheckpointResponse[]> => {
  const responses: CheckpointResponse[] = new Array(tabs.length);

  let previousCheckpointIndex: string | null = null;

  // Iterate bottom→top so the backend assigns higher fractional_index to items
  // higher in the visual list (app reads checkpoints DESC: highest fi = first
  // stop). responses[i] is filled positionally so the caller can match by index.
  for (let i = tabs.length - 1; i >= 0; i--) {
    const tab = tabs[i];
    const payload = {
      tour_uuid: tourUuid,
      before: previousCheckpointIndex,
      after: null,
      type: tab.type === "Punto de interés" ? "point_of_interest" : "stop",
      entity_uuid: tab.value,
    };
    console.log("Payload:", payload);

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.post(
        `${process.env.API_URL}checkpoint`,
        payload,
        { headers }
      );
      const checkpoint: CheckpointResponse = response.data;
      console.log("Checkpoint creado:", checkpoint);

      responses[i] = checkpoint;
      previousCheckpointIndex = checkpoint.checkpoint_fractional_index;
    } catch (error) {
      handleApiError(error);
    }
  }

  return responses;
};
