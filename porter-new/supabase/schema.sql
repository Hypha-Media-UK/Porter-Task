-- Porter Task Application Database Schema

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Settings table for application configuration
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Supervisors table
CREATE TABLE IF NOT EXISTS supervisors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Porters table
CREATE TABLE IF NOT EXISTS porters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Buildings table
CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  frequent BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(building_id, name)
);

-- Job categories and item types
CREATE TABLE IF NOT EXISTS job_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  item_type TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(category, item_type)
);

-- Default locations for job categories
CREATE TABLE IF NOT EXISTS job_category_defaults (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  item_type TEXT,
  from_building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  from_location_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  to_building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  to_location_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(category, item_type)
);

-- Designation departments (for porter assignments)
CREATE TABLE IF NOT EXISTS designation_departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#0066cc',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shifts
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Day', 'Night')),
  supervisor TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Porter assignment to shifts
CREATE TABLE IF NOT EXISTS shift_assigned_porters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  porter_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(shift_id, porter_id)
);

-- Porter assignments to departments
CREATE TABLE IF NOT EXISTS porter_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  porter_id TEXT NOT NULL,
  department_id UUID NOT NULL REFERENCES designation_departments(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  received_time TIMESTAMPTZ NOT NULL,
  allocated_time TIMESTAMPTZ NOT NULL,
  completed_time TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Completed')),
  job_category TEXT NOT NULL,
  item_type TEXT,
  allocated_staff TEXT,
  from_building UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  from_location_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  to_building UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  to_location_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('shift_day_start', '08:00'),
  ('shift_day_end', '20:00'),
  ('shift_night_start', '20:00'),
  ('shift_night_end', '08:00')
ON CONFLICT (key) DO NOTHING;

-- Create database functions for maintenance

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'updated_at' 
    AND table_schema = 'public'
  LOOP
    EXECUTE format('
      CREATE TRIGGER update_%I_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    ', t, t);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS tasks_shift_id_idx ON tasks(shift_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);
CREATE INDEX IF NOT EXISTS departments_building_id_idx ON departments(building_id);
CREATE INDEX IF NOT EXISTS porter_assignments_shift_id_idx ON porter_assignments(shift_id);
CREATE INDEX IF NOT EXISTS shift_assigned_porters_shift_id_idx ON shift_assigned_porters(shift_id);
