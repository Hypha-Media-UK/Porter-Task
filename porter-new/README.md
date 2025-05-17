# Porter Task Manager

A streamlined application for managing hospital porter tasks, built with Vue 3, TypeScript, Pinia, and Supabase.

## Overview

This application helps hospital supervisors track and manage porter tasks during shifts. It provides functionality for:

- Managing shifts (day and night)
- Creating and tracking tasks
- Assigning porters to tasks
- Assigning porters to department designations
- Managing locations (buildings and departments)
- Configuring task types and default locations
- Viewing task history and archived shifts

## Project Structure

```
/porter-new
├── public/             # Static assets
├── src/
│   ├── assets/         # CSS, images, and other assets
│   ├── components/     # Reusable Vue components
│   ├── stores/         # Pinia stores for state management
│   ├── types/          # TypeScript types and interfaces
│   ├── utils/          # Utility functions
│   ├── views/          # Vue components for different routes
│   ├── App.vue         # Root Vue component
│   ├── main.ts         # Application entry point
│   └── router/         # Vue Router configuration
└── supabase/           # Supabase related files (schema, seed data)
```

## Setup and Installation

### Prerequisites

- Node.js (v14+)
- npm or yarn
- A Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd porter-new
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables by creating a `.env` file:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_KEY=your-supabase-key
```

4. Initialize the database:
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Copy and run the contents of `supabase/schema.sql` to create the database schema
   - (Optional) Copy and run the contents of `supabase/seed.sql` to add test data

5. Start the development server:
```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

## Features

### Home Screen
- View the current shift or start a new shift
- Select supervisor for new shifts
- Switch between day and night shifts

### Shift Management
- View shift details and statistics
- Add or remove porters
- Assign porters to departments
- View pending and completed tasks

### Task Form
- Create new tasks with time received, task type, locations, and porter assignment
- Set default locations based on task type
- Mark tasks as completed or pending

### Settings
- Manage buildings and departments
- Configure task types and item types
- Set default locations for task types
- Manage staff (supervisors and porters)
- Configure department designations and shift schedules

### Offline Support
The application supports offline operations, with data synchronization when back online.

## Technology Stack

- **Frontend:** Vue 3, TypeScript, Pinia, Vue Router
- **Styling:** Plain CSS with variables
- **Backend:** Supabase (PostgreSQL database)
- **Build Tool:** Vite

## License

[MIT License](LICENSE)
