ALTER TABLE `users` MODIFY COLUMN `updatedAt` timestamp NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionPlan` varchar(20) DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `analysisCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `analysisResetDate` timestamp DEFAULT (now()) NOT NULL;