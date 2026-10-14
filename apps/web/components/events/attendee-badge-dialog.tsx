"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { AttendeeBadgeGenerator } from "./attendee-badge-generator";

interface AttendeeBadgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendeeName: string;
  eventTitle: string;
  eventDate?: string;
  eventLocation?: string;
  badgeTemplateImage?: string | null;
  eventImage?: string | null;
  attendanceMode?: "in-person" | "online";
  session?: "morning" | "evening" | "both" | "all" | string;
  preferredDay?: string;
}

export function AttendeeBadgeDialog({
  open,
  onOpenChange,
  attendeeName,
  eventTitle,
  eventDate,
  eventLocation,
  badgeTemplateImage,
  eventImage,
  attendanceMode,
  session,
  preferredDay,
}: AttendeeBadgeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="p-0 border-none bg-transparent shadow-none max-w-lg sm:max-w-md w-full"
      >
        <DialogTitle className="sr-only">
          Generate Attendee Badge for {eventTitle}
        </DialogTitle>
        <AttendeeBadgeGenerator
          initialName={attendeeName}
          eventTitle={eventTitle}
          eventDate={eventDate}
          eventLocation={eventLocation}
          badgeTemplateImage={badgeTemplateImage}
          eventImage={eventImage}
          attendanceMode={attendanceMode}
          session={session}
          preferredDay={preferredDay}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
