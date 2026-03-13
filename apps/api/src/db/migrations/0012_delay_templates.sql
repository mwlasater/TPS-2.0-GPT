CREATE TABLE IF NOT EXISTS shared.delay_template (
  id TEXT NOT NULL,
  railroad_code TEXT NOT NULL,
  template_name TEXT NOT NULL,
  category TEXT NOT NULL,
  minutes INTEGER NOT NULL,
  notes TEXT NOT NULL,
  notable_delay_type TEXT NOT NULL,
  special_movement_id TEXT,
  PRIMARY KEY (railroad_code, id),
  CONSTRAINT delay_template_minutes_nonnegative CHECK (minutes >= 0)
);

CREATE INDEX IF NOT EXISTS delay_template_railroad_idx
  ON shared.delay_template (railroad_code, template_name);
