import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    handle?: string | null;
  }

  interface Session {
    user: {
      id: string;
      handle?: string | null;
    } & DefaultSession["user"];
  }
}
