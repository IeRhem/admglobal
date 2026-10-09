CREATE TABLE "youtube_video" (
	"video_id" text PRIMARY KEY,
	"title" text NOT NULL,
	"link" text NOT NULL,
	"time_length" text NOT NULL,
	"date_posted" date NOT NULL,
	"featured_img" text NOT NULL,
	"position" integer NOT NULL
);
