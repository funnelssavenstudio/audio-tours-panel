import type { NextAuthConfig } from "next-auth";

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

export const authConfig = {
  secret: authSecret,
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.accessTokenExpires = user.accessTokenExpires ?? null;
        token.uuid = user.uuid;
        token.email = user.email;
        token.name = user.name;
        token.last_name = user.last_name;
        token.active = user.active;
        token.roles = user.roles;
        token.phone_number = user.phone_number;
        token.created_at = user.created_at;
        token.updated_at = user.updated_at;
      }

      if (
        token.accessTokenExpires &&
        Date.now() >= token.accessTokenExpires
      ) {
        return null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.accessToken = token.accessToken;
        session.user.accessTokenExpires = token.accessTokenExpires ?? null;
        session.user.uuid = token.uuid;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.last_name = token.last_name;
        session.user.active = token.active;
        session.user.roles = token.roles;
        session.user.phone_number = token.phone_number;
        session.user.created_at = token.created_at;
        session.user.updated_at = token.updated_at;
      }
      session.accessTokenExpires = token.accessTokenExpires ?? null;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
