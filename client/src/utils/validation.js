export const validateEmail = (email) =>
  /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);

export const validatePassword = (password) => {
  const errors = [];
  if (password.length < 6) errors.push('At least 6 characters');
  if (!/\d/.test(password)) errors.push('At least one number');
  return errors;
};

export const passwordStrength = (password) => {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: 'Weak', percent: 25, color: '#ef4444' };
  if (score <= 3) return { label: 'Medium', percent: 60, color: '#f59e0b' };
  return { label: 'Strong', percent: 100, color: '#10b981' };
};

export const validateRequired = (value) => value !== undefined && value !== null && `${value}`.trim() !== '';

export const validateDateRange = (start, end) => {
  if (!start || !end) return true;
  return new Date(end) >= new Date(start);
};
