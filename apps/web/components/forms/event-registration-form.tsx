"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import {
  eventRegistrationSchema,
  type EventRegistrationValues,
} from "@/lib/schemas/event-registration";
import { toast } from "@repo/ui/components/toast";

interface EventRegistrationFormProps {
  eventId: string;
  eventTitle: string;
}

export function EventRegistrationForm({
  eventId,
  eventTitle,
}: EventRegistrationFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventRegistrationValues>({
    resolver: zodResolver(eventRegistrationSchema),
    defaultValues: {
      eventId,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (data: EventRegistrationValues) => {
    try {
      const payload = {
        event_id: parseInt(data.eventId, 10),
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
      };

      const res = await fetch(`${process.env.ADMI_API_URL}/events/${data.eventId}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Registration failed");

      toast.add({
        title: "Registration Successful!",
        description: `You have been registered for ${eventTitle}. We look forward to seeing you!`,
        type: "success",
      });
      reset();
    } catch (error) {
      console.error("Unable to submit event registration:", error);
      toast.add({
        title: "Something went wrong",
        description: "Please try again later.",
        type: "error",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register for this Event</CardTitle>
        <CardDescription>
          Fill in your details below to secure your spot.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <FieldGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel>First Name</FieldLabel>
                <Input placeholder="John" {...register("firstName")} />
                {errors.firstName && (
                  <FieldError>{errors.firstName.message}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel>Last Name</FieldLabel>
                <Input placeholder="Doe" {...register("lastName")} />
                {errors.lastName && (
                  <FieldError>{errors.lastName.message}</FieldError>
                )}
              </Field>
            </div>
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                type="email"
                placeholder="john@example.com"
                {...register("email")}
              />
              {errors.email && (
                <FieldError>{errors.email.message}</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel>Phone</FieldLabel>
              <Input
                type="tel"
                placeholder="+234 ..."
                {...register("phone")}
              />
              {errors.phone && (
                <FieldError>{errors.phone.message}</FieldError>
              )}
            </Field>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Registering..." : "Register Now"}
          </Button>
          </FieldGroup>
        </CardContent>
        <CardFooter>
        </CardFooter>
      </form>
    </Card>
  );
}
