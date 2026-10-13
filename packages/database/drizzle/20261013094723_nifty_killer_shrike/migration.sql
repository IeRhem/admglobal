CREATE TYPE "contact_for" AS ENUM('general', 'prayer', 'counseling');--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "badge_image" text;--> statement-breakpoint
ALTER TABLE "reservation" ADD COLUMN "attendance_mode" varchar(50) DEFAULT 'in-person' NOT NULL;--> statement-breakpoint
ALTER TABLE "reservation" ADD COLUMN "badge_photo" text;