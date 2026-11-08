'use server';

import axios from 'axios';
import { UUID } from 'crypto';
import { handleApiError } from '../utils/handleApiError';

export interface User {
	email: string;
	password: string;
	name: string;
	last_name: string;
	phone_number: string;
}

type AccessToken = {
	token: string;
	type: string;
};

type CreateUserResponse = {
	user_uuid: UUID;
	access_token: AccessToken;
};

export const createUser = async (token: string, user: User) => {
	try {
		const headers = {
			Authorization: `Bearer ${token}`
		};
		const response = await axios.post(`${process.env.API_URL}users`, user, { headers });
		const createdUser: CreateUserResponse = response.data;
		return createdUser;
	} catch (error) {
		handleApiError(error);
	}
}