ALTER TABLE "contact" ADD COLUMN "last_name" varchar(256);--> statement-breakpoint
ALTER TABLE "reservation" ADD COLUMN "last_name" varchar(256);--> statement-breakpoint
ALTER TABLE "testimonial" ADD COLUMN "first_name" varchar(256);--> statement-breakpoint
ALTER TABLE "testimonial" ADD COLUMN "last_name" varchar(256);--> statement-breakpoint
ALTER TABLE "contact" DROP COLUMN "second_name";--> statement-breakpoint
ALTER TABLE "reservation" DROP COLUMN "second_name";--> statement-breakpoint
ALTER TABLE "testimonial" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "id" SET DATA TYPE integer USING "id"::integer;--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "event_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "flyer" ALTER COLUMN "id" SET DATA TYPE integer USING "id"::integer;--> statement-breakpoint
ALTER TABLE "flyer" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "flyer_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "flyer" ALTER COLUMN "event_id" SET DATA TYPE integer USING "event_id"::integer;--> statement-breakpoint
ALTER TABLE "reservation" ALTER COLUMN "id" SET DATA TYPE integer USING "id"::integer;--> statement-breakpoint
ALTER TABLE "reservation" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "reservation_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "reservation" ALTER COLUMN "event_id" SET DATA TYPE integer USING "event_id"::integer;--> statement-breakpoint
ALTER TABLE "reservation" ALTER COLUMN "first_name" SET DATA TYPE varchar(256) USING "first_name"::varchar(256);--> statement-breakpoint
ALTER TABLE "reservation" ALTER COLUMN "first_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "testimonial" ALTER COLUMN "id" SET DATA TYPE integer USING "id"::integer;--> statement-breakpoint
ALTER TABLE "testimonial" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "testimonial_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "testimonial_image" ALTER COLUMN "id" SET DATA TYPE integer USING "id"::integer;--> statement-breakpoint
ALTER TABLE "testimonial_image" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "testimonial_image_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "testimonial_image" ALTER COLUMN "testimonial_id" SET DATA TYPE integer USING "testimonial_id"::integer;--> statement-breakpoint
ALTER TABLE "contact" ALTER COLUMN "id" SET DATA TYPE integer USING "id"::integer;--> statement-breakpoint
ALTER TABLE "contact" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "contact_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "contact" ALTER COLUMN "first_name" SET DATA TYPE varchar(256) USING "first_name"::varchar(256);--> statement-breakpoint
ALTER TABLE "contact" ALTER COLUMN "first_name" DROP NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "email_idx" ON "reservation" ("email");