import { UUID } from "crypto";
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user?: User & DefaultSession["user"];
    accessTokenExpires?: number | null;
  }

  interface User {
    accessToken: string;
    accessTokenExpires?: number | null;
    uuid: UUID;
    email: string;
    name: string;
    last_name: string;
    active: boolean;
    roles?: string[];
    phone_number: string;
    created_at: string;
    updated_at: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken: string;
    accessTokenExpires?: number | null;
    uuid: UUID;
    email: string;
    name: string;
    last_name: string;
    active: boolean;
    roles?: string[];
    phone_number: string;
    created_at: string;
    updated_at: string;
  }
}
