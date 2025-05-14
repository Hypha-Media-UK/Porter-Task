-- Porter Task Management App Seed Data
-- This SQL populates the Supabase database with initial data

-- Clear existing data first to avoid conflicts
TRUNCATE TABLE shift_assigned_porters CASCADE;
TRUNCATE TABLE porter_assignments CASCADE;
TRUNCATE TABLE tasks CASCADE;
TRUNCATE TABLE shifts CASCADE;
TRUNCATE TABLE job_category_defaults CASCADE;
TRUNCATE TABLE job_categories CASCADE;
TRUNCATE TABLE departments CASCADE;
TRUNCATE TABLE buildings CASCADE;
TRUNCATE TABLE porters CASCADE;
TRUNCATE TABLE supervisors CASCADE;
DELETE FROM settings WHERE key NOT IN ('shift_day_start', 'shift_day_end', 'shift_night_start', 'shift_night_end');

-- Insert supervisors
INSERT INTO supervisors (name) VALUES
('Chris Crombie'),
('Luke Clements'),
('Martin Smith'),
('Martin Fearon'),
('Sumi');

-- Insert porters
INSERT INTO porters (name) VALUES
('Porter 1'),
('Porter 2'),
('Porter 3'),
('Porter 4'),
('Porter 5'),
('Porter 6'),
('Porter 7'),
('Porter 8'),
('Porter 9'),
('Porter 10');

-- Insert buildings
INSERT INTO buildings (id, name) VALUES
('main', 'Hartshead Building'),
('east', 'Charlesworth Building'),
('north', 'Ladysmith Building'),
('macmillan-unit', 'Macmillan Unit'),
('new-fountain-house', 'New Fountain House'),
('bereavement-center', 'Bereavement Center'),
('buckton-building', 'Buckton Building'),
('etherow-building', 'Etherow Building'),
('renal-unit', 'Renal Unit'),
('main-stores', 'Main Stores'),
('porters-lodge', 'Portland House');

-- Insert departments for Hartshead Building
INSERT INTO departments (id, building_id, name) VALUES
('amu', 'main', 'AMU'),
('iau', 'main', 'IAU'),
('itu', 'main', 'ITU'),
('acu', 'main', 'ACU'),
('north-theatres', 'main', 'North Theatres'),
('south-theatres', 'main', 'South Theatres'),
('dseu-(day-surgery)', 'main', 'DSEU (Day Surgery)'),
('childrens-unit', 'main', 'Childrens Unit'),
('childrens-o+a', 'main', 'Childrens O+A'),
('childrens-outpatients', 'main', 'Childrens Outpatients'),
('pharmacy', 'main', 'Pharmacy'),
('gf-xray', 'main', 'GF Xray'),
('ultrasound', 'main', 'Ultrasound'),
('clinics-a---f', 'main', 'Clinics A - F'),
('cri-clinic', 'main', 'CRI Clinic'),
('swan-room', 'main', 'Swan Room'),
('day-surgery', 'main', 'Surgical Hub'),
('vascular-studies', 'main', 'Vascular Studies'),
('plaster-room', 'main', 'Plaster Room'),
('clinics-1---9-(blue-suite)', 'main', 'Clinics 1 - 9 (Blue Suite)'),
('yellow-suite', 'main', 'Yellow Suite'),
('isgu', 'main', 'ISGU'),
('north-reception', 'main', 'North Reception'),
('south-reception', 'main', 'South Reception'),
('sdec', 'main', 'SDEC'),
('frailty', 'main', 'Frailty'),
('bed-store', 'main', 'Bed Store');

-- Insert departments for Charlesworth Building
INSERT INTO departments (id, building_id, name) VALUES
('physio', 'east', 'Ward 31'),
('oncology', 'east', 'Ward 30 (HCU)'),
('imaging', 'east', 'Ward 27'),
('labour-ward', 'east', 'Labour Ward'),
('womens-health-unit', 'east', 'Womens Health Unit'),
('nicu', 'east', 'NICU'),
('eastward1', 'east', 'Acorn Birth Center'),
('eastward2', 'east', 'CCS'),
('eastward3', 'east', 'Maternity Triage');

-- Insert departments for Ladysmith Building
INSERT INTO departments (id, building_id, name) VALUES
('admin', 'north', 'Ward 41'),
('records', 'north', 'Ward 42'),
('cafe', 'north', 'Ward 43'),
('ward-44', 'north', 'Ward 44'),
('ward-45', 'north', 'Ward 45'),
('ward-46', 'north', 'Ward 46');

-- Insert departments for Macmillan Unit
INSERT INTO departments (id, building_id, name) VALUES
('macmillan', 'macmillan-unit', 'Macmillan');

-- Insert departments for New Fountain House
INSERT INTO departments (id, building_id, name) VALUES
('pathology', 'new-fountain-house', 'Pathology'),
('infection-control', 'new-fountain-house', 'Infection Control');

-- Insert departments for Bereavement Center
INSERT INTO departments (id, building_id, name) VALUES
('rose-cotage', 'bereavement-center', 'Rose Cottage');

-- Insert departments for Buckton Building
INSERT INTO departments (id, building_id, name) VALUES
('taylor-ward', 'buckton-building', 'Taylor Ward'),
('hague-ward', 'buckton-building', 'Hague Ward');

-- Insert departments for Portland House
INSERT INTO departments (id, building_id, name) VALUES
('laundr', 'porters-lodge', 'Laundry'),
('porters-lodge', 'porters-lodge', 'Porters Lodge'),
('i.t.', 'porters-lodge', 'I.T.');

-- Insert job categories and item types
-- Patient Transfer category
INSERT INTO job_categories (id, category, item_type) VALUES
('pt-wheelchair', 'Patient Transfer', 'Wheelchair'),
('pt-stretcher', 'Patient Transfer', 'Stretcher'),
('pt-bed', 'Patient Transfer', 'Bed'),
('pt-rose-cottage', 'Patient Transfer', 'Rose Cottage');

-- Specimen Delivery category
INSERT INTO job_categories (id, category, item_type) VALUES
('sd-blood', 'Specimen Delivery', 'Blood Sample'),
('sd-urine', 'Specimen Delivery', 'Urine Sample');

-- Asset Movement category
INSERT INTO job_categories (id, category, item_type) VALUES
('am-bed-complete', 'Asset Movement', 'Bed (Complete)'),
('am-bed-frame', 'Asset Movement', 'Bed Frame'),
('am-incubator', 'Asset Movement', 'Incubator');

-- Gases category
INSERT INTO job_categories (id, category, item_type) VALUES
('gas-d-oxygen', 'Gases', 'D - Oxygen'),
('gas-e-oxygen', 'Gases', 'E - Oxygen'),
('gas-f-oxygen', 'Gases', 'F - Oxygen'),
('gas-d-co2', 'Gases', 'D - CO2'),
('gas-f-co2', 'Gases', 'F - CO2');

-- Adhoc category
INSERT INTO job_categories (id, category, item_type) VALUES
('adhoc-documents', 'Adhoc', 'Documents');

-- Insert job category defaults
INSERT INTO job_category_defaults (id, category, item_type, from_building_id, from_location_id, to_building_id, to_location_id) VALUES
('pt-rose-cottage-default', 'Patient Transfer', 'Rose Cottage', NULL, NULL, 'bereavement-center', 'rose-cotage');

-- Update settings for shift times
UPDATE settings SET value = '08:00' WHERE key = 'shift_day_start';
UPDATE settings SET value = '20:00' WHERE key = 'shift_day_end';
UPDATE settings SET value = '20:00' WHERE key = 'shift_night_start';
UPDATE settings SET value = '08:00' WHERE key = 'shift_night_end';

-- Insert designation departments for porter assignments with default colors
INSERT INTO designation_departments (id, name, color) VALUES
('amu', 'AMU', '#FF5733'),
('itu', 'ITU', '#33FF57'),
('north-theatres', 'North Theatres', '#5733FF'),
('pharmacy', 'Pharmacy', '#FF33F5'),
('labour-ward', 'Labour Ward', '#33FFF5'),
('general', 'General', '#F5F533');

-- Create a demo shift (optional, comment out if not needed)
-- INSERT INTO shifts (id, date, type, supervisor, start_time)
-- VALUES ('demo-shift-1', '2025-05-13', 'Day', 'Martin Smith', '2025-05-13T08:00:00Z');

-- -- Assign porters to the demo shift (optional, comment out if not needed)
-- INSERT INTO shift_assigned_porters (id, shift_id, porter_id)
-- VALUES 
-- ('sap-1', 'demo-shift-1', 'Porter 1'),
-- ('sap-2', 'demo-shift-1', 'Porter 2'),
-- ('sap-3', 'demo-shift-1', 'Porter 3');

-- Completed!
SELECT 'Database seeded successfully' as result;
