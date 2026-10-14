CREATE TYPE "contact_for" AS ENUM('general', 'prayer', 'counseling');--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "badge_image" text;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "is_recurring" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "recurring_days" jsonb DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "has_morning_session" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "morning_time" varchar(50);--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "has_evening_session" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "evening_time" varchar(50);--> statement-breakpoint
ALTER TABLE "reservation" ADD COLUMN "attendance_mode" varchar(50) DEFAULT 'in-person' NOT NULL;--> statement-breakpoint
ALTER TABLE "reservation" ADD COLUMN "session" varchar(50) DEFAULT 'both' NOT NULL;--> statement-breakpoint
ALTER TABLE "reservation" ADD COLUMN "preferred_day" varchar(100);--> statement-breakpoint
ALTER TABLE "reservation" ADD COLUMN "badge_photo" text;--> statement-breakpoint
ALTER TABLE "flyer" DROP CONSTRAINT IF EXISTS "flyer_event_id_event_id_fkey";--> statement-breakpoint
ALTER TABLE "reservation" DROP CONSTRAINT IF EXISTS "reservation_event_id_event_id_fkey";--> statement-breakpoint
ALTER TABLE "event_minister" DROP CONSTRAINT IF EXISTS "event_minister_event_id_event_id_fkey";--> statement-breakpoint
ALTER TABLE "event_minister" DROP CONSTRAINT IF EXISTS "event_minister_minister_id_minister_id_fkey";--> statement-breakpoint
ALTER TABLE "testimonial_image" DROP CONSTRAINT IF EXISTS "testimonial_image_testimonial_id_testimonial_id_fkey";--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN "uuid_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "uuid_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "minister" ADD COLUMN "uuid_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "testimonial" ADD COLUMN "uuid_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "flyer" ADD COLUMN "uuid_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "flyer" ADD COLUMN "uuid_event_id" uuid;--> statement-breakpoint
UPDATE "flyer" f SET "uuid_event_id" = e."uuid_id" FROM "event" e WHERE f."event_id"::text = e."id"::text;--> statement-breakpoint
DELETE FROM "flyer" WHERE "uuid_event_id" IS NULL;--> statement-breakpoint
ALTER TABLE "flyer" ALTER COLUMN "uuid_event_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reservation" ADD COLUMN "uuid_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "reservation" ADD COLUMN "uuid_event_id" uuid;--> statement-breakpoint
UPDATE "reservation" r SET "uuid_event_id" = e."uuid_id" FROM "event" e WHERE r."event_id"::text = e."id"::text;--> statement-breakpoint
DELETE FROM "reservation" WHERE "uuid_event_id" IS NULL;--> statement-breakpoint
ALTER TABLE "reservation" ALTER COLUMN "uuid_event_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "event_minister" ADD COLUMN "uuid_event_id" uuid;--> statement-breakpoint
ALTER TABLE "event_minister" ADD COLUMN "uuid_minister_id" uuid;--> statement-breakpoint
UPDATE "event_minister" em SET "uuid_event_id" = e."uuid_id" FROM "event" e WHERE em."event_id"::text = e."id"::text;--> statement-breakpoint
UPDATE "event_minister" em SET "uuid_minister_id" = m."uuid_id" FROM "minister" m WHERE em."minister_id"::text = m."id"::text;--> statement-breakpoint
DELETE FROM "event_minister" WHERE "uuid_event_id" IS NULL OR "uuid_minister_id" IS NULL;--> statement-breakpoint
ALTER TABLE "event_minister" ALTER COLUMN "uuid_event_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "event_minister" ALTER COLUMN "uuid_minister_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "testimonial_image" ADD COLUMN "uuid_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "testimonial_image" ADD COLUMN "uuid_testimonial_id" uuid;--> statement-breakpoint
UPDATE "testimonial_image" ti SET "uuid_testimonial_id" = t."uuid_id" FROM "testimonial" t WHERE ti."testimonial_id"::text = t."id"::text;--> statement-breakpoint
DELETE FROM "testimonial_image" WHERE "uuid_testimonial_id" IS NULL;--> statement-breakpoint
ALTER TABLE "testimonial_image" ALTER COLUMN "uuid_testimonial_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "event_minister" DROP CONSTRAINT IF EXISTS "event_minister_pkey";--> statement-breakpoint
ALTER TABLE "flyer" DROP CONSTRAINT IF EXISTS "flyer_pkey";--> statement-breakpoint
ALTER TABLE "reservation" DROP CONSTRAINT IF EXISTS "reservation_pkey";--> statement-breakpoint
ALTER TABLE "testimonial_image" DROP CONSTRAINT IF EXISTS "testimonial_image_pkey";--> statement-breakpoint
ALTER TABLE "event" DROP CONSTRAINT IF EXISTS "event_pkey";--> statement-breakpoint
ALTER TABLE "minister" DROP CONSTRAINT IF EXISTS "minister_pkey";--> statement-breakpoint
ALTER TABLE "testimonial" DROP CONSTRAINT IF EXISTS "testimonial_pkey";--> statement-breakpoint
ALTER TABLE "contact" DROP CONSTRAINT IF EXISTS "contact_pkey";--> statement-breakpoint
ALTER TABLE "contact" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "contact" RENAME COLUMN "uuid_id" TO "id";--> statement-breakpoint
ALTER TABLE "contact" ADD CONSTRAINT "contact_pkey" PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "event" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "event" RENAME COLUMN "uuid_id" TO "id";--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_pkey" PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "minister" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "minister" RENAME COLUMN "uuid_id" TO "id";--> statement-breakpoint
ALTER TABLE "minister" ADD CONSTRAINT "minister_pkey" PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "testimonial" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "testimonial" RENAME COLUMN "uuid_id" TO "id";--> statement-breakpoint
ALTER TABLE "testimonial" ADD CONSTRAINT "testimonial_pkey" PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "flyer" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "flyer" RENAME COLUMN "uuid_id" TO "id";--> statement-breakpoint
ALTER TABLE "flyer" DROP COLUMN "event_id";--> statement-breakpoint
ALTER TABLE "flyer" RENAME COLUMN "uuid_event_id" TO "event_id";--> statement-breakpoint
ALTER TABLE "flyer" ADD CONSTRAINT "flyer_pkey" PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "reservation" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "reservation" RENAME COLUMN "uuid_id" TO "id";--> statement-breakpoint
ALTER TABLE "reservation" DROP COLUMN "event_id";--> statement-breakpoint
ALTER TABLE "reservation" RENAME COLUMN "uuid_event_id" TO "event_id";--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_pkey" PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "event_minister" DROP COLUMN "event_id";--> statement-breakpoint
ALTER TABLE "event_minister" RENAME COLUMN "uuid_event_id" TO "event_id";--> statement-breakpoint
ALTER TABLE "event_minister" DROP COLUMN "minister_id";--> statement-breakpoint
ALTER TABLE "event_minister" RENAME COLUMN "uuid_minister_id" TO "minister_id";--> statement-breakpoint
ALTER TABLE "event_minister" ADD CONSTRAINT "event_minister_pkey" PRIMARY KEY ("event_id", "minister_id");--> statement-breakpoint
ALTER TABLE "testimonial_image" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "testimonial_image" RENAME COLUMN "uuid_id" TO "id";--> statement-breakpoint
ALTER TABLE "testimonial_image" DROP COLUMN "testimonial_id";--> statement-breakpoint
ALTER TABLE "testimonial_image" RENAME COLUMN "uuid_testimonial_id" TO "testimonial_id";--> statement-breakpoint
ALTER TABLE "testimonial_image" ADD CONSTRAINT "testimonial_image_pkey" PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "flyer" ADD CONSTRAINT "flyer_event_id_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_event_id_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_minister" ADD CONSTRAINT "event_minister_event_id_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_minister" ADD CONSTRAINT "event_minister_minister_id_minister_id_fkey" FOREIGN KEY ("minister_id") REFERENCES "minister"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonial_image" ADD CONSTRAINT "testimonial_image_testimonial_id_testimonial_id_fkey" FOREIGN KEY ("testimonial_id") REFERENCES "testimonial"("id") ON DELETE no action ON UPDATE no action;