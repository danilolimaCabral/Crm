ALTER TABLE `users` MODIFY COLUMN `subscriptionPlan` enum('none','free','pro','premium') NOT NULL DEFAULT 'none';--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` enum('active','inactive','cancelled') DEFAULT 'inactive' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `analysesCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `analysesResetDate` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `analysisCount`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `analysisResetDate`;