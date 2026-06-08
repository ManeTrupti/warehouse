/**
 * Shift validation utilities
 * Validates shift duration and other shift-related rules
 */

/**
 * Validates if shift duration is exactly 8 hours
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @returns {object} { isValid: boolean, error: string | null }
 */
export function validateShiftDuration(startTime, endTime) {
  if (!startTime || !endTime) {
    return { isValid: false, error: 'Start time and end time are required' };
  }

  const start = new Date(`2000-01-01T${startTime}`);
  let end = new Date(`2000-01-01T${endTime}`);
  
  // Handle overnight shifts
  if (end <= start) {
    end = new Date(`2000-01-02T${endTime}`);
  }
  
  const diffMs = end - start;
  const diffHours = diffMs / (1000 * 60 * 60);
  
  if (Math.abs(diffHours - 8) > 0.01) { // Allow small floating point differences
    return { 
      isValid: false, 
      error: `Shift duration must be exactly 8 hours. Current duration: ${diffHours.toFixed(2)} hours` 
    };
  }
  
  return { isValid: true, error: null };
}

/**
 * Calculates the duration between start and end time
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @returns {number} Duration in hours
 */
export function calculateShiftDuration(startTime, endTime) {
  if (!startTime || !endTime) {
    return 0;
  }

  const start = new Date(`2000-01-01T${startTime}`);
  let end = new Date(`2000-01-01T${endTime}`);
  
  // Handle overnight shifts
  if (end <= start) {
    end = new Date(`2000-01-02T${endTime}`);
  }
  
  const diffMs = end - start;
  const diffHours = diffMs / (1000 * 60 * 60);
  
  return diffHours;
}

