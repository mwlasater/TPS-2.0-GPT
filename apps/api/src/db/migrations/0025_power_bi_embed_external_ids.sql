ALTER TABLE shared.power_bi_embed
ADD COLUMN IF NOT EXISTS workspace_id TEXT;

ALTER TABLE shared.power_bi_embed
ADD COLUMN IF NOT EXISTS external_report_id TEXT;
