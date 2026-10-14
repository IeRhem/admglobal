"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { IconClock, IconLogout, IconRefresh } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WaitingAreaPage() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/auth/login");
          },
          onError: () => {
            setIsSigningOut(false);
          },
        },
      });
    } catch {
      setIsSigningOut(false);
    }
  }

  function handleRetry() {
    router.push("/");
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              <IconClock className="size-6" />
            </div>
            <CardTitle className="text-xl">Account Awaiting Approval</CardTitle>
            <CardDescription>
              Your administrator account has been created and is currently
              pending review by a system administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground">
              Once your account has been approved, you will be granted access to
              the admin dashboard. You can retry accessing the dashboard or sign
              out below.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="default"
              className="w-full flex-1"
              onClick={handleRetry}
            >
              <IconRefresh className="size-4" />
              Check Status
            </Button>
            <Button
              variant="outline"
              className="w-full flex-1"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <IconLogout className="size-4" />
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
