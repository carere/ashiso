CREATE TABLE `candles` (
	`time` integer NOT NULL,
	`open` real NOT NULL,
	`close` real NOT NULL,
	`high` real NOT NULL,
	`low` real NOT NULL,
	`volume` real NOT NULL,
	`closed` integer DEFAULT true,
	`trades` integer DEFAULT 0,
	`candles_id` text NOT NULL,
	PRIMARY KEY(`candles_id`, `time`)
);
