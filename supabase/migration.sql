-- Migration script to update job_category_defaults table structure

-- First, create a backup of the existing table
CREATE TABLE IF NOT EXISTS job_category_defaults_backup AS 
SELECT * FROM job_category_defaults;

-- Drop existing table
DROP TABLE IF EXISTS job_category_defaults CASCADE;

-- Recreate the table with the new structure
CREATE TABLE IF NOT EXISTS job_category_defaults (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  item_type TEXT,
  from_building_id TEXT,
  from_location_id TEXT,
  to_building_id TEXT,
  to_location_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_building_id) REFERENCES buildings(id) ON DELETE CASCADE,
  FOREIGN KEY (from_location_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (to_building_id) REFERENCES buildings(id) ON DELETE CASCADE,
  FOREIGN KEY (to_location_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- Migrate data from backup table to the new structure
INSERT INTO job_category_defaults (id, category, item_type, to_building_id, to_location_id, created_at)
SELECT id, category, item_type, building_id, location_id, created_at 
FROM job_category_defaults_backup;

-- Drop backup table when migration is successful
-- Uncomment this when you've verified the migration worked correctly
-- DROP TABLE job_category_defaults_backup;

-- Report completion
SELECT 'Job category defaults migration completed successfully' as result;
