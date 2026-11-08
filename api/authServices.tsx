import Cookies from "js-cookie";
import axios from "axios";

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}auth/login`,
      {
        email,
        password,
      }
    );

    const data = response.data;

    if (data.error) {
      console.log("error", data.error);
      return { error: data.error };
    } else {
      Cookies.set("token", data.access_token.token, {
        expires: 30,
        secure: true,
        sameSite: "strict",
      });
      Cookies.set("user", JSON.stringify(data.user), {
        expires: 30,
        secure: true,
        sameSite: "strict",
      });

      return { user: data.user, role: data.user.role };
    }
  } catch (error: any) {
    return { error: "Ocurrió un error al iniciar sesión." };
  }
};

export const recoverPassword = async (email: string) => {
  try {
    const response = await axios.post("URL_DE_TU_API_RECOVER_PASSWORD", {
      email,
    });

    const data = response.data;

    if (data.error) {
      return { error: data.error };
    } else {
      return { user: data.user };
    }
  } catch (error) {
    console.error("Ocurrió un error:", error);
    return { error: "Ocurrió un error al recuperar la contraseña." };
  }
};
