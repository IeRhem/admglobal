CREATE TABLE "activity_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"actor_user_id" text,
	"actor_name" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "branch_role" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"pages" jsonb DEFAULT '[]' NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "branch_staff" (
	"branch_id" uuid,
	"user_id" text,
	"role_id" uuid NOT NULL,
	"assigned_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "branch_staff_pkey" PRIMARY KEY("branch_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "church_branch" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"location" text,
	"state" text NOT NULL,
	"country" text NOT NULL,
	"city" text NOT NULL,
	"address" text NOT NULL,
	"google_maps_url" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "activity_log_created_at_idx" ON "activity_log" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "branch_role_name_unique" ON "branch_role" ("name");--> statement-breakpoint
CREATE INDEX "branch_staff_user_idx" ON "branch_staff" ("user_id");--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_actor_user_id_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "branch_role" ADD CONSTRAINT "branch_role_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "branch_staff" ADD CONSTRAINT "branch_staff_branch_id_church_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "church_branch"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "branch_staff" ADD CONSTRAINT "branch_staff_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "branch_staff" ADD CONSTRAINT "branch_staff_role_id_branch_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "branch_role"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "branch_staff" ADD CONSTRAINT "branch_staff_assigned_by_user_id_fkey" FOREIGN KEY ("assigned_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "church_branch" ADD CONSTRAINT "church_branch_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL;