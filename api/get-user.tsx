import axios from "axios";

export const getUser = async (userName: string) => {
	try {
		await axios.put('http://localhost:8000/api/v1/auth/forgot-password', {userName})
			.then((response: any) => {
				return response.data.msg
			})
	} catch (error) {
		return console.log('error', error);
	}
}