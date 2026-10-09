"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import {
  contactFormSchema,
  type ContactFormValues,
  type ContactType,
} from "@/lib/schemas/contact";
import { toast } from "@repo/ui/components/toast";

interface ContactFormConfig {
  title: string;
  description: string;
  messageLabel: string;
  messagePlaceholder: string;
}

const formConfig: Record<ContactType, ContactFormConfig> = {
  prayer: {
    title: "Submit Prayer Request",
    description:
      "Share your prayer needs with us, and our team will stand with you in faith.",
    messageLabel: "Prayer Request",
    messagePlaceholder: "Please share your prayer request...",
  },
  counseling: {
    title: "Request Counseling",
    description: "Request a counseling session with one of our ministers.",
    messageLabel: "Reason for Counseling",
    messagePlaceholder: "Please share why you're seeking counseling...",
  },
  inquiry: {
    title: "General Inquiry",
    description: "Have a question? We're here to help.",
    messageLabel: "Message",
    messagePlaceholder: "How can we help you?",
  },
};

export function ContactForm({ type }: { type: ContactType }) {
  const config = formConfig[type];

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      type,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  // Reset form when tab type changes
  React.useEffect(() => {
    form.reset({
      type,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
    });
  }, [type, form]);

  async function onSubmit(data: ContactFormValues) {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Contact form submission failed");
      }

      toast.add({
        type: "success",
        description: "Your message has been submitted successfully.",
      });
      form.reset({
        type,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch {
      toast.add({
        type: "error",
        description: "We could not submit your message. Please try again.",
      });
    }
  }

  const formId = `contact-form-${type}`;

  return (
    <Card className="w-full sm:max-w-lg">
      <CardHeader>
        <CardTitle className="text-xl">{config.title}</CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* First Name & Last Name row */}
            <div className="grid grid-cols-2 gap-4">
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
                      Last Name
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

            {/* Phone (Optional) */}
            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-phone`}>
                    Phone (Optional)
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

            {/* Message / Prayer Request / Reason */}
            <Controller
              name="message"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-message`}>
                    {config.messageLabel}
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={`${formId}-message`}
                    aria-invalid={fieldState.invalid}
                    placeholder={config.messagePlaceholder}
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
          Submit
        </Button>
      </CardFooter>
    </Card>
  );
}
