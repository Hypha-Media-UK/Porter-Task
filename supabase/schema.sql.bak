-- Porter Task Management App Database Schema
-- This SQL defines the database structure for the Supabase project

-- Settings table for application-wide settings
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Supervisors table
CREATE TABLE IF NOT EXISTS supervisors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Porters table
CREATE TABLE IF NOT EXISTS porters (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Buildings table
CREATE TABLE IF NOT EXISTS buildings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Departments table (includes wards)
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  building_id TEXT NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Job Categories table
CREATE TABLE IF NOT EXISTS job_categories (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  item_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category, item_type)
);

-- Job Category Default locations
CREATE TABLE IF NOT EXISTS job_category_defaults (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  item_type TEXT,
  building_id TEXT NOT NULL,
  location_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- Designation Departments for porter assignments
CREATE TABLE IF NOT EXISTS designation_departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Day', 'Night')),
  supervisor TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  shift_id TEXT NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  received_time TEXT NOT NULL,
  allocated_time TEXT NOT NULL,
  completed_time TEXT,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Completed')),
  job_category TEXT NOT NULL,
  item_type TEXT NOT NULL,
  allocated_staff TEXT,
  from_building TEXT NOT NULL,
  from_location_id TEXT NOT NULL,
  to_building TEXT NOT NULL,
  to_location_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Porter Assignments table for time-based department assignments
CREATE TABLE IF NOT EXISTS porter_assignments (
  id TEXT PRIMARY KEY,
  shift_id TEXT NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  porter_id TEXT NOT NULL,
  department_id TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Shift Assigned Porters table to track which porters are assigned to which shifts
CREATE TABLE IF NOT EXISTS shift_assigned_porters (
  id TEXT PRIMARY KEY,
  shift_id TEXT NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  porter_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(shift_id, porter_id)
);

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_tasks_shift_id ON tasks(shift_id);
CREATE INDEX IF NOT EXISTS idx_porter_assignments_shift_id ON porter_assignments(shift_id);
CREATE INDEX IF NOT EXISTS idx_shift_assigned_porters_shift_id ON shift_assigned_porters(shift_id);
CREATE INDEX IF NOT EXISTS idx_departments_building_id ON departments(building_id);

-- Insert default settings
INSERT INTO settings (key, value)
VALUES 
  ('shift_day_start', '08:00'),
  ('shift_day_end', '16:00'),
  ('shift_night_start', '20:00'),
  ('shift_night_end', '04:00')
ON CONFLICT (key) DO NOTHING;

-- PostgreSQL function to get version (used for connection testing)
CREATE OR REPLACE FUNCTION get_pg_version()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('server_version');
END;
$$ LANGUAGE plpgsql;
