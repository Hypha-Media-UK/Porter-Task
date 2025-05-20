-- Enhanced Seed Data for Porter Task Application
-- This seed file focuses on providing comprehensive test data for task management

-- Clear existing data
TRUNCATE TABLE tasks CASCADE;
TRUNCATE TABLE porter_assignments CASCADE;
TRUNCATE TABLE shift_assigned_porters CASCADE;
TRUNCATE TABLE shifts CASCADE;
TRUNCATE TABLE job_category_defaults CASCADE;
TRUNCATE TABLE job_categories CASCADE;
TRUNCATE TABLE departments CASCADE;
TRUNCATE TABLE buildings CASCADE;
TRUNCATE TABLE designation_departments CASCADE;
TRUNCATE TABLE porters CASCADE;
TRUNCATE TABLE supervisors CASCADE;

-- Insert supervisors with realistic hospital names
INSERT INTO supervisors (id, name, active) VALUES
  ('b5d1209e-e0d7-4803-9524-a3b0837ac10d', 'Dr. Sarah Williams', true),
  ('e8c20b37-5cd8-47f8-8660-0b0f37c4fa4a', 'Dr. James Thompson', true),
  ('c4a97123-dfb3-4c17-8a65-6c3e7a839af7', 'Dr. Emily Chen', true),
  ('f3a8d60b-1e26-4b62-9589-8e7f2cd1c6d2', 'Nurse Manager Robert Davis', true),
  ('a2d3e4f5-6a7b-8c9d-0e1f-2a3b4c5d6e7f', 'Nurse Manager Patricia Wilson', true);

-- Insert porters with realistic names
INSERT INTO porters (id, name, active) VALUES
  ('75e2c4a1-8d96-4f35-b67a-2c4d8e9f10a1', 'Thomas Johnson', true),
  ('b3f8a7c6-5d4e-3f2a-1b0c-9d8e7f6a5b4c', 'Maria Garcia', true),
  ('c2d3e4f5-6a7b-8c9d-0e1f-2a3b4c5d6e7f', 'Daniel Smith', true),
  ('d1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a', 'Sophia Lee', true),
  ('e0f1a2b3-c4d5-6e7f-8a9b-0c1d2e3f4a5b', 'William Brown', true),
  ('f9e8d7c6-b5a4-3210-9f8e-7d6c5b4a3210', 'Olivia Martinez', true),
  ('1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'James Wilson', true),
  ('2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'Ava Taylor', true);

-- Insert buildings with clear hospital structure
INSERT INTO buildings (id, name, active) VALUES
  ('a147d7b3-5c92-48b0-9b9d-e5b0f69d79a3', 'Main Hospital Tower', true),
  ('b238e8c4-6d03-59c1-0c0e-f6c1f70e80b4', 'Emergency Services Building', true),
  ('c329f9d5-7e14-60d2-1d1f-a7d2a81f91c5', 'Outpatient Clinic', true),
  ('d410a0e6-8f25-71e3-2e2a-b8e3b92a02d6', 'Research & Diagnostics Center', true);

-- Insert departments
INSERT INTO departments (id, building_id, name, frequent) VALUES
  -- Main Hospital Tower
  ('aa11bb22-cc33-dd44-ee55-ff6677889900', 'a147d7b3-5c92-48b0-9b9d-e5b0f69d79a3', 'General Ward A', true),
  ('bb22cc33-dd44-ee55-ff66-778899001122', 'a147d7b3-5c92-48b0-9b9d-e5b0f69d79a3', 'General Ward B', true),
  ('cc33dd44-ee55-ff66-7788-99001122aa11', 'a147d7b3-5c92-48b0-9b9d-e5b0f69d79a3', 'Surgical Ward', true),
  ('dd44ee55-ff66-7788-9900-1122aa11bb22', 'a147d7b3-5c92-48b0-9b9d-e5b0f69d79a3', 'Intensive Care Unit', true),
  ('ee55ff66-7788-9900-1122-aa11bb22cc33', 'a147d7b3-5c92-48b0-9b9d-e5b0f69d79a3', 'Pediatric Ward', true),
  ('ff667788-9900-1122-aa11-bb22cc33dd44', 'a147d7b3-5c92-48b0-9b9d-e5b0f69d79a3', 'Maternity Ward', false),
  ('11223344-5566-7788-9900-aabbccddeeff', 'a147d7b3-5c92-48b0-9b9d-e5b0f69d79a3', 'Neurology Ward', false),
  ('22334455-6677-8899-00aa-bbccddeeff11', 'a147d7b3-5c92-48b0-9b9d-e5b0f69d79a3', 'Cardiology Ward', false),
  
  -- Emergency Services Building
  ('33445566-7788-9900-aabb-ccddeeff1122', 'b238e8c4-6d03-59c1-0c0e-f6c1f70e80b4', 'Emergency Room', true),
  ('44556677-8899-00aa-bbcc-ddeeff112233', 'b238e8c4-6d03-59c1-0c0e-f6c1f70e80b4', 'Trauma Center', true),
  ('55667788-9900-aabb-ccdd-eeff11223344', 'b238e8c4-6d03-59c1-0c0e-f6c1f70e80b4', 'Triage', true),
  ('66778899-00aa-bbcc-ddee-ff1122334455', 'b238e8c4-6d03-59c1-0c0e-f6c1f70e80b4', 'Observation Unit', false),
  ('778899aa-bbcc-ddee-ff11-223344556677', 'b238e8c4-6d03-59c1-0c0e-f6c1f70e80b4', 'Ambulance Bay', false),
  
  -- Outpatient Clinic
  ('8899aabb-ccdd-eeff-1122-334455667788', 'c329f9d5-7e14-60d2-1d1f-a7d2a81f91c5', 'Reception', true),
  ('99aabbcc-ddee-ff11-2233-4455667788aa', 'c329f9d5-7e14-60d2-1d1f-a7d2a81f91c5', 'Waiting Area', true),
  ('aabbccdd-eeff-1122-3344-5566778899bb', 'c329f9d5-7e14-60d2-1d1f-a7d2a81f91c5', 'Consultation Room 1', false),
  ('bbccddee-ff11-2233-4455-66778899aacc', 'c329f9d5-7e14-60d2-1d1f-a7d2a81f91c5', 'Consultation Room 2', false),
  ('ccddeeff-1122-3344-5566-778899aabbdd', 'c329f9d5-7e14-60d2-1d1f-a7d2a81f91c5', 'Consultation Room 3', false),
  ('ddeeff11-2233-4455-6677-8899aabbccee', 'c329f9d5-7e14-60d2-1d1f-a7d2a81f91c5', 'Rehabilitation Center', false),
  ('eeff1122-3344-5566-7788-99aabbccddff', 'c329f9d5-7e14-60d2-1d1f-a7d2a81f91c5', 'Pharmacy', true),
  
  -- Research & Diagnostics Center
  ('ff112233-4455-6677-8899-aabbccddeeff', 'd410a0e6-8f25-71e3-2e2a-b8e3b92a02d6', 'Laboratory', true),
  ('112233ff-4455-6677-8899-aabbccddeeff', 'd410a0e6-8f25-71e3-2e2a-b8e3b92a02d6', 'Radiology', true),
  ('223344ff-5566-7788-99aa-bbccddeeff11', 'd410a0e6-8f25-71e3-2e2a-b8e3b92a02d6', 'MRI Suite', false),
  ('334455ff-6677-8899-aabb-ccddeeff1122', 'd410a0e6-8f25-71e3-2e2a-b8e3b92a02d6', 'CT Scan Room', false),
  ('445566ff-7788-99aa-bbcc-ddeeff112233', 'd410a0e6-8f25-71e3-2e2a-b8e3b92a02d6', 'Ultrasound Room', false),
  ('556677ff-8899-aabb-ccdd-eeff11223344', 'd410a0e6-8f25-71e3-2e2a-b8e3b92a02d6', 'Research Lab 1', false),
  ('667788ff-99aa-bbcc-ddee-ff1122334455', 'd410a0e6-8f25-71e3-2e2a-b8e3b92a02d6', 'Research Lab 2', false);

-- Insert designation departments for porter assignments
INSERT INTO designation_departments (id, name, color, active) VALUES
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Runners', '#4287f5', true),
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Emergency Department', '#e74c3c', true),
  ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'General Wards', '#2ecc71', true),
  ('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'Diagnostics', '#9b59b6', true),
  ('e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'Outpatient Clinic', '#f39c12', true),
  ('f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c', 'Surgical Team', '#3498db', true);

-- Insert comprehensive job categories and items
INSERT INTO job_categories (id, category, item_type, active) VALUES
  -- Patient Transport
  ('a0b1c2d3-e4f5-6a7b-8c9d-0e1f2a3b4c5d', 'Patient Transport', NULL, true),
  ('b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e', 'Patient Transport', 'Wheelchair', true),
  ('c2d3e4f5-a6b7-8c9d-0e1f-2a3b4c5d6e7f', 'Patient Transport', 'Stretcher', true),
  ('d3e4f5a6-b7c8-9d0e-1f2a-3b4c5d6e7f8a', 'Patient Transport', 'Bed', true),
  ('e4f5a6b7-c8d9-0e1f-2a3b-4c5d6e7f8a9b', 'Patient Transport', 'Walking Assist', true),
  
  -- Specimen Delivery
  ('f5a6b7c8-d9e0-1f2a-3b4c-5d6e7f8a9b0c', 'Specimen Delivery', NULL, true),
  ('a6b7c8d9-e0f1-2a3b-4c5d-6e7f8a9b0c1d', 'Specimen Delivery', 'Blood Sample', true),
  ('b7c8d9e0-f1a2-3b4c-5d6e-7f8a9b0c1d2e', 'Specimen Delivery', 'Urine Sample', true),
  ('c8d9e0f1-a2b3-4c5d-6e7f-8a9b0c1d2e3f', 'Specimen Delivery', 'Tissue Sample', true),
  ('d9e0f1a2-b3c4-5d6e-7f8a-9b0c1d2e3f4a', 'Specimen Delivery', 'CSF Sample', true),
  ('e0f1a2b3-c4d5-6e7f-8a9b-0c1d2e3f4a5b', 'Specimen Delivery', 'Other Specimen', true),
  
  -- Equipment
  ('f1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c', 'Equipment', NULL, true),
  ('a2b3c4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d', 'Equipment', 'Oxygen Cylinder', true),
  ('b3c4d5e6-f7a8-9b0c-1d2e-3f4a5b6c7d8e', 'Equipment', 'IV Stand', true),
  ('c4d5e6f7-a8b9-0c1d-2e3f-4a5b6c7d8e9f', 'Equipment', 'Patient Monitor', true),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 'Equipment', 'Ventilator', true),
  ('e6f7a8b9-c0d1-2e3f-4a5b-6c7d8e9f0a1b', 'Equipment', 'Wheelchair', true),
  ('f7a8b9c0-d1e2-3f4a-5b6c-7d8e9f0a1b2c', 'Equipment', 'Hospital Bed', true),
  ('a8b9c0d1-e2f3-4a5b-6c7d-8e9f0a1b2c3d', 'Equipment', 'Other Equipment', true),
  
  -- Medical Supplies
  ('b9c0d1e2-f3a4-5b6c-7d8e-9f0a1b2c3d4e', 'Medical Supplies', NULL, true),
  ('c0d1e2f3-a4b5-6c7d-8e9f-0a1b2c3d4e5f', 'Medical Supplies', 'Medications', true),
  ('d1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a', 'Medical Supplies', 'IV Fluids', true),
  ('e2f3a4b5-c6d7-8e9f-0a1b-2c3d4e5f6a7b', 'Medical Supplies', 'Surgical Supplies', true),
  ('f3a4b5c6-d7e8-9f0a-1b2c-3d4e5f6a7b8c', 'Medical Supplies', 'Dressings', true),
  ('a4b5c6d7-e8f9-0a1b-2c3d-4e5f6a7b8c9d', 'Medical Supplies', 'Other Supplies', true),
  
  -- Documents
  ('b5c6d7e8-f9a0-1b2c-3d4e-5f6a7b8c9d0e', 'Documents', NULL, true),
  ('c6d7e8f9-a0b1-2c3d-4e5f-6a7b8c9d0e1f', 'Documents', 'Medical Records', true),
  ('d7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a', 'Documents', 'Test Results', true),
  ('e8f9a0b1-c2d3-4e5f-6a7b-8c9d0e1f2a3b', 'Documents', 'Prescriptions', true),
  ('f9a0b1c2-d3e4-5f6a-7b8c-9d0e1f2a3b4c', 'Documents', 'Discharge Papers', true),
  ('a0b1c2d3-e4f5-6a7b-8c9d-0e1f2a3b4c5d', 'Documents', 'Other Documents', true);

-- Insert job category defaults
INSERT INTO job_category_defaults (id, category, item_type, from_building_id, from_location_id, to_building_id, to_location_id) VALUES
  -- Blood Sample typically goes from wards to laboratory
  ('a1a2a3a4-b1b2-c1c2-d1d2-e1e2f1f2a3b3', 'Specimen Delivery', 'Blood Sample', 
   'a147d7b3-5c92-48b0-9b9d-e5b0f69d79a3', 'aa11bb22-cc33-dd44-ee55-ff6677889900',
   'd410a0e6-8f25-71e3-2e2a-b8e3b92a02d6', 'ff112233-4455-6677-8899-aabbccddeeff'),
   
  -- Urine Sample typically goes from wards to laboratory
  ('b2b3b4b5-c2c3-d2d3-e2e3-f2f3a2a3b4b5', 'Specimen Delivery', 'Urine Sample', 
   'a147d7b3-5c92-48b0-9b9d-e5b0f69d79a3', 'bb22cc33-dd44-ee55-ff66-778899001122',
   'd410a0e6-8f25-71e3-2e2a-b8e3b92a02d6', 'ff112233-4455-6677-8899-aabbccddeeff'),
   
  -- Tissue Sample typically goes from surgical ward to laboratory
  ('c3c4c5c6-d3d4-e3e4-f3f4-a3a4b3b4c5c6', 'Specimen Delivery', 'Tissue Sample', 
   'a147d7b3-5c92-48b0-9b9d-e5b0f69d79a3', 'cc33dd44-ee55-ff66-7788-99001122aa11',
   'd410a0e6-8f25-71e3-2e2a-b8e3b92a02d6', 'ff112233-4455-6677-8899-aabbccddeeff'),
  
  -- Patients on stretchers often go from ER to Radiology
  ('d4d5d6d7-e4e5-f4f5-a4a5-b4b5c4c5d6d7', 'Patient Transport', 'Stretcher', 
   'b238e8c4-6d03-59c1-0c0e-f6c1f70e80b4', '33445566-7788-9900-aabb-ccddeeff1122',
   'd410a0e6-8f25-71e3-2e2a-b8e3b92a02d6', '112233ff-4455-6677-8899-aabbccddeeff'),
   
  -- Patients in wheelchairs often go from wards to consultation rooms
  ('e5e6e7e8-f5f6-a5a6-b5b6-c5c6d5d6e7e8', 'Patient Transport', 'Wheelchair', 
   'a147d7b3-5c92-48b0-9b9d-e5b0f69d79a3', 'aa11bb22-cc33-dd44-ee55-ff6677889900',
   'c329f9d5-7e14-60d2-1d1f-a7d2a81f91c5', 'aabbccdd-eeff-1122-3344-5566778899bb'),
   
  -- Oxygen cylinders often go from supplies to ICU
  ('f6f7f8f9-a6a7-b6b7-c6c7-d6d7e6e7f8f9', 'Equipment', 'Oxygen Cylinder', 
   'd410a0e6-8f25-71e3-2e2a-b8e3b92a02d6', '556677ff-8899-aabb-ccdd-eeff11223344',
   'a147d7b3-5c92-48b0-9b9d-e5b0f69d79a3', 'dd44ee55-ff66-7788-9900-1122aa11bb22'),
   
  -- Medical records often go from records department to consultation rooms
  ('a7a8a9a0-b7b8-c7c8-d7d8-e7e8f7f8a9a0', 'Documents', 'Medical Records', 
   'a147d7b3-5c92-48b0-9b9d-e5b0f69d79a3', 'dd44ee55-ff66-7788-9900-1122aa11bb22',
   'c329f9d5-7e14-60d2-1d1f-a7d2a81f91c5', 'bbccddee-ff11-2233-4455-66778899aacc');

-- Create an ACTIVE current shift for testing
INSERT INTO shifts (id, date, type, supervisor, start_time, end_time) VALUES
  ('a5b6c7d8-e9f0-1a2b-3c4d-5e6f7a8b9c0d', CURRENT_DATE, 'Day', 'Dr. Sarah Williams', 
   NOW() - INTERVAL '4 hours', NULL);

-- Create a previous (completed) shift for testing archive
INSERT INTO shifts (id, date, type, supervisor, start_time, end_time) VALUES
  ('b6c7d8e9-f0a1-2b3c-4d5e-6f7a8b9c0d1e', CURRENT_DATE - 1, 'Day', 'Dr. James Thompson', 
   NOW() - INTERVAL '28 hours', NOW() - INTERVAL '16 hours');

-- Assign porters to the current shift
INSERT INTO shift_assigned_porters (shift_id, porter_id) VALUES
  ('a5b6c7d8-e9f0-1a2b-3c4d-5e6f7a8b9c0d', 'Thomas Johnson'),
  ('a5b6c7d8-e9f0-1a2b-3c4d-5e6f7a8b9c0d', 'Maria Garcia'),
  ('a5b6c7d8-e9f0-1a2b-3c4d-5e6f7a8b9c0d', 'Daniel Smith'),
  ('a5b6c7d8-e9f0-1a2b-3c4d-5e6f7a8b9c0d', 'Sophia Lee');

-- Assign porters to the previous shift
INSERT INTO shift_assigned_porters (shift_id, porter_id) VALUES
  ('b6c7d8e9-f0a1-2b3c-4d5e-6f7a8b9c0d1e', 'William Brown'),
  ('b6c7d8e9-f0a1-2b3c-4d5e-6f7a8b9c0d1e', 'Olivia Martinez'),
  ('b6c7d8e9-f0a1-2b3c-4d5e-6f7a8b9c0d1e', 'James Wilson');

-- Create porter department assignments for current shift
INSERT INTO porter_assignments (id, shift_id, porter_id, department_id, start_time, end_time, notes) VALUES
  ('c7d8e9f0-a1b2-3c4d-5e6f-7a8b9c0d1e2f', 'a5b6c7d8-e9f0-1a2b-3c4d-5e6f7a8b9c0d', 
   'Thomas Johnson', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 
   NOW() - INTERVAL '3.5 hours', NULL, 'Assigned to handle ER cases'),
   
  ('d8e9f0a1-b2c3-4d5e-6f7a-8b9c0d1e2f3a', 'a5b6c7d8-e9f0-1a2b-3c4d-5e6f7a8b9c0d', 
   'Maria Garcia', 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 
   NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour', 'Completed ward rounds'),
   
  ('e9f0a1b2-c3d4-5e6f-7a8b-9c0d1e2f3a4b', 'a5b6c7d8-e9f0-1a2b-3c4d-5e6f7a8b9c0d', 
   'Sophia Lee', 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 
   NOW() - INTERVAL '2 hours', NULL, 'Handling diagnostic department tasks');

-- Create tasks for the current shift
INSERT INTO tasks (
  id, shift_id, received_time, allocated_time, completed_time, status, 
  job_category, item_type, allocated_staff, 
  from_building, from_location_id, to_building, to_location_id
) VALUES
  -- Pending wheelchair task
  ('aa11bb22-cc33-dd44-ee55-ff6677889900',
   'a5b6c7d8-e9f0-1a2b-3c4d-5e6f7a8b9c0d', 
   NOW() - INTERVAL '3.5 hours', 
   NOW() - INTERVAL '3.4 hours', 
   NULL, 
   'Pending',
   'Patient Transport', 'Wheelchair', 'Daniel Smith',
   'a147d7b3-5c92-48b0-9b9d-e5b0f69d79a3', 'aa11bb22-cc33-dd44-ee55-ff6677889900',
   'c329f9d5-7e14-60d2-1d1f-a7d2a81f91c5', 'aabbccdd-eeff-1122-3344-5566778899bb'
  ),
  
  -- Completed blood sample task
  ('bb22cc33-dd44-ee55-ff66-7788990011aa',
   'a5b6c7d8-e9f0-1a2b-3c4d-5e6f7a8b9c0d', 
   NOW() - INTERVAL '3.2 hours', 
   NOW() - INTERVAL '3.1 hours', 
   NOW() - INTERVAL '2.8 hours', 
   'Completed',
   'Specimen Delivery', 'Blood Sample', 'Maria Garcia',
   'a147d7b3-5c92-48b0-9b9d-e5b0f69d79a3', 'aa11bb22-cc33-dd44-ee55-ff6677889900',
   'd410a0e6-8f25-71e3-2e2a-b8e3b92a02d6', 'ff112233-4455-6677-8899-aabbccddeeff'
  ),
  
  -- Completed stretcher task
  ('cc33dd44-ee55-ff66-77889900-11aabb22',
   'a5b6c7d8-e9f0-1a2b-3c4d-5e6f7a8b9c0d', 
   NOW() - INTERVAL '2.5 hours', 
   NOW() - INTERVAL '2.4 hours', 
   NOW() - INTERVAL '2.1 hours', 
   'Completed',
   'Patient Transport', 'Stretcher', 'Thomas Johnson',
   'b238e8c4-6d03-59c1-0c0e-f6c1f70e80b4', '33445566-7788-9900-aabb-ccddeeff1122',
   'd410a0e6-8f25-71e3-2e2a-b8e3b92a02d6', '112233ff-4455-6677-8899-aabbccddeeff'
  ),
  
  -- Pending equipment task
  ('dd44ee55-ff66-7788-99aa-bbcc00112233',
   'a5b6c7d8-e9f0-1a2b-3c4d-5e6f7a8b9c0d', 
   NOW() - INTERVAL '1.8 hours', 
   NOW() - INTERVAL '1.7 hours', 
   NULL, 
   'Pending',
   'Equipment', 'Oxygen Cylinder', 'Sophia Lee',
   'd410a0e6-8f25-71e3-2e2a-b8e3b92a02d6', '556677ff-8899-aabb-ccdd-eeff11223344',
   'a147d7b3-5c92-48b0-9b9d-e5b0f69d79a3', 'dd44ee55-ff66-7788-9900-1122aa11bb22'
  ),
  
  -- Pending medical records task
  ('ee55ff66-7788-99aa-bbcc-dd00112233',
   'a5b6c7d8-e9f0-1a2b-3c4d-5e6f7a8b9c0d', 
   NOW() - INTERVAL '1.2 hours', 
   NOW() - INTERVAL '1.1 hours', 
   NULL, 
   'Pending',
   'Documents', 'Medical Records', 'Daniel Smith',
   'a147d7b3-5c92-48b0-9b9d-e5b0f69d79a3', 'dd44ee55-ff66-7788-9900-1122aa11bb22',
   'c329f9d5-7e14-60d2-1d1f-a7d2a81f91c5', 'bbccddee-ff11-2233-4455-66778899aacc'
  ),
  
  -- Also create tasks for the previous shift
  -- Completed wheelchair task
  ('ff66778899-00aabbcc-dd112233',
   'b6c7d8e9-f0a1-2b3c-4d5e-6f7a8b9c0d1e', 
   NOW() - INTERVAL '27 hours', 
   NOW() - INTERVAL '26.9 hours', 
   NOW() - INTERVAL '26.5 hours', 
   'Completed',
   'Patient Transport', 'Wheelchair', 'William Brown',
   'a147d7b3-5c92-48b0-9b9d-e5b0f69d79a3', 'bb22cc33-dd44-ee55-ff66-778899001122',
   'c329f9d5-7e14-60d2-1d1f-a7d2a81f91c5', '8899aabb-ccdd-eeff-1122-334455667788'
  ),
  
  -- Completed medical supplies task
  ('11223344-55667788-99aabbcc',
   'b6c7d8e9-f0a1-2b3c-4d5e-6f7a8b9c0d1e', 
   NOW() - INTERVAL '25 hours', 
   NOW() - INTERVAL '24.9 hours', 
   NOW() - INTERVAL '24.7 hours', 
   'Completed',
   'Medical Supplies', 'Medications', 'Olivia Martinez',
   'c329f9d5-7e14-60d2-1d1f-a7d2a81f91c5', 'eeff1122-3344-5566-7788-99aabbccddff',
   'a147d7b3-5c92-48b0-9b9d-e5b0f69d79a3', 'ee55ff66-7788-9900-1122-aa11bb22cc33'
  ),
  
  -- Completed blood sample task
  ('22334455-66778899-aabbccdd',
   'b6c7d8e9-f0a1-2b3c-4d5e-6f7a8b9c0d1e', 
   NOW() - INTERVAL '23 hours', 
   NOW() - INTERVAL '22.9 hours', 
   NOW() - INTERVAL '22.7 hours', 
   'Completed',
   'Specimen Delivery', 'Blood Sample', 'James Wilson',
   'a147d7b3-5c92-48b0-9b9d-e5b0f69d79a3', 'ee55ff66-7788-9900-1122-aa11bb22cc33',
   'd410a0e6-8f25-71e3-2e2a-b8e3b92a02d6', 'ff112233-4455-6677-8899-aabbccddeeff'
  );

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('shift_day_start', '08:00'),
  ('shift_day_end', '20:00'),
  ('shift_night_start', '20:00'),
  ('shift_night_end', '08:00')
ON CONFLICT (key) DO NOTHING;
