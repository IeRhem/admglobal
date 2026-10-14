"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  IconCheck,
  IconMapPin,
  IconMoon,
  IconRepeat,
  IconSparkles,
  IconSun,
  IconVideo,
} from "@tabler/icons-react";
import {
  eventRegistrationSchema,
  type EventRegistrationValues,
} from "@/lib/schemas/event-registration";
import { toast } from "@repo/ui/components/toast";
import { AttendeeBadgeDialog } from "@/components/events/attendee-badge-dialog";

interface EventRegistrationFormProps {
  eventId: string;
  eventTitle: string;
  eventImage?: string | null;
  badgeImage?: string | null;
  eventDate?: string;
  eventLocation?: string;
  isRecurring?: boolean;
  recurringDays?: string[];
  hasMorningSession?: boolean;
  morningTime?: string | null;
  hasEveningSession?: boolean;
  eveningTime?: string | null;
}

export function EventRegistrationForm({
  eventId,
  eventTitle,
  eventImage,
  badgeImage,
  eventDate,
  eventLocation,
  isRecurring = false,
  recurringDays = [],
  hasMorningSession = false,
  morningTime,
  hasEveningSession = false,
  eveningTime,
}: EventRegistrationFormProps) {
  const [showBadgeDialog, setShowBadgeDialog] = React.useState(false);
  const [registrationData, setRegistrationData] = React.useState<{
    name: string;
    attendanceMode: "in-person" | "online";
    session: "morning" | "evening" | "both" | "all";
    preferredDay?: string;
  } | null>(null);

  // Determine if dual/multiple session choices are applicable
  const hasMultipleSessions = hasMorningSession && hasEveningSession;
  const initialSession: "morning" | "evening" | "both" = hasMultipleSessions
    ? "both"
    : hasEveningSession
      ? "evening"
      : "morning";

  const initialPreferredDay =
    isRecurring && recurringDays && recurringDays.length > 0
      ? "All Scheduled Days"
      : undefined;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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
      attendanceMode: "in-person",
      session: initialSession,
      preferredDay: initialPreferredDay,
    },
  });

  const selectedAttendanceMode = watch("attendanceMode") || "in-person";
  const selectedSession = watch("session") || initialSession;
  const selectedDay = watch("preferredDay") || initialPreferredDay;

  const onSubmit = async (data: EventRegistrationValues) => {
    try {
      const payload = {
        eventId: data.eventId,
        event_id: data.eventId,
        firstName: data.firstName.trim(),
        first_name: data.firstName.trim(),
        lastName: data.lastName.trim(),
        last_name: data.lastName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        attendanceMode: data.attendanceMode,
        attendance_mode: data.attendanceMode,
        session: data.session,
        preferredDay: data.preferredDay,
        preferred_day: data.preferredDay,
      };

      const res = await fetch(
        `${process.env.ADMI_API_URL}/events/${data.eventId}/reservations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Registration failed");
      }

      const attendeeFullName = `${data.firstName.trim()} ${data.lastName.trim()}`;
      setRegistrationData({
        name: attendeeFullName,
        attendanceMode: data.attendanceMode,
        session: data.session,
        preferredDay: data.preferredDay,
      });

      // Show celebratory badge dialog
      setShowBadgeDialog(true);

      toast.add({
        title: "Registration Successful!",
        description: `You are registered for ${eventTitle}. Customize and save your badge below!`,
        type: "success",
      });
    } catch (error) {
      console.error("Unable to submit event registration:", error);
      toast.add({
        title: "Something went wrong",
        description:
          error instanceof Error ? error.message : "Please try again later.",
        type: "error",
      });
    }
  };

  const handleRegisterAnother = () => {
    setRegistrationData(null);
    reset({
      eventId,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      attendanceMode: "in-person",
      session: initialSession,
      preferredDay: initialPreferredDay,
    });
  };

  const formatSessionLabel = (s: string) => {
    switch (s) {
      case "morning":
        return `Morning Session${morningTime ? ` (${morningTime})` : ""}`;
      case "evening":
        return `Evening Session${eveningTime ? ` (${eveningTime})` : ""}`;
      case "both":
      case "all":
        return "Both Sessions (Morning & Evening)";
      default:
        return s;
    }
  };

  return (
    <>
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>
            {registrationData ? "Registration Confirmed" : "Register for this Event"}
          </CardTitle>
          <CardDescription>
            {registrationData
              ? `You're all set! Get your personalized digital flyer badge to share.`
              : "Fill in your details below to secure your spot."}
          </CardDescription>
        </CardHeader>

        {registrationData ? (
          <CardContent className="space-y-4">
            {/* Confirmation Banner */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400">
              <div className="flex items-center gap-2 font-semibold">
                <IconCheck className="size-5 shrink-0" />
                <span>Spot Confirmed!</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-foreground/80">
                Registered as <strong>{registrationData.name}</strong> (
                {registrationData.attendanceMode === "online"
                  ? "Joining Online"
                  : "Attending in Person"}
                ).
              </p>
              {hasMultipleSessions && (
                <p className="mt-1 text-[11px] font-medium text-foreground/70">
                  Session: <strong>{formatSessionLabel(registrationData.session)}</strong>
                </p>
              )}
              {registrationData.preferredDay && (
                <p className="mt-0.5 text-[11px] font-medium text-foreground/70">
                  Schedule: <strong>{registrationData.preferredDay}</strong>
                </p>
              )}
            </div>

            {/* Launch Badge Generator Button */}
            <Button
              type="button"
              className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-base cursor-pointer"
              onClick={() => setShowBadgeDialog(true)}
            >
              <IconSparkles className="size-5 text-amber-300 animate-pulse" />
              <span>Create / View Your Badge</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full cursor-pointer text-xs"
              onClick={handleRegisterAnother}
            >
              Register Another Guest
            </Button>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent>
              <FieldGroup>
                {/* 1. Attendance Mode Selection */}
                <Field>
                  <FieldLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Attendance Option
                  </FieldLabel>
                  <div className="grid grid-cols-2 gap-2.5 mt-1">
                    {/* In-Person Option */}
                    <button
                      type="button"
                      onClick={() => setValue("attendanceMode", "in-person")}
                      className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedAttendanceMode === "in-person"
                          ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                          : "border-border hover:border-muted-foreground/30 bg-card"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                        <IconMapPin className="size-3.5 text-primary shrink-0" />
                        <span>In-Person</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground leading-tight">
                        Come to location
                      </span>
                    </button>

                    {/* Online Option */}
                    <button
                      type="button"
                      onClick={() => setValue("attendanceMode", "online")}
                      className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedAttendanceMode === "online"
                          ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                          : "border-border hover:border-muted-foreground/30 bg-card"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                        <IconVideo className="size-3.5 text-primary shrink-0" />
                        <span>Online</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground leading-tight">
                        Join stream live
                      </span>
                    </button>
                  </div>
                </Field>

                {/* 2. Session Selection (if dual morning & evening sessions) */}
                {hasMultipleSessions && (
                  <Field>
                    <FieldLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Session Choice
                    </FieldLabel>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {/* Morning Session */}
                      <button
                        type="button"
                        onClick={() => setValue("session", "morning")}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedSession === "morning"
                            ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30 text-amber-600 dark:text-amber-400"
                            : "border-border hover:border-muted-foreground/30 bg-card text-foreground"
                        }`}
                      >
                        <IconSun className="size-4 mb-1" />
                        <span className="text-xs font-semibold">Morning</span>
                        {morningTime && (
                          <span className="text-[9px] text-muted-foreground">
                            {morningTime}
                          </span>
                        )}
                      </button>

                      {/* Evening Session */}
                      <button
                        type="button"
                        onClick={() => setValue("session", "evening")}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedSession === "evening"
                            ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30 text-indigo-600 dark:text-indigo-400"
                            : "border-border hover:border-muted-foreground/30 bg-card text-foreground"
                        }`}
                      >
                        <IconMoon className="size-4 mb-1" />
                        <span className="text-xs font-semibold">Evening</span>
                        {eveningTime && (
                          <span className="text-[9px] text-muted-foreground">
                            {eveningTime}
                          </span>
                        )}
                      </button>

                      {/* Both Sessions */}
                      <button
                        type="button"
                        onClick={() => setValue("session", "both")}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedSession === "both" || selectedSession === "all"
                            ? "border-primary bg-primary/10 ring-2 ring-primary/30 text-primary"
                            : "border-border hover:border-muted-foreground/30 bg-card text-foreground"
                        }`}
                      >
                        <IconSparkles className="size-4 mb-1" />
                        <span className="text-xs font-semibold">Both</span>
                        <span className="text-[9px] text-muted-foreground">
                          All Day
                        </span>
                      </button>
                    </div>
                  </Field>
                )}

                {/* 3. Recurring Event Day Selection (e.g. Every Tuesday, Sunday, Wednesday) */}
                {isRecurring && recurringDays && recurringDays.length > 0 && (
                  <Field>
                    <FieldLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <IconRepeat className="size-3.5 text-primary" />
                      Recurring Attendance Days
                    </FieldLabel>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <button
                        type="button"
                        onClick={() => setValue("preferredDay", "All Scheduled Days")}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                          selectedDay === "All Scheduled Days" || !selectedDay
                            ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                            : "border-border hover:border-muted-foreground/30 bg-card text-muted-foreground"
                        }`}
                      >
                        All Days ({recurringDays.join(", ")})
                      </button>
                      {recurringDays.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setValue("preferredDay", `Every ${day}`)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                            selectedDay === `Every ${day}`
                              ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                              : "border-border hover:border-muted-foreground/30 bg-card text-muted-foreground"
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </Field>
                )}

                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                {/* Email Field */}
                <Field>
                  <FieldLabel>Email Address</FieldLabel>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <FieldError>{errors.email.message}</FieldError>
                  )}
                </Field>

                {/* Phone Field */}
                <Field>
                  <FieldLabel>Phone Number</FieldLabel>
                  <Input
                    type="tel"
                    placeholder="+234 ..."
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <FieldError>{errors.phone.message}</FieldError>
                  )}
                </Field>

                <Button
                  type="submit"
                  className="w-full mt-2 cursor-pointer font-semibold py-5"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Registering..." : "Register Now"}
                </Button>
              </FieldGroup>
            </CardContent>
          </form>
        )}
      </Card>

      {/* Attendee Badge Dialog */}
      <AttendeeBadgeDialog
        open={showBadgeDialog}
        onOpenChange={setShowBadgeDialog}
        attendeeName={registrationData?.name || "Guest Attendee"}
        eventTitle={eventTitle}
        eventDate={eventDate}
        eventLocation={eventLocation}
        badgeTemplateImage={badgeImage}
        eventImage={eventImage}
        attendanceMode={registrationData?.attendanceMode || "in-person"}
        session={registrationData?.session}
        preferredDay={registrationData?.preferredDay}
      />
    </>
  );
}
