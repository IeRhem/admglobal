CREATE TABLE "event_minister" (
	"event_id" integer,
	"minister_id" integer,
	CONSTRAINT "event_minister_pkey" PRIMARY KEY("event_id","minister_id")
);
--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "location" varchar(256);--> statement-breakpoint
ALTER TABLE "event_minister" ADD CONSTRAINT "event_minister_event_id_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id");--> statement-breakpoint
ALTER TABLE "event_minister" ADD CONSTRAINT "event_minister_minister_id_minister_id_fkey" FOREIGN KEY ("minister_id") REFERENCES "minister"("id");