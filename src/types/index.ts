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
  supervisors: Supervisor[];
  porters: Porter[];
  jobCategories: JobCategoriesMap;
  jobCategoryDefaults: JobCategoryDefault[];
  shifts: ShiftSchedule;
  designationDepartments: DesignationDepartment[];
  [key: string]: any;
}

// Location types
export interface LocationItem {
  id: string;
  name: string;
  frequent?: boolean;
  order?: number;
}

export interface Building {
  id: string;
  name: string;
  departments: LocationItem[];
}

export interface Location {
  building: string; // Building ID
  locationId: string; // Department ID
  displayName: string; // Full display name
  locationType?: 'department' | 'ward'; // Type of location
}

// Supabase table types
export interface SupabaseBuilding {
  id: string;
  name: string;
  created_at?: string;
}

export interface SupabaseDepartment {
  id: string;
  building_id: string;
  name: string;
  created_at?: string;
}

export interface SupabaseJobCategory {
  id: string;
  category: string;
  item_type: string | null;
  created_at?: string;
}

export interface SupabaseJobCategoryDefault {
  id: string;
  category: string;
  item_type: string | null;
  from_building_id: string | null;
  from_location_id: string | null;
  to_building_id: string | null;
  to_location_id: string | null;
  created_at?: string;
}

export interface SupabaseDesignationDepartment {
  id: string;
  name: string;
  color: string;
  created_at?: string;
}

export interface SupabaseShift {
  id: string;
  date: string;
  type: ShiftType;
  supervisor: string;
  start_time: string;
  end_time: string | null;
  created_at?: string;
}

export interface SupabaseTask {
  id: string;
  shift_id: string;
  received_time: string;
  allocated_time: string;
  completed_time: string | null;
  status: TaskStatus;
  job_category: string;
  item_type: string;
  from_building: string;
  from_location_id: string;
  to_building: string;
  to_location_id: string;
  allocated_staff: string | null;
  created_at?: string;
}

export interface SupabasePorterAssignment {
  id: string;
  shift_id: string;
  porter_id: string;
  department_id: string;
  start_time: string;
  end_time: string | null;
  notes: string | null;
  created_at?: string;
}

export interface SupabaseShiftAssignedPorter {
  id: string;
  shift_id: string;
  porter_id: string;
  created_at?: string;
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
  assignedPorters?: Porter[]; // Porters assigned to this shift
  porterAssignments?: PorterAssignment[];  // Department assignments for porters
}

// Designation departments (different from location departments)
export interface DesignationDepartment {
  id: string;
  name: string;
  color: string; // Color code for UI display
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
