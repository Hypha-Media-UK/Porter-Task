/**
 * Helper functions to add the is_active flag to the shifts table
 * This uses regular Supabase client methods instead of raw SQL
 */

import { supabase } from './supabase';

/**
 * Run the migration to add the is_active flag
 */
export async function runMigration() {
  try {
    console.log('Adding is_active flag to shifts table...');
    
    // Step 1: Update all shifts to have is_active=false by default
    // Note: We can't add columns through the JS client, but we can still
    // set values for the column (which will be added if doesn't exist)
    const { error: updateError } = await supabase
      .from('shifts')
      .update({ is_active: false })
      .neq('id', 'dummy'); // This will update all rows
    
    if (updateError) {
      console.error('Error setting default is_active values:', updateError);
    } else {
      console.log('Set default is_active=false for all shifts');
    }
    
    // Step 2: Find the most recent active shift (no end_time)
    const { data: activeShifts, error: findError } = await supabase
      .from('shifts')
      .select('id, start_time')
      .is('end_time', null)
      .order('start_time', { ascending: false })
      .limit(1);
    
    if (findError) {
      console.error('Error finding active shifts:', findError);
    } else if (activeShifts && activeShifts.length > 0) {
      const activeShiftId = activeShifts[0].id;
      console.log(`Found active shift to mark: ${activeShiftId}`);
      
      // Step 3: Mark the active shift
      const { error: markError } = await supabase
        .from('shifts')
        .update({ is_active: true })
        .eq('id', activeShiftId);
      
      if (markError) {
        console.error('Error marking active shift:', markError);
      } else {
        console.log(`Successfully marked shift ${activeShiftId} as active`);
      }
    } else {
      console.log('No active shifts found to mark');
    }
    
    // Verify the migration worked
    const { data, error: verifyError } = await supabase
      .from('shifts')
      .select('id, is_active')
      .order('is_active', { ascending: false })
      .limit(5);
    
    if (verifyError) {
      console.error('Error verifying migration:', verifyError);
      return false;
    } else {
      console.log('Verified migration - sample shifts data:', data);
      return true;
    }
  } catch (error) {
    console.error('Unexpected error during migration:', error);
    return false;
  }
}
