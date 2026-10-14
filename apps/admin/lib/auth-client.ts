import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export async function signInGoogle() {
  await authClient.signIn.social({
    provider: "google",
  });
}
