import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@repo/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "dummy-github-id",
      clientSecret: process.env.GITHUB_SECRET || "dummy-github-secret",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy-google-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy-google-secret",
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Dev Bypass",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "test@example.com" },
        name: { label: "Name", type: "text", placeholder: "Test User" },
      },
      async authorize(credentials) {
        const email = credentials?.email || "sandbox@example.com";
        const name = credentials?.name || "Dev Sandbox";

        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            email,
            name,
            image: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        // When using JWT strategy, the user ID is in token.sub instead of user.id
        session.user.id = token.sub || "";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  secret: process.env.NEXTAUTH_SECRET || "dummy-nextauth-secret-for-build",
};
