"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { buttonVariants } from "@repo/ui/components/button";
import { IconMail } from "@tabler/icons-react";
import Link from "next/link";

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card {...props}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <IconMail className="size-6" />
        </div>
        <CardTitle className="text-xl">Registration is Invite-Only</CardTitle>
        <CardDescription>
          Admin accounts are by invitation only. Self-service sign-up is
          currently disabled.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-center">
        <p className="text-sm text-muted-foreground">
          If you are an administrator and need access, please contact the system
          administrator to receive an invitation.
        </p>
        <Link
          href="/auth/login"
          className={buttonVariants({
            variant: "default",
            className: "w-full",
          })}
        >
          Return to Sign In
        </Link>
      </CardContent>
    </Card>
  );
}
