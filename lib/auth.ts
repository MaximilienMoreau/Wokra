import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import GitHub from "next-auth/providers/github";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { generateUniqueHandle } from "@/lib/handle";

const providers: Provider[] = [];

if (env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET) {
  providers.push(GitHub({ clientId: env.AUTH_GITHUB_ID, clientSecret: env.AUTH_GITHUB_SECRET }));
}

providers.push(
  Resend({
    apiKey: env.RESEND_API_KEY ?? "dev-console-only",
    from: env.EMAIL_FROM,
    ...(!env.RESEND_API_KEY && {
      async sendVerificationRequest({ identifier, url }) {
        console.log(`\n[dev] Magic link for ${identifier}:\n${url}\n`);
      },
    }),
  }),
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  trustHost: true,
  secret: env.AUTH_SECRET,
  providers,
  pages: {
    signIn: "/sign-in",
  },
  events: {
    async createUser({ user }) {
      // The Email/magic-link provider never supplies a name (unlike GitHub
      // OAuth), so User.name is nullable at the DB level — backfill it here
      // the same way we backfill handle.
      const emailLocalPart = user.email?.split("@")[0];
      const handle = await generateUniqueHandle(user.name ?? emailLocalPart ?? "user");
      await prisma.user.update({
        where: { id: user.id },
        data: { handle, name: user.name ?? emailLocalPart ?? "New user" },
      });
    },
  },
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.handle = user.handle;
      return session;
    },
  },
});
