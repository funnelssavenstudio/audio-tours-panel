'use server';

import axios from 'axios';
import { handleApiError } from '../utils/handleApiError';

type PoiResponse = {
	point_of_interest_uuid: string;
};

interface LanguageObject {
	language_code: string;
	title: string;
	description: string;
}

export const createPoiLang = async (token: string, point_of_interest_uuid: string, { language_code, title, description }: LanguageObject): Promise<PoiResponse> => {
	try {
		const headers = {
			Authorization: `Bearer ${token}`,
		};
		const response = await axios.post(
			`${process.env.API_URL}point_of_interest/${point_of_interest_uuid}/translation`,
			{
				language_code,
				title,
				description,
			},
			{ headers }
		);
		const poiResponse: PoiResponse = response.data;
		return poiResponse;
	} catch (error) {
		handleApiError(error);
	}
};