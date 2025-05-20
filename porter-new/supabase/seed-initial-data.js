// Script to seed initial data for the Porter Task application
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL and key must be set in the .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Main function to seed all data
async function seedInitialData() {
  try {
    console.log('Starting to seed initial data...');
    
    // Seed supervisors
    await seedSupervisors();
    
    // Seed porters
    await seedPorters();
    
    // Seed buildings and departments
    await seedLocations();
    
    // Seed job categories and items
    await seedJobCategories();
    
    // Seed designation departments
    await seedDesignationDepartments();
    
    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

// Function to seed supervisors
async function seedSupervisors() {
  console.log('Seeding supervisors...');
  
  const supervisors = [
    { name: 'John Smith', active: true },
    { name: 'Sarah Johnson', active: true },
    { name: 'Michael Brown', active: true },
    { name: 'Emma Wilson', active: true }
  ];
  
  // Check if supervisors already exist
  const { data: existingSupervisors } = await supabase
    .from('supervisors')
    .select('name');
  
  if (existingSupervisors && existingSupervisors.length > 0) {
    console.log(`Found ${existingSupervisors.length} existing supervisors, skipping...`);
    return;
  }
  
  // Insert supervisors
  const { error } = await supabase
    .from('supervisors')
    .insert(supervisors);
  
  if (error) {
    throw error;
  }
  
  console.log(`Added ${supervisors.length} supervisors`);
}

// Function to seed porters
async function seedPorters() {
  console.log('Seeding porters...');
  
  const porters = [
    { name: 'David Miller', active: true },
    { name: 'Lisa Taylor', active: true },
    { name: 'Robert Jones', active: true },
    { name: 'Amanda Clark', active: true },
    { name: 'James Wilson', active: true },
    { name: 'Patricia Davis', active: true }
  ];
  
  // Check if porters already exist
  const { data: existingPorters } = await supabase
    .from('porters')
    .select('name');
  
  if (existingPorters && existingPorters.length > 0) {
    console.log(`Found ${existingPorters.length} existing porters, skipping...`);
    return;
  }
  
  // Insert porters
  const { error } = await supabase
    .from('porters')
    .insert(porters);
  
  if (error) {
    throw error;
  }
  
  console.log(`Added ${porters.length} porters`);
}

// Function to seed buildings and departments
async function seedLocations() {
  console.log('Seeding buildings and departments...');
  
  // Check if buildings already exist
  const { data: existingBuildings } = await supabase
    .from('buildings')
    .select('name');
  
  if (existingBuildings && existingBuildings.length > 0) {
    console.log(`Found ${existingBuildings.length} existing buildings, skipping...`);
    return;
  }
  
  // First insert buildings
  const buildings = [
    { id: 'b1', name: 'Main Hospital', active: true },
    { id: 'b2', name: 'Outpatient Center', active: true },
    { id: 'b3', name: 'Research Building', active: true }
  ];
  
  for (const building of buildings) {
    const { error } = await supabase
      .from('buildings')
      .insert([building]);
    
    if (error) {
      throw error;
    }
  }
  
  console.log(`Added ${buildings.length} buildings`);
  
  // Then insert departments
  const departments = [
    // Main Hospital departments
    { building_id: 'b1', name: 'Emergency Room', frequent: true, active: true },
    { building_id: 'b1', name: 'Intensive Care Unit', frequent: true, active: true },
    { building_id: 'b1', name: 'Surgery', frequent: true, active: true },
    { building_id: 'b1', name: 'Radiology', frequent: true, active: true },
    { building_id: 'b1', name: 'Laboratory', frequent: true, active: true },
    { building_id: 'b1', name: 'Ward A', frequent: false, active: true },
    { building_id: 'b1', name: 'Ward B', frequent: false, active: true },
    { building_id: 'b1', name: 'Ward C', frequent: false, active: true },
    
    // Outpatient Center departments
    { building_id: 'b2', name: 'Reception', frequent: true, active: true },
    { building_id: 'b2', name: 'Consultation Room 1', frequent: false, active: true },
    { building_id: 'b2', name: 'Consultation Room 2', frequent: false, active: true },
    { building_id: 'b2', name: 'Pharmacy', frequent: true, active: true },
    
    // Research Building departments
    { building_id: 'b3', name: 'Research Lab 1', frequent: false, active: true },
    { building_id: 'b3', name: 'Research Lab 2', frequent: false, active: true },
    { building_id: 'b3', name: 'Conference Room', frequent: false, active: true }
  ];
  
  const { error: deptError } = await supabase
    .from('departments')
    .insert(departments);
  
  if (deptError) {
    throw deptError;
  }
  
  console.log(`Added ${departments.length} departments`);
}

// Function to seed job categories and items
async function seedJobCategories() {
  console.log('Seeding job categories and items...');
  
  // Check if job categories already exist
  const { data: existingCategories } = await supabase
    .from('job_categories')
    .select('category');
  
  if (existingCategories && existingCategories.length > 0) {
    console.log(`Found ${existingCategories.length} existing job categories, skipping...`);
    return;
  }
  
  // Job categories and their items
  const categories = [
    // Category with no item (category itself)
    { category: 'Patient Transport', item_type: null, active: true },
    // Items for Patient Transport
    { category: 'Patient Transport', item_type: 'Wheelchair', active: true },
    { category: 'Patient Transport', item_type: 'Stretcher', active: true },
    { category: 'Patient Transport', item_type: 'Bed', active: true },
    
    // Category with no item
    { category: 'Specimen Delivery', item_type: null, active: true },
    // Items for Specimen Delivery
    { category: 'Specimen Delivery', item_type: 'Blood Sample', active: true },
    { category: 'Specimen Delivery', item_type: 'Urine Sample', active: true },
    { category: 'Specimen Delivery', item_type: 'Tissue Sample', active: true },
    
    // Category with no item
    { category: 'Equipment', item_type: null, active: true },
    // Items for Equipment
    { category: 'Equipment', item_type: 'Oxygen Tank', active: true },
    { category: 'Equipment', item_type: 'IV Stand', active: true },
    { category: 'Equipment', item_type: 'Monitor', active: true },
    
    // Category with no item
    { category: 'General', item_type: null, active: true },
    // Items for General
    { category: 'General', item_type: 'Medical Supplies', active: true },
    { category: 'General', item_type: 'Paperwork', active: true },
    { category: 'General', item_type: 'Medication', active: true }
  ];
  
  const { error } = await supabase
    .from('job_categories')
    .insert(categories);
  
  if (error) {
    throw error;
  }
  
  console.log(`Added ${categories.length} job category entries`);
  
  // Add some default locations for specific job types
  console.log('Adding default locations for job categories...');
  
  // We'll need to fetch some department IDs first
  const { data: departments } = await supabase
    .from('departments')
    .select('id, name, building_id');
  
  if (!departments) {
    console.log('Could not fetch departments to set up default locations');
    return;
  }
  
  // Find departments by name
  const findDepartment = (name) => departments.find(d => d.name === name);
  
  const erDept = findDepartment('Emergency Room');
  const labDept = findDepartment('Laboratory');
  const wardADept = findDepartment('Ward A');
  const radiologyDept = findDepartment('Radiology');
  
  if (!erDept || !labDept || !wardADept || !radiologyDept) {
    console.log('Could not find all required departments for default locations');
    return;
  }
  
  const defaults = [
    // Blood Sample typically goes from Ward A to Laboratory
    { 
      category: 'Specimen Delivery', 
      item_type: 'Blood Sample', 
      from_building_id: wardADept.building_id,
      from_location_id: wardADept.id,
      to_building_id: labDept.building_id,
      to_location_id: labDept.id
    },
    
    // Patients on stretchers often go from ER to Radiology
    { 
      category: 'Patient Transport', 
      item_type: 'Stretcher', 
      from_building_id: erDept.building_id,
      from_location_id: erDept.id,
      to_building_id: radiologyDept.building_id,
      to_location_id: radiologyDept.id
    }
  ];
  
  const { error: defaultsError } = await supabase
    .from('job_category_defaults')
    .insert(defaults);
  
  if (defaultsError) {
    throw defaultsError;
  }
  
  console.log(`Added ${defaults.length} default location entries`);
}

// Function to seed designation departments
async function seedDesignationDepartments() {
  console.log('Seeding designation departments...');
  
  // Check if designation departments already exist
  const { data: existingDepts } = await supabase
    .from('designation_departments')
    .select('name');
  
  if (existingDepts && existingDepts.length > 0) {
    console.log(`Found ${existingDepts.length} existing designation departments, skipping...`);
    return;
  }
  
  const designationDepts = [
    { name: 'Runner', color: '#0066cc', active: true },
    { name: 'Emergency Department', color: '#dc3545', active: true },
    { name: 'Surgery', color: '#28a745', active: true },
    { name: 'Radiology', color: '#fd7e14', active: true },
    { name: 'Outpatient', color: '#6610f2', active: true }
  ];
  
  const { error } = await supabase
    .from('designation_departments')
    .insert(designationDepts);
  
  if (error) {
    throw error;
  }
  
  console.log(`Added ${designationDepts.length} designation departments`);
}

// Run the seed function
seedInitialData();
