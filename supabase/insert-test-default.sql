-- Insert a test default location for the Patient Transfer category
INSERT INTO job_category_defaults (id, category, item_type, from_building_id, from_location_id, to_building_id, to_location_id)
VALUES (
  'test-default-location',
  'Patient Transfer',
  'Wheelchair',
  'main',
  'amu',
  'east',
  'oncology'
);
