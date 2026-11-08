import { Tab } from "@/app/backoffice/tours/components/reorder/ReOrderListTour";
import axios from "axios";
import { handleApiError } from "../utils/handleApiError";
import { CheckpointResponse } from "./createCheckpoint";

export const createNewCheckpoints = async (
  token: string,
  tourUuid: string,
  newCheckpoints: Tab[]
) => {
  const responses: CheckpointResponse[] = [];
  let previousCheckpointIndex: string | null = null;

  for (const tab of newCheckpoints) {
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
      console.log("Response:", response);

      const checkpoint: CheckpointResponse = response.data;
      responses.push(checkpoint);
      previousCheckpointIndex = checkpoint.checkpoint_fractional_index;
    } catch (error) {
      handleApiError(error);
    }
  }

  return responses;
};
