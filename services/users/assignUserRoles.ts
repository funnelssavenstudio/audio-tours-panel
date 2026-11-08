'use server';

import axios from 'axios';
import { UUID } from 'crypto';

export interface Roles {
	administrator: boolean;
	tour_guide: boolean;
	tourist: boolean;
}

type AssignRolesResponse = {
	user_uuid: string;
};

export const assignUserRoles = async (
	token: string,
	userUUID: UUID | string,
	roles: Roles
) => {
	try {
		const headers = {
			Authorization: `Bearer ${token}`
		};
		const response = await axios.post(`${process.env.API_URL}user/${userUUID}/roles`, roles, { headers });
		const assignRoles: AssignRolesResponse = response.data;
		return assignRoles;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const message =
				(typeof error.response?.data === 'string' && error.response.data) ||
				error.response?.data?.message ||
				error.message ||
				'Internal server error';
			throw new Error(message);
		}
		else {
			throw error;
		}
	}
}
