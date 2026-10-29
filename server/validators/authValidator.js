/**
 * Validate registration input fields.
 * Returns an object with { isValid, errors }.
 */
const validateRegister = (data) => {
  const errors = {};

  // Full Name
  if (!data.fullName || !data.fullName.trim()) {
    errors.fullName = 'Full name is required';
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = 'Name must be at least 2 characters';
  } else if (data.fullName.trim().length > 50) {
    errors.fullName = 'Name cannot exceed 50 characters';
  }

  // Email
  if (!data.email || !data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  // Password
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  // Confirm Password
  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate login input fields.
 * Returns an object with { isValid, errors }.
 */
const validateLogin = (data) => {
  const errors = {};

  if (!data.email || !data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

module.exports = { validateRegister, validateLogin };
