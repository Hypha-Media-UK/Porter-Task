-- Seed data for the Porter Task Application

-- Clear existing data
DELETE FROM tasks;
DELETE FROM porter_assignments;
DELETE FROM shift_assigned_porters;
DELETE FROM shifts;
DELETE FROM job_category_defaults;
DELETE FROM job_categories;
DELETE FROM departments;
DELETE FROM buildings;
DELETE FROM designation_departments;
DELETE FROM porters;
DELETE FROM supervisors;

-- Insert supervisors
INSERT INTO supervisors (id, name) VALUES
  ('b1bdb778-5c9d-4d5c-a20f-99c8b437abbb', 'John Doe'),
  ('e7cc33c5-0cb0-4166-b85b-12eba481ad8c', 'Jane Smith'),
  ('7af51b3a-9726-4e3c-b9e8-29967f11e5ac', 'Mike Johnson');

-- Insert porters
INSERT INTO porters (id, name) VALUES
  ('1d2cd4ef-2c7f-45dd-9abb-932a90f1a16b', 'Alex Porter'),
  ('c9f75fe8-0d57-4e5f-a7b7-6ef2e914e41b', 'Sarah Porter'),
  ('8bcf0df1-1c84-4f1c-b1c5-b0dc2dec7b70', 'Mike Handler'),
  ('5c932c40-95d4-43f1-b3e3-2ca07b678e4e', 'Emma Rodriguez'),
  ('7db310e9-1f1d-4f45-a3d1-c6a3d02fdd76', 'Chris Taylor'),
  ('9e1d9e77-356a-4a25-a658-4777a55ef1db', 'Jamie Wilson');

-- Insert buildings
INSERT INTO buildings (id, name) VALUES
  ('ae2d59c6-fbf4-4bc4-9a52-b77d2c12f986', 'Main Hospital'),
  ('68a1ea73-9800-43fb-93c7-429b2f4d10c0', 'New Fountain House'),
  ('03b0b1b0-5e34-4fea-a2b2-9b8829d928d2', 'Emergency Wing'),
  ('f58e9c5e-7d5d-4c43-a0eb-93eaf394b635', 'Research Block');

-- Insert departments
INSERT INTO departments (id, building_id, name, frequent) VALUES
  -- Main Hospital
  ('f3c7b9e3-3c1a-4d1a-a7b7-6efae9140e1b', 'ae2d59c6-fbf4-4bc4-9a52-b77d2c12f986', 'Accident and Emergency', true),
  ('aa1b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'ae2d59c6-fbf4-4bc4-9a52-b77d2c12f986', 'Outpatients', true),
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'ae2d59c6-fbf4-4bc4-9a52-b77d2c12f986', 'Cardiology', false),
  ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'ae2d59c6-fbf4-4bc4-9a52-b77d2c12f986', 'Neurology', false),
  ('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'ae2d59c6-fbf4-4bc4-9a52-b77d2c12f986', 'Medical Records', false),

  -- New Fountain House
  ('e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', '68a1ea73-9800-43fb-93c7-429b2f4d10c0', 'Pathology', true),
  ('f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c', '68a1ea73-9800-43fb-93c7-429b2f4d10c0', 'Pharmacy', false),
  ('a7b8c9d0-e1f2-3a4b-5c6d-7e8f9a0b1c2d', '68a1ea73-9800-43fb-93c7-429b2f4d10c0', 'Administration', false),

  -- Emergency Wing
  ('b8c9d0e1-f2a3-4b5c-6d7e-8f9a0b1c2d3e', '03b0b1b0-5e34-4fea-a2b2-9b8829d928d2', 'Resuscitation', true),
  ('c9d0e1f2-a3b4-5c6d-7e8f-9a0b1c2d3e4f', '03b0b1b0-5e34-4fea-a2b2-9b8829d928d2', 'Trauma', true),
  ('d0e1f2a3-b4c5-6d7e-8f9a-0b1c2d3e4f5a', '03b0b1b0-5e34-4fea-a2b2-9b8829d928d2', 'Triage', false),

  -- Research Block
  ('e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b', 'f58e9c5e-7d5d-4c43-a0eb-93eaf394b635', 'Labs', false),
  ('f2a3b4c5-d6e7-8f9a-0b1c-2d3e4f5a6b7c', 'f58e9c5e-7d5d-4c43-a0eb-93eaf394b635', 'Clinical Trials', false);

-- Insert designation departments (for porter assignments)
INSERT INTO designation_departments (id, name, color) VALUES
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Emergency Room', '#FF5252'),
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Reception', '#4CAF50'),
  ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Operating Theaters', '#2196F3'),
  ('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'Radiology', '#FF9800'),
  ('e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'Pathology', '#9C27B0');

-- Insert job categories and item types
INSERT INTO job_categories (id, category, item_type) VALUES
  -- Patient Transport
  ('a0b1c2d3-e4f5-6a7b-8c9d-0e1f2a3b4c5d', 'Patient Transport', 'Wheelchair'),
  ('b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e', 'Patient Transport', 'Stretcher'),
  ('c2d3e4f5-a6b7-8c9d-0e1f-2a3b4c5d6e7f', 'Patient Transport', 'Bed'),
  
  -- Specimen Delivery
  ('d3e4f5a6-b7c8-9d0e-1f2a-3b4c5d6e7f8a', 'Specimen Delivery', 'Blood Sample'),
  ('e4f5a6b7-c8d9-0e1f-2a3b-4c5d6e7f8a9b', 'Specimen Delivery', 'Urine Sample'),
  ('f5a6b7c8-d9e0-1f2a-3b4c-5d6e7f8a9b0c', 'Specimen Delivery', 'Other Specimen'),
  
  -- Equipment
  ('a6b7c8d9-e0f1-2a3b-4c5d-6e7f8a9b0c1d', 'Equipment', 'Oxygen Cylinder'),
  ('b7c8d9e0-f1a2-3b4c-5d6e-7f8a9b0c1d2e', 'Equipment', 'IV Stand'),
  ('c8d9e0f1-a2b3-4c5d-6e7f-8a9b0c1d2e3f', 'Equipment', 'Monitor'),
  ('d9e0f1a2-b3c4-5d6e-7f8a-9b0c1d2e3f4a', 'Equipment', 'Other'),
  
  -- General
  ('e0f1a2b3-c4d5-6e7f-8a9b-0c1d2e3f4a5b', 'General', 'Generic Task');

-- Insert job category defaults
INSERT INTO job_category_defaults (category, item_type, from_building_id, from_location_id, to_building_id, to_location_id) VALUES
  ('Patient Transport', 'Wheelchair', 'ae2d59c6-fbf4-4bc4-9a52-b77d2c12f986', 'f3c7b9e3-3c1a-4d1a-a7b7-6efae9140e1b', NULL, NULL),
  ('Specimen Delivery', 'Blood Sample', NULL, NULL, '68a1ea73-9800-43fb-93c7-429b2f4d10c0', 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b');

-- Create a sample shift with tasks and porter assignments
-- First, create the shift
INSERT INTO shifts (id, date, type, supervisor, start_time, end_time) VALUES
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', CURRENT_DATE - 1, 'Day', 'John Doe', 
   NOW() - INTERVAL '24 hours', NOW() - INTERVAL '12 hours');

-- Assign porters to the shift
INSERT INTO shift_assigned_porters (shift_id, porter_id) VALUES
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Alex Porter'),
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Sarah Porter'),
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Mike Handler');

-- Create porter department assignments
INSERT INTO porter_assignments (shift_id, porter_id, department_id, start_time, end_time) VALUES
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Alex Porter', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 
   NOW() - INTERVAL '23 hours', NOW() - INTERVAL '19 hours'),
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Sarah Porter', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 
   NOW() - INTERVAL '22 hours', NOW() - INTERVAL '18 hours');

-- Create tasks for the shift
INSERT INTO tasks (
  shift_id, received_time, allocated_time, completed_time, status, 
  job_category, item_type, allocated_staff, 
  from_building, from_location_id, to_building, to_location_id
) VALUES
  -- Completed wheelchair task
  (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 
    NOW() - INTERVAL '23 hours', 
    NOW() - INTERVAL '22.9 hours', 
    NOW() - INTERVAL '22.5 hours', 
    'Completed',
    'Patient Transport', 'Wheelchair', 'Alex Porter',
    'ae2d59c6-fbf4-4bc4-9a52-b77d2c12f986', 'f3c7b9e3-3c1a-4d1a-a7b7-6efae9140e1b',
    'ae2d59c6-fbf4-4bc4-9a52-b77d2c12f986', 'aa1b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d'
  ),
  
  -- Completed specimen delivery task
  (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 
    NOW() - INTERVAL '21 hours', 
    NOW() - INTERVAL '20.9 hours', 
    NOW() - INTERVAL '20.5 hours', 
    'Completed',
    'Specimen Delivery', 'Blood Sample', 'Sarah Porter',
    'ae2d59c6-fbf4-4bc4-9a52-b77d2c12f986', 'f3c7b9e3-3c1a-4d1a-a7b7-6efae9140e1b',
    '68a1ea73-9800-43fb-93c7-429b2f4d10c0', 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b'
  ),
  
  -- Pending equipment task
  (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 
    NOW() - INTERVAL '18 hours', 
    NOW() - INTERVAL '17.9 hours', 
    NULL, 
    'Pending',
    'Equipment', 'Oxygen Cylinder', 'Mike Handler',
    'f58e9c5e-7d5d-4c43-a0eb-93eaf394b635', 'e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b',
    'ae2d59c6-fbf4-4bc4-9a52-b77d2c12f986', 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f'
  );
