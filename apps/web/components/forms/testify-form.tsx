"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@repo/ui/components/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { testifyFormSchema, type TestifyFormValues } from "@/lib/schemas/testify";
import { toast } from "@repo/ui/components/toast";

export function TestifyForm() {
  const form = useForm<TestifyFormValues>({
    resolver: zodResolver(testifyFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      testimony: "",
    },
  });

  async function onSubmit(data: TestifyFormValues) {
    try {
      const response = await fetch("/api/testify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Testimony form submission failed (${response.status})`);
      }

      toast.add({
        type: "success",
        description: "Your testimony has been submitted successfully.",
      });
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        testimony: "",
      });
    } catch (error) {
      console.error("Unable to submit testimony:", error);
      toast.add({
        type: "error",
        description: "We could not submit your testimony. Please try again.",
      });
    }
  }

  const formId = "testify-form";

  return (
    <Card className="w-full sm:max-w-2xl mx-auto">
      <CardContent>
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* First Name & Last Name row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="firstName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${formId}-firstName`}>
                      First Name
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`${formId}-firstName`}
                      aria-invalid={fieldState.invalid}
                      placeholder="John"
                      autoComplete="given-name"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="lastName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${formId}-lastName`}>
                      Second Name / Last Name
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`${formId}-lastName`}
                      aria-invalid={fieldState.invalid}
                      placeholder="Doe"
                      autoComplete="family-name"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* Email */}
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-email`}>Email</FieldLabel>
                  <Input
                    {...field}
                    id={`${formId}-email`}
                    type="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="john@example.com"
                    autoComplete="email"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <p className="text-sm text-muted-foreground">
              Image uploads are temporarily unavailable. You can still share
              your written testimony.
            </p>

            {/* Testimony */}
            <Controller
              name="testimony"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-testimony`}>
                    Testimony
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={`${formId}-testimony`}
                    aria-invalid={fieldState.invalid}
                    placeholder="Share what God has done..."
                    className="min-h-37.5"
                    aria-expanded
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form={formId} size="lg" className="w-full">
          Submit Testimony
        </Button>
      </CardFooter>
    </Card>
  );
}
