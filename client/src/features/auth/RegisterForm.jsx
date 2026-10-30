import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
} from 'react-icons/hi';

import {
  validateFullName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  getPasswordStrength,
} from '../../lib/validators';

import LoadingSpinner from '../../components/common/LoadingSpinner';


// IMPORTANT: InputField is OUTSIDE RegisterForm
// This prevents the input from losing focus while typing.
function InputField({
  id,
  name,
  label,
  type = 'text',
  icon: Icon,
  placeholder,
  autoComplete,
  showToggle,
  isToggled,
  onToggle,
  value,
  onChange,
  fieldError,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
      >
        {label}
      </label>

      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />

        <input
          id={id}
          name={name}
          type={showToggle ? (isToggled ? 'text' : 'password') : type}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pl-11 ${
            showToggle ? 'pr-12' : 'pr-4'
          } py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            fieldError
              ? 'border-red-400 dark:border-red-600'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        />

        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label={isToggled ? 'Hide password' : 'Show password'}
          >
            {isToggled ? (
              <HiOutlineEyeOff className="h-5 w-5" />
            ) : (
              <HiOutlineEye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      {fieldError && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {fieldError}
        </p>
      )}
    </div>
  );
}


export default function RegisterForm({ onSubmit, error, clearError }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordStrength = getPasswordStrength(formData.password);


  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    if (error) {
      clearError();
    }
  };


  const validate = () => {
    const errors = {};

    const nameErr = validateFullName(formData.fullName);
    const emailErr = validateEmail(formData.email);
    const passErr = validatePassword(formData.password);

    const confirmErr = validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    );

    if (nameErr) errors.fullName = nameErr;
    if (emailErr) errors.email = emailErr;
    if (passErr) errors.password = passErr;
    if (confirmErr) errors.confirmPassword = confirmErr;

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await onSubmit(
        formData.fullName.trim(),
        formData.email.trim(),
        formData.password,
        formData.confirmPassword
      );
    } catch {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

      {/* Server error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm animate-fade-in">
          {error}
        </div>
      )}


      {/* Full Name */}
      <InputField
        id="fullName"
        name="fullName"
        label="Full name"
        icon={HiOutlineUser}
        placeholder="Your full name"
        autoComplete="name"
        value={formData.fullName}
        onChange={handleChange}
        fieldError={fieldErrors.fullName}
      />


      {/* Email */}
      <InputField
        id="email"
        name="email"
        label="Email address"
        type="email"
        icon={HiOutlineMail}
        placeholder="you@example.com"
        autoComplete="email"
        value={formData.email}
        onChange={handleChange}
        fieldError={fieldErrors.email}
      />


      {/* Password */}
      <div>
        <InputField
          id="password"
          name="password"
          label="Password"
          icon={HiOutlineLockClosed}
          placeholder="At least 6 characters"
          autoComplete="new-password"
          showToggle
          isToggled={showPassword}
          onToggle={() => setShowPassword(!showPassword)}
          value={formData.password}
          onChange={handleChange}
          fieldError={fieldErrors.password}
        />

        {formData.password && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    level <= passwordStrength.score
                      ? passwordStrength.color
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>

            {passwordStrength.label && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Strength:{' '}
                <span className="font-medium">
                  {passwordStrength.label}
                </span>
              </p>
            )}
          </div>
        )}
      </div>


      {/* Confirm Password */}
      <InputField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm password"
        icon={HiOutlineLockClosed}
        placeholder="Repeat your password"
        autoComplete="new-password"
        showToggle
        isToggled={showConfirm}
        onToggle={() => setShowConfirm(!showConfirm)}
        value={formData.confirmPassword}
        onChange={handleChange}
        fieldError={fieldErrors.confirmPassword}
      />


      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
      >
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" className="text-white" />
            <span>Creating account...</span>
          </>
        ) : (
          'Create account'
        )}
      </button>


      {/* Login Link */}
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}

        <Link
          to="/login"
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>

    </form>
  );
}