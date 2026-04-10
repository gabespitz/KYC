import { db } from "./db";

/**
 * Single-user session shim for the MVP.
 * Returns the seeded admin user. Replace with NextAuth (or similar) later
 * by changing only this file — every API route calls getCurrentUser().
 */
export async function getCurrentUser() {
  const user = await db.user.findFirst({
    where: { email: "owner@inallmedia.local" },
  });
  if (!user) {
    throw new Error(
      "No seed user found. Run `npm run db:seed` to create the default user."
    );
  }
  return user;
}
