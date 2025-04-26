# Porter Track

A hospital porter task tracking application that helps manage and track porter tasks and shifts.

## Features

- Create and manage porter shifts
- Track tasks with real-time status updates
- View task details and history
- Archive completed shifts
- Customize job categories and supervisors
- Location-based task management

## Project Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
porter-track/
├── public/               # Static assets
│   ├── favicon.svg       # App icon
│   └── data/             # Sample data files
│       ├── locations.json
│       └── settings.json
├── src/
│   ├── assets/           # CSS and other assets
│   ├── components/       # Reusable Vue components
│   ├── router/           # Vue Router configuration
│   ├── stores/           # Pinia state stores
│   ├── types/            # TypeScript interfaces and types
│   ├── utils/            # Utility functions
│   ├── views/            # Page components
│   ├── App.vue           # Root component
│   └── main.ts           # Application entry point
├── index.html            # HTML template
└── vite.config.ts        # Vite configuration
```

## Technology Stack

- Vue 3 with Composition API
- TypeScript
- Vue Router for navigation
- Pinia for state management
- Vite for build tooling

## Data Structure

The application manages porter tasks within shifts. Each shift contains multiple tasks that can be tracked from creation to completion.

### Shifts
- Each shift has a supervisor, date, start and end time
- Shifts track all tasks created during the shift period

### Tasks
- Tasks include from/to locations, job category, and item type
- Tasks move through statuses: Pending → Completed

## Customization

The application supports customization through the Settings screen:
- Add/remove supervisors
- Manage job categories and item types
- Configure location data
