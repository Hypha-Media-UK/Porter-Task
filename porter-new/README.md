# Porter Task Manager Application

A streamlined application for hospital porter task management, designed to assist Supervisors in tracking porter tasks during shifts.

## Overview

This application allows for:
- Shift management (starting, ending, and reopening shifts)
- Task assignment and tracking
- Assignment of porters to departments
- Comprehensive settings management
- Offline capabilities with automatic sync

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- npm (v6+)
- Supabase account and project

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   cd porter-new
   npm install
   ```

3. Copy `.env.example` to `.env` and update with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_KEY=your_supabase_anon_key
   ```

4. Initialize the database:
   - Navigate to your Supabase project dashboard
   - Open the SQL Editor
   - Copy and paste the contents of `supabase/schema.sql` and execute to create the tables
   - Copy and paste the contents of `supabase/enhanced-seed.sql` and execute to populate test data

5. Start the development server:
   ```
   npm run dev
   ```

## Application Structure

### Key Components

- **Home View**: Manage shifts (start, end, reopen)
- **Task Management**: Create, track, and complete tasks
- **Settings**: Configure buildings, departments, job categories, and staff

### Task Management Features

The task management functionality includes:

1. **Task Form**:
   - Auto-populates origin/destination based on task types
   - Sets default current time for received and allocated fields
   - Tracks porter assignment to tasks

2. **Task List**:
   - Filters between pending and completed tasks
   - Displays journey information (from/to)
   - Shows assigned porter and timing details

3. **Default Locations**:
   - Certain task types can have preferred origin/destination locations
   - Speeds up task creation by pre-filling appropriate fields

### Database Schema

The database uses a relational model with these key tables:

- **Buildings & Departments**: Physical locations in the hospital
- **Job Categories & Items**: Types of tasks that can be performed
- **Porters & Supervisors**: Staff involved in task execution
- **Shifts**: Work periods during which tasks are performed
- **Tasks**: Individual porter jobs with origin, destination, and status
- **Porter Assignments**: Department assignments during shifts

## Data Seeding

The application includes two options for seed data:

1. **Basic Seed Data** (`seed.sql`): Minimal data set for basic functionality
2. **Enhanced Seed Data** (`enhanced-seed.sql`): Rich data set optimized for testing task management features

The enhanced seed data provides:
- More realistic hospital department structure
- Comprehensive task types and categories
- Default location mappings for common tasks
- Sample current and past shifts with tasks
- Porter department assignments

## Development Notes

### Project Structure

- `/src/components`: Reusable Vue components
- `/src/stores`: Pinia stores for state management
- `/src/views`: Application pages
- `/src/utils`: Utility functions
- `/src/types`: TypeScript type definitions
- `/supabase`: Database setup and seed files

### Key Files for Task Management

- `src/views/TaskFormView.vue`: Task creation/editing form
- `src/views/TasksView.vue`: Task listing and filtering
- `src/stores/taskStore.ts`: Task data management and operations
- `src/types/index.ts`: Type definitions for tasks and related entities

## Offline Capabilities

The application supports offline operation with local storage caching and automatic synchronization when connectivity is restored.
