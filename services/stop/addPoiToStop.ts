"use server";

import { Tab } from "@/app/components/reorder/ReOrderList";
import axios from "axios";
import { handleApiError } from "../utils/handleApiError";

type StopResponse = {
  point_of_interest_uuid: string;
};

export const addPoiToStop = async (
  token: string,
  stopUuid: string,
  tabs: Tab[]
): Promise<StopResponse[]> => {
  const responses: StopResponse[] = [];

  for (const tab of tabs) {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.post(
        `${process.env.API_URL}stop/${stopUuid}/point_of_interest/${tab.value}`,
        {},
        { headers }
      );
      const stopResponse: StopResponse = response.data;
      console.log("poiResponse:", stopResponse);
      responses.push(stopResponse);
    } catch (error) {
      handleApiError(error);
    }
  }

  return responses;
};
