import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    email: string;
    accessToken: string;
  }
  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    email: string;
    accessToken: string;
  }
}