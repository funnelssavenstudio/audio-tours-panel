import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { authConfig } from "@/auth.config";

const apiUrl = process.env.API_URL;
const loginUrl = apiUrl ? `${apiUrl.replace(/\/?$/, "/")}auth/login` : null;

if (!authConfig.secret) {
  console.error(
    "[auth] Missing AUTH_SECRET/NEXTAUTH_SECRET. Auth routes can fail in production.",
  );
}

function decodeAccessTokenExpiration(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const decoded = JSON.parse(atob(padded));
    return typeof decoded?.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        if (!loginUrl) {
          console.error("[auth] Missing API_URL for credentials login.");
          return null;
        }

        try {
          const response = await axios.post(loginUrl, {
            email: credentials.email,
            password: credentials.password,
          });

          const { access_token, user_with_details } = response.data;

          if (access_token && user_with_details) {
            return {
              ...user_with_details,
              accessToken: access_token.token,
              accessTokenExpires: decodeAccessTokenExpiration(
                access_token.token,
              ),
            };
          }

          return null;
        } catch (error) {
          if (
            axios.isAxiosError(error) &&
            (error.response?.status === 400 || error.response?.status === 401)
          ) {
            return null;
          }

          throw error;
        }
      },
    }),
  ],
});
