/**
 * Core data types for the Porter Track application
 */

// Types for shift management
export type ShiftType = 'Day' | 'Night';
export type TaskStatus = 'Pending' | 'Completed';
export type Supervisor = string;
export type Porter = string;
export type ItemType = string;
export type JobCategory = string;

// Settings related types
export interface JobCategoriesMap {
  [category: string]: string[];
}

// Default location for job categories
export interface JobCategoryDefault {
  category: string;
  itemType?: string; // Optional specific item type within the category
  fromBuildingId?: string;
  fromLocationId?: string;
  fromLocationType?: 'department' | 'ward';
  toBuildingId?: string;
  toLocationId?: string;
  toLocationType?: 'department' | 'ward';
}

// Shift schedule types
export interface ShiftTime {
  start: string; // Format: "HH:MM"
  end: string;   // Format: "HH:MM"
}

export interface ShiftSchedule {
  day: ShiftTime;
  night: ShiftTime;
}

export interface SettingsData {
  supervisors?: Supervisor[];
  porters?: Porter[];
  jobCategories?: JobCategoriesMap;
  jobCategoryDefaults?: JobCategoryDefault[];
  shifts?: ShiftSchedule;
  [key: string]: any;
}

// Location types
export interface LocationItem {
  id: string;
  name: string;
}

export interface Building {
  id: string;
  name: string;
  departments: LocationItem[];
  wards: LocationItem[];
}

export interface Location {
  building: string; // Building ID
  locationId: string; // Department or Ward ID
  locationType: 'department' | 'ward';
  displayName: string; // Full display name
}

// Task interface
export interface Task {
  id: string;
  receivedTime: string; // ISO string
  jobCategory: string;
  fromLocation: Location;
  toLocation: Location;
  itemType: string;
  allocatedStaff?: string; // Optional
  allocatedTime: string; // ISO string
  completedTime?: string; // ISO string, optional
  status: TaskStatus;
}

// Shift interface
export interface Shift {
  id: string;
  date: string; // ISO string for date
  type: ShiftType;
  supervisor: Supervisor;
  startTime: string; // ISO string
  endTime?: string; // ISO string, optional if shift is still ongoing
  tasks: Task[];
}

// Route parameters
export interface RouteParams {
  taskId?: string;
  shiftId?: string;
  [key: string]: string | undefined;
}

// Locations data
export interface LocationsData {
  buildings: Building[];
}

// API response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
