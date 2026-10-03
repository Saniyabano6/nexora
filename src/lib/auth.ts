import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

import { db } from "../db";
import { users, type NewUser } from "../db/schema";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt" },
  // Our own sign-in screen is the home page
  pages: { signIn: "/" },
  // Orbit's own cookie name, so other localhost projects can't clash with it
  cookies: {
    sessionToken: {
      name: "orbit.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    // Save the user in the `users` table on sign-in.
    // agent_config.userEmail has a foreign key to users.email, so this row must exist.
    async signIn({ user }) {
      const email = user.email;
      if (!email) return false;

      const newUser: NewUser = {
        name: user.name ?? null,
        email,
        image: user.image ?? null,
      };

      try {
        await db
          .insert(users)
          .values(newUser)
          .onConflictDoNothing({ target: users.email });
        return true;
      } catch (error) {
        console.error("Failed to save user:", error);
        return false;
      }
    },
    // After login, go to /workspace unless a safe callbackUrl was given
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // invalid URL, fall through to the default redirect
      }
      return `${baseUrl}/workspace`;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};