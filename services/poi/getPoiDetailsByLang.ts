'use server';

import axios from 'axios';
import { handleApiError } from '../utils/handleApiError';

type Location = {
	longitude: number;
	latitude: number;
};

export type PointOfInterest = {
	uuid: string;
	active: boolean;
	location: Location;
	created_at: string;
	updated_at: string;
	title: string;
	description: string;
	language_code: string;
	audios: any[];
	videos: any[];
	images: any[];
};

export type PoiResponse = {
	point_of_interest: PointOfInterest;
};

export const getPoiDetailsByLang = async (token: string, uuid: string, lang: string) => {
	try {
		const headers = {
			Authorization: `Bearer ${token}`
		};
		const response = await axios.get(`${process.env.API_URL}point_of_interest/${uuid}/${lang}`, { headers });
		const users: PoiResponse = response.data;
		return users;
	} catch (error) {
		handleApiError(error);
	}
}
