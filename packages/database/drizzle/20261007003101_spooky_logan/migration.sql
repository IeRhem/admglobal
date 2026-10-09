CREATE TYPE "flyer_enum" AS ENUM('mobile', 'desktop');--> statement-breakpoint
CREATE TABLE "minister" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "minister_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"first_name" varchar(256),
	"last_name" varchar(256),
	"title" varchar(256),
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN "attended_to" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "flyer" ADD COLUMN "type" "flyer_enum" NOT NULL;--> statement-breakpoint
ALTER TABLE "testimonial" ADD COLUMN "email" text;