"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";

/**
 * Server action used by <form action={adminSignOut}> in the admin
 * sidebar/header. Auth.js v5's signOut() handles the session cookie and
 * CSRF concerns internally when called as a server action — a plain HTML
 * form POST to /api/auth/signout would need a manually-attached CSRF
 * token, which this sidesteps entirely.
 */
export async function adminSignOut() {
  await signOut({ redirect: false });
  redirect("/admin/login");
}
