"use client";

import * as React from "react";
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
import { toast } from "@/components/ui/toast";

export function TestifyForm() {
  const form = useForm<TestifyFormValues>({
    resolver: zodResolver(testifyFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      testimony: "",
    },
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  async function onSubmit(data: TestifyFormValues) {
    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("testimony", data.testimony);
      
      if (data.images && data.images.length > 0) {
        for (let i = 0; i < data.images.length; i++) {
          formData.append("images", data.images[i]);
        }
      }

      // We use formData instead of JSON to support file uploads
      const response = await fetch("/api/testify", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Testimony form submission failed");
      }

      toast.add({
        type: "success",
        description: "Your testimony has been submitted successfully.",
      });
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        testimony: "",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch {
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

            {/* Phone (WhatsApp) */}
            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-phone`}>
                    Phone No. (WhatsApp)
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`${formId}-phone`}
                    type="tel"
                    aria-invalid={fieldState.invalid}
                    placeholder="+234..."
                    autoComplete="tel"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Images Upload */}
            <Controller
              name="images"
              control={form.control}
              render={({ field: { onChange, value, ...rest }, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-images`}>
                    Images (Optional)
                  </FieldLabel>
                  <Input
                    {...rest}
                    id={`${formId}-images`}
                    type="file"
                    multiple
                    accept="image/*"
                    aria-invalid={fieldState.invalid}
                    onChange={(e) => {
                      onChange(e.target.files);
                    }}
                    ref={(e) => {
                      rest.ref(e);
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      fileInputRef.current = e;
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

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
