/**
 * Validate registration input fields.
 * Returns an object with { isValid, errors }.
 */
const validateRegister = (data) => {
  const errors = {};

  const fullName = typeof data?.fullName === 'string' ? data.fullName.trim() : '';
  const email = typeof data?.email === 'string' ? data.email.trim() : '';
  const password = typeof data?.password === 'string' ? data.password : '';
  const confirmPassword = typeof data?.confirmPassword === 'string' ? data.confirmPassword : '';

  // Full Name
  if (!fullName) {
    errors.fullName = 'Full name is required';
  } else if (fullName.length < 2) {
    errors.fullName = 'Name must be at least 2 characters';
  } else if (fullName.length > 50) {
    errors.fullName = 'Name cannot exceed 50 characters';
  }

  // Email
  if (!email) {
    errors.email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password
  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  // Confirm Password
  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (password !== confirmPassword) {
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

  const email = typeof data?.email === 'string' ? data.email.trim() : '';
  const password = typeof data?.password === 'string' ? data.password : '';

  if (!email) {
    errors.email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

module.exports = { validateRegister, validateLogin };
