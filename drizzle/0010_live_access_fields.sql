ALTER TABLE "leads" ADD COLUMN "client_type" varchar(20);
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "live_access_code" varchar(12);
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "live_registered_at" timestamp;
