# Database Setup for Porter Task Manager

To set up the Supabase database for the Porter Task Manager application, follow these steps:

## Prerequisites

1. A Supabase account and project
2. Access to the Supabase SQL Editor

## Setup Steps

### 1. Create Database Schema

First, you need to apply the schema to create all the necessary tables:

1. Navigate to your Supabase project dashboard
2. Open the SQL Editor (left sidebar)
3. Create a new query
4. Copy and paste the entire contents of `schema.sql` from this directory
5. Run the query to create all tables and indexes

### 2. Apply Enhanced Seed Data

Next, populate the database with test data:

1. In the SQL Editor, create a new query
2. Copy and paste the entire contents of `enhanced-seed.sql` from this directory
3. Run the query to populate all tables with test data

### Potential Issues and Solutions

If you experience a 400 error when starting a shift, check the following:

1. Ensure you've applied both the schema and seed data
2. Verify that the supervisor you're selecting exists in the supervisors table
   - If not, add the supervisor using the SQL editor or through the application settings
3. Check the browser console for detailed error messages

### Database Structure

The database uses a relational model with these key tables:

- **Buildings & Departments**: Physical locations in the hospital
- **Job Categories & Items**: Types of tasks that can be performed
- **Porters & Supervisors**: Staff involved in task execution
- **Shifts**: Work periods during which tasks are performed
- **Tasks**: Individual porter jobs with origin, destination, and status
- **Porter Assignments**: Department assignments during shifts

### Verifying Setup

After applying the schema and seed data, you should be able to:

1. Start a new shift using any of the supervisors in the seed data (e.g., "Dr. Sarah Williams")
2. See sample data in the Settings sections (buildings, departments, job categories, etc.)
3. Create new tasks using the pre-populated locations and job types

If you need to clear the database and start over, you can run the TRUNCATE statements at the beginning of the enhanced-seed.sql file separately.
