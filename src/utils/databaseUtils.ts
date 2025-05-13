import { supabase } from './supabase'

/**
 * Check if the database is empty and needs migration
 * @returns Promise<boolean> true if the database is empty
 */
export async function checkNeedsMigration(): Promise<boolean> {
  try {
    // Check if we have key tables populated
    const { count: supervisorsCount, error: supervisorsError } = await supabase
      .from('supervisors')
      .select('*', { count: 'exact', head: true })
    
    if (supervisorsError) {
      console.error('Error checking supervisors table:', supervisorsError)
      return true
    }
    
    const { count: buildingsCount, error: buildingsError } = await supabase
      .from('buildings')
      .select('*', { count: 'exact', head: true })
    
    if (buildingsError) {
      console.error('Error checking buildings table:', buildingsError)
      return true
    }
    
    const { count: jobCategoriesCount, error: categoriesError } = await supabase
      .from('job_categories')
      .select('*', { count: 'exact', head: true })
    
    if (categoriesError) {
      console.error('Error checking job_categories table:', categoriesError)
      return true
    }
    
    // If any key table is empty, we need to migrate
    return (
      supervisorsCount === 0 || 
      buildingsCount === 0 || 
      jobCategoriesCount === 0
    )
  } catch (error) {
    console.error('Error checking if database needs migration:', error)
    return true  // Default to true in case of error
  }
}
