/**
 * Core data types for the Porter Task application
 */

// Basic types
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
  id: string;
  category: string;
  itemType?: string; // Optional specific item type within the category
  fromBuildingId?: string;
  fromLocationId?: string;
  toBuildingId?: string;
  toLocationId?: string;
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
  supervisors: Supervisor[];
  porters: Porter[];
  jobCategories: JobCategoriesMap;
  jobCategoryDefaults: JobCategoryDefault[];
  shifts: ShiftSchedule;
  designationDepartments: DesignationDepartment[];
}

// Location types
export interface Department {
  id: string;
  name: string;
  frequent?: boolean;
  order?: number;
}

export interface Building {
  id: string;
  name: string;
  departments: Department[];
}

export interface Location {
  id: string;
  buildingId: string;
  buildingName: string;
  name: string;
  frequent?: boolean;
}

export interface LocationReference {
  buildingId: string;
  locationId: string;
  displayName: string;
}

// Task interface
export interface Task {
  id: string;
  shiftId: string;
  receivedTime: string; // ISO string
  jobCategory: string;
  itemType: string;
  fromLocation: LocationReference;
  toLocation: LocationReference;
  allocatedStaff?: string; // Optional
  allocatedTime: string; // ISO string
  completedTime?: string; // ISO string, optional
  status: TaskStatus;
  createdAt: string; // ISO string
}

// Porter assignment to department
export interface PorterAssignment {
  id: string;
  shiftId: string;
  porterId: string;
  departmentId: string;
  startTime: string; // ISO string
  endTime?: string; // ISO string, optional
  notes?: string; // Optional notes
}

// Shift interface
export interface Shift {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  type: ShiftType;
  supervisor: Supervisor;
  startTime: string; // ISO string
  endTime?: string; // ISO string, optional if shift is still ongoing
  tasks: Task[];
  assignedPorters: Porter[]; // Porters assigned to this shift
  porterAssignments: PorterAssignment[]; // Department assignments for porters
  createdAt: string; // ISO string
}

// Designation departments (different from location departments)
export interface DesignationDepartment {
  id: string;
  name: string;
  color: string; // Color code for UI display
}

// Form types
export interface TaskFormData {
  jobCategory: string;
  itemType: string;
  fromLocation: string; // LocationId
  toLocation: string; // LocationId
  allocatedStaff?: string;
  receivedTime: string; // HH:MM format
  allocatedTime: string; // HH:MM format
  completedTime?: string; // HH:MM format
  status?: TaskStatus;
}

// Route params
export interface RouteParams {
  [key: string]: string | undefined;
}

// Database transformation helpers
export interface SupabaseTask {
  id: string;
  shift_id: string;
  received_time: string;
  allocated_time: string;
  completed_time: string | null;
  status: TaskStatus;
  job_category: string;
  item_type: string;
  allocated_staff: string | null;
  from_building: string;
  from_location_id: string;
  to_building: string;
  to_location_id: string;
  created_at: string;
}

export interface SupabaseShift {
  id: string;
  date: string;
  type: ShiftType;
  supervisor: string;
  start_time: string;
  end_time: string | null;
  created_at: string;
}

export interface SupabasePorterAssignment {
  id: string;
  shift_id: string;
  porter_id: string;
  department_id: string;
  start_time: string;
  end_time: string | null;
  notes: string | null;
  created_at: string;
}

export interface SupabaseShiftAssignedPorter {
  id: string;
  shift_id: string;
  porter_id: string;
  created_at: string;
}
