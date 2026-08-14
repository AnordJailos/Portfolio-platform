/**
 * lib/auth.ts
 * ----------------------------------------------------------------------------
 * Auth.js v5 configuration. Credentials-based login (email + password) is
 * used for the admin dashboard rather than social OAuth, since this is a
 * single-owner (or small-team) CMS, not a multi-tenant consumer app.
 *
 * To add a second admin/editor: create a User row with a bcrypt passwordHash
 * (see prisma/seed.ts for the pattern), or build a small "invite" flow later.
 * ----------------------------------------------------------------------------
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  // Required for Auth.js v5 to trust the Host header when deployed behind
  // Vercel's (or any) reverse proxy — without this, callback/redirect URLs
  // can resolve incorrectly in production. Safe here because we control
  // the only host this app is served from.
  trustHost: true,
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & { role?: string }).role = token.role as string | undefined;
      }
      return session;
    },
  },
});

/** Throws if there is no authenticated ADMIN/EDITOR session — use at the top of protected server actions/route handlers. */
export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("UNAUTHENTICATED");
  }
  return session;
}
