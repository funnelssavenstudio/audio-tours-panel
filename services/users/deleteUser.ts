'use server';

import axios from 'axios';
import { UUID } from 'crypto';
import { handleApiError } from '../utils/handleApiError';

interface DeleteUser {
	user_uuid: UUID;
}

export const deleteUser = async (token: string, uuid: UUID) => {
	try {
		const headers = {
			Authorization: `Bearer ${token}`
		};
		const response = await axios.delete(`${process.env.API_URL}user/${uuid}`, { headers });
		const deleteUser: DeleteUser = response.data.user_uuid;
		return deleteUser;
	} catch (error) {
		handleApiError(error);
	}
}