"use client";

import { cn } from "cn";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { LoginFormSchema, LoginFormType } from "@/lib/zodSchema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { authClient, signInGoogle } from "@/lib/auth-client";
import { useTransition, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconAlertCircle, IconCircleCheck, IconLoader2 } from "@tabler/icons-react";
import { Alert, AlertDescription } from "@repo/ui/components/alert";
import Link from "next/link";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const form = useForm<LoginFormType>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  function onSubmit(data: LoginFormType) {
    startTransition(async () => {
      setError(null);
      setSuccess(null);
      await authClient.signIn.email({
        email: data.email,
        password: data.password,

        fetchOptions: {
          onSuccess: () => {
            const rawCallback = searchParams.get("callbackUrl");
            const callbackUrl =
              rawCallback &&
              rawCallback.startsWith("/") &&
              !rawCallback.startsWith("//")
                ? rawCallback
                : "/";
            setSuccess("Logged in successfully.");
            router.push(callbackUrl);
          },
          onError: (ctx) => {
            setError(ctx.error.message);
          },
        },
      });
    });
  }

  async function signInWithGoogle() {
    startTransition(async () => {
      setError(null);
      await signInGoogle();
    });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              {error && (
                <Alert variant="destructive">
                  <IconAlertCircle className="size-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert variant="success">
                  <IconCircleCheck className="size-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="m@example.com"
                      required
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="flex items-center">
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Link
                        href="#"
                        className="ml-auto opacity-60 inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      type="password"
                      placeholder="******"
                      required
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Field>
                <Button type="submit">
                  {isPending ? (
                    <>
                      <IconLoader2 className="size-4 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <span>Login</span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="mb-4"
                  onClick={signInWithGoogle}
                >
                  Login with Google
                </Button>

              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
