import axios from "axios";

export interface RecoveryAccessToken {
  token: string;
  type: string;
}

export interface RecoveryUserWithDetails {
  uuid: string;
  email: string;
  name: string;
  last_name: string;
  active: boolean;
  phone_number: string;
  roles: string[];
  avatar: string | null;
  language: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecoveryValidateResponse {
  access_token: RecoveryAccessToken;
  user_with_details: RecoveryUserWithDetails;
}

const getApiBaseUrl = () => {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!rawBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL no está configurada");
  }
  return rawBaseUrl.replace(/\/?$/, "/");
};

const buildApiUrl = (path: string) =>
  `${getApiBaseUrl()}${path.replace(/^\/+/, "")}`;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) return fallback;

  const data = error.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }
  if (typeof data?.detail === "string" && data.detail.trim()) {
    return data.detail;
  }
  if (typeof error.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

export const requestPasswordRecovery = async (email: string) => {
  try {
    const response = await axios.post(buildApiUrl("auth/recovery"), { email });
    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        "No se pudo iniciar la recuperación de contraseña."
      )
    );
  }
};

export const validatePasswordRecovery = async (email: string, token: string) => {
  try {
    const response = await axios.post<RecoveryValidateResponse>(
      buildApiUrl("auth/recovery/validate"),
      {
        email,
        token,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "No se pudo validar el código de recuperación.")
    );
  }
};

export const updatePasswordWithRecoveryToken = async (
  userUuid: string,
  password: string,
  token: string
) => {
  try {
    const response = await axios.put(
      buildApiUrl(`user/${userUuid}`),
      { password },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "No se pudo actualizar la contraseña.")
    );
  }
};
