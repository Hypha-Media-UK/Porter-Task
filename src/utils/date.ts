/**
 * Date formatting utility functions
 */

/**
 * Format a date to a user-friendly string (e.g., "15 Apr 2025")
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Format a date to show only time (e.g., "14:30")
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

/**
 * Format a duration between two dates in hours and minutes
 */
export function formatDuration(start: string | Date, end: string | Date): string {
  if (!start || !end) return '--';
  
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  
  const durationMs = endDate.getTime() - startDate.getTime();
  if (durationMs < 0) return '--';
  
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
}

/**
 * Get relative time (e.g., "2 hours ago", "5 minutes ago")
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  // Less than a minute
  if (diffMs < 60 * 1000) {
    return 'Just now';
  }
  
  // Less than an hour
  if (diffMs < 60 * 60 * 1000) {
    const minutes = Math.floor(diffMs / (60 * 1000));
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  
  // Less than a day
  if (diffMs < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diffMs / (60 * 60 * 1000));
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  
  // Less than a week
  if (diffMs < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
  
  // Use standard date format for older dates
  return formatDate(date);
}
