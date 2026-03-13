ALTER TABLE shared.fare_enforcement
ADD COLUMN IF NOT EXISTS amtrak_transfers INTEGER NOT NULL DEFAULT 0;

ALTER TABLE shared.fare_enforcement
ADD COLUMN IF NOT EXISTS amtrak_tickets INTEGER NOT NULL DEFAULT 0;

ALTER TABLE shared.fare_enforcement
ADD COLUMN IF NOT EXISTS upass_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE shared.fare_enforcement
ADD COLUMN IF NOT EXISTS tickets_sold INTEGER NOT NULL DEFAULT 0;
