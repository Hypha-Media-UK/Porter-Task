# Porter Department Assignment Design

## Overview

This document outlines the design for a new feature that allows supervisors to assign porters to specific departments during a shift, with the ability to specify time periods for these assignments.

## Data Structure

We need to extend the existing data model to include department assignments:

```typescript
// New types to add to src/types/index.ts

// Designation departments (different from location departments)
export interface DesignationDepartment {
  id: string;
  name: string;
}

// Time-based porter assignment to a department
export interface PorterAssignment {
  id: string;
  porterId: string;  // Reference to porter's name
  departmentId: string;  // Reference to designation department
  startTime: string;  // ISO string
  endTime?: string;  // ISO string, optional (null means "until end of shift")
  notes?: string;  // Optional notes about the assignment
}

// Extension to the Shift interface
export interface Shift {
  // ... existing properties
  assignedPorters?: Porter[];
  porterAssignments?: PorterAssignment[];  // New property
}
```

## UI Implementation

### 1. Porters Tab Enhancement

The Porters tab in the Shift Management screen would be enhanced with a new section for department assignments:

#### Layout:

```
+--------------------------------------------------+
| PORTERS TAB                                      |
+--------------------------------------------------+
| ASSIGNED PORTERS                                 |
| [Porter 1]  [Porter 2]  [Porter 3]  [Add Porter] |
+--------------------------------------------------+
| DEPARTMENT ASSIGNMENTS                           |
|                                                  |
| +----------------+  +----------------+           |
| | A+E            |  | Pharmacy       |           |
| |                |  |                |           |
| | Porter 1       |  | Porter 3       |           |
| | 9:00 - 12:00   |  | 10:30 -        |           |
| |                |  |                |           |
| | [Edit] [Remove]|  | [Edit] [Remove]|           |
| +----------------+  +----------------+           |
|                                                  |
| +----------------+  +----------------+           |
| | MRI            |  | CT             |           |
| |                |  |                |           |
| | Porter 2       |  | Porter 1       |           |
| | 10:00 - 14:00  |  | 13:00 - 16:00  |           |
| |                |  |                |           |
| | [Edit] [Remove]|  | [Edit] [Remove]|           |
| +----------------+  +----------------+           |
|                                                  |
| [+ Assign Porter to Department]                  |
+--------------------------------------------------+
```

#### Assignment Modal:

When the user clicks "Assign Porter to Department", a modal appears:

```
+-----------------------------------------------+
| ASSIGN PORTER TO DEPARTMENT                   |
+-----------------------------------------------+
| Porter:      [Dropdown of available porters]  |
| Department:  [Dropdown of departments]        |
| Start time:  [Time picker] (default: now)     |
| End time:    [Time picker] (optional)         |
| Notes:       [Text area]                      |
|                                               |
| [Cancel]                [Assign]              |
+-----------------------------------------------+
```

#### Porter Card with Assignments:

When viewing a porter in the list, we can show their current/upcoming assignments:

```
+-----------------------------------------------+
| John Smith                                    |
| Currently: A+E (until 12:00)                  |
| Next: CT (13:00 - 16:00)                      |
| [View All Assignments]                        |
+-----------------------------------------------+
```

### 2. Settings Screen Enhancement

Add a new section to the App Settings tab:

```
+-----------------------------------------------+
| DESIGNATION DEPARTMENTS                       |
+-----------------------------------------------+
| These departments are used for porter         |
| assignments during shifts.                    |
|                                               |
| [A+E]      [Edit] [Delete]                    |
| [CT]       [Edit] [Delete]                    |
| [MRI]      [Edit] [Delete]                    |
| [AMU]      [Edit] [Delete]                    |
| [Pharmacy] [Edit] [Delete]                    |
| [Meals]    [Edit] [Delete]                    |
|                                               |
| [+ Add Department]                            |
+-----------------------------------------------+
```

## Implementation Details

### Store Updates

1. Add new state for designation departments in the settings store
2. Add new methods for managing porter assignments in the shift store
3. Implement persistence for these new data elements

### Component Creation

1. `PorterAssignmentCard.vue` - A card showing a department and its assigned porters
2. `AssignPorterModal.vue` - Modal for creating/editing assignments
3. `DesignationDepartmentManager.vue` - For the settings screen

### Visual Enhancements

1. Color-code departments for easy identification
2. Show timeline view of porter assignments
3. Add notifications for assignment start/end times

## Timeline View

For a more advanced implementation, we could add a timeline view showing porter assignments across departments:

```
                 9:00    10:00    11:00    12:00    13:00    14:00    15:00    16:00
Porter 1    |    [      A+E      ]         [            CT             ]
Porter 2    |          [         MRI                ]
Porter 3    |                    [             Pharmacy                    ]
```

This would provide an at-a-glance view of who is assigned where throughout the day.
