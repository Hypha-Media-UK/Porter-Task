/**
 * Utility to force reload default category locations
 * 
 * This script forces a call to addJobCategoryDefaults to ensure
 * that all default locations are properly set up in the database.
 */

import { addJobCategoryDefaults } from '@/services/database';
import { supabase } from '@/utils/supabase';

/**
 * Reload all default locations
 * 
 * First clears existing defaults, then re-adds all default locations
 * from the database.ts file.
 */
export async function reloadAllDefaultLocations(): Promise<boolean> {
  try {
    console.log('Starting default locations reload...');
    
    // Check if we can connect to the database
    const { data, error: connectionError } = await supabase
      .from('settings')
      .select('*')
      .limit(1);
      
    if (connectionError) {
      console.error('Failed to connect to Supabase:', connectionError);
      return false;
    }
    
    console.log('Connected to Supabase database');
    
    // First, delete all existing job category defaults
    console.log('Removing existing job category defaults...');
    const { error: deleteError } = await supabase
      .from('job_category_defaults')
      .delete()
      .neq('id', ' '); // This will match all records
      
    if (deleteError) {
      console.error('Error deleting existing defaults:', deleteError);
      return false;
    }
    
    console.log('Successfully removed existing job category defaults');
    
    // Now add all defaults from our code
    const result = await addJobCategoryDefaults();
    
    if (result) {
      console.log('Successfully reloaded all default locations');
      return true;
    } else {
      console.error('Failed to add job category defaults');
      return false;
    }
  } catch (error) {
    console.error('Error during default locations reload:', error);
    return false;
  }
}
