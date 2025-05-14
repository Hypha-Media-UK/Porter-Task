-- Insert a test default location for Specimen Delivery to Pathology
INSERT INTO job_category_defaults (id, category, item_type, from_building_id, from_location_id, to_building_id, to_location_id)
VALUES (
  'default-specimen-delivery',
  'Specimen Delivery',  -- Category
  NULL,                 -- NULL for all item types in this category
  NULL,                 -- No specific from location
  NULL,
  'main',               -- To Building ID
  'pathology'           -- To Location ID
);
