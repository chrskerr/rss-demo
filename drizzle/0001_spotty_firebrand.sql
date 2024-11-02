ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_username_feed_id_unique";--> statement-breakpoint
ALTER TABLE "feeds" ALTER COLUMN "url" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "feeds" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "username_feed_id_unique" UNIQUE("username","feed_id");