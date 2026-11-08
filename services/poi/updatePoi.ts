'use server';

import axios from 'axios';
import { handleApiError } from '../utils/handleApiError';

type PoiResponse = {
	point_of_interest_uuid: string;
};

export const updatePoi = async (token: string, uuid: string, latitude: number, longitude: number): Promise<PoiResponse> => {
	try {
		const headers = {
			Authorization: `Bearer ${token}`,
		};
		const response = await axios.put(
			`${process.env.API_URL}point_of_interest/${uuid}`,
			{
				latitude: latitude,
				longitude: longitude,
			},
			{ headers }
		);
		const poiResponse: PoiResponse = response.data;
		return poiResponse;
	} catch (error) {
		handleApiError(error);
	}
};