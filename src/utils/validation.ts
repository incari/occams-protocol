export function validateWeight(weight: string | number): { valid: boolean; value?: number; error?: string } {
  if (weight === '' || weight === null || weight === undefined) {
    return { valid: false, error: 'Weight is required' };
  }

  const numWeight = typeof weight === 'string' ? parseFloat(weight) : weight;

  if (isNaN(numWeight)) {
    return { valid: false, error: 'Weight must be a number' };
  }

  if (numWeight < 0) {
    return { valid: false, error: 'Weight must be positive' };
  }

  if (numWeight > 1000) {
    return { valid: false, error: 'Weight seems too high' };
  }

  return { valid: true, value: numWeight };
}

export function validateDate(date: string): { valid: boolean; error?: string } {
  if (!date) {
    return { valid: false, error: 'Date is required' };
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }

  return { valid: true };
}

export function validateVariant(variant: string): { valid: boolean; error?: string } {
  if (variant !== 'A' && variant !== 'B') {
    return { valid: false, error: 'Invalid variant' };
  }
  return { valid: true };
}

export function validateHeight(height: string | number, unit: 'cm' | 'inches'): { valid: boolean; value?: number; error?: string } {
  if (height === '' || height === null || height === undefined) {
    return { valid: false, error: 'Height is required' };
  }

  const numHeight = typeof height === 'string' ? parseFloat(height) : height;

  if (isNaN(numHeight)) {
    return { valid: false, error: 'Height must be a number' };
  }

  if (numHeight < 0) {
    return { valid: false, error: 'Height must be positive' };
  }

  // Range validation: 100-250 cm or 39-98 inches
  const min = unit === 'cm' ? 100 : 39;
  const max = unit === 'cm' ? 250 : 98;
  
  if (numHeight < min || numHeight > max) {
    return { valid: false, error: `Height must be between ${min} and ${max} ${unit}` };
  }

  return { valid: true, value: numHeight };
}

export function validateBodyFat(bodyFat: string | number): { valid: boolean; value?: number; error?: string } {
  if (bodyFat === '' || bodyFat === null || bodyFat === undefined) {
    return { valid: false, error: 'Body fat percentage is required' };
  }

  const numBodyFat = typeof bodyFat === 'string' ? parseFloat(bodyFat) : bodyFat;

  if (isNaN(numBodyFat)) {
    return { valid: false, error: 'Body fat must be a number' };
  }

  if (numBodyFat < 0 || numBodyFat > 100) {
    return { valid: false, error: 'Body fat must be between 0 and 100%' };
  }

  return { valid: true, value: numBodyFat };
}

export function validateMeasurement(value: string | number, unit: 'cm' | 'inches', fieldName: string): { valid: boolean; value?: number; error?: string } {
  if (value === '' || value === null || value === undefined) {
    return { valid: false, error: `${fieldName} is required` };
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }

  if (numValue < 0) {
    return { valid: false, error: `${fieldName} must be positive` };
  }

  // Reasonable range: 10-200 cm or 4-79 inches
  const min = unit === 'cm' ? 10 : 4;
  const max = unit === 'cm' ? 200 : 79;
  
  if (numValue < min || numValue > max) {
    return { valid: false, error: `${fieldName} must be between ${min} and ${max} ${unit}` };
  }

  return { valid: true, value: numValue };
}
