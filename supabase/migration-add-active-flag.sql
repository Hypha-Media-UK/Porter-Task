-- Add is_active column to shifts table
ALTER TABLE shifts ADD COLUMN is_active BOOLEAN DEFAULT FALSE;

-- Create a trigger to ensure only one shift can be active at a time
CREATE OR REPLACE FUNCTION ensure_single_active_shift()
RETURNS TRIGGER AS $$
BEGIN
  -- If we're setting a shift to active
  IF NEW.is_active = TRUE THEN
    -- Set all other shifts to inactive
    UPDATE shifts SET is_active = FALSE WHERE id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on the shifts table
DROP TRIGGER IF EXISTS ensure_one_active_shift_trigger ON shifts;
CREATE TRIGGER ensure_one_active_shift_trigger
BEFORE INSERT OR UPDATE OF is_active ON shifts
FOR EACH ROW
WHEN (NEW.is_active = TRUE)
EXECUTE FUNCTION ensure_single_active_shift();

-- Update existing shifts to ensure the active status is correct
-- Set any shift without an end_time to active, but only the most recent one
UPDATE shifts
SET is_active = TRUE
WHERE id = (
  SELECT id FROM shifts 
  WHERE end_time IS NULL 
  ORDER BY start_time DESC 
  LIMIT 1
);
