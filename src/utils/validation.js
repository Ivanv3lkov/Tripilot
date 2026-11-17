const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

export function validateFullName(value) {
  const name = value.trim().replace(/\s+/g, " ");
  if (!name) return "Full name is required.";
  if (name.length < 2) return "Full name must be at least 2 characters.";
  if (name.length > 60) return "Full name must be at most 60 characters.";
  return null;
}

export function validateEmail(value) {
  const email = normalizeEmail(value);
  if (!email) return "Email is required.";
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address.";
  return null;
}

export function validatePassword(value) {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return "Password must contain at least one letter and one number.";
  }
  return null;
}

export function validateRepeatPassword(password, repeatPassword) {
  if (!repeatPassword) return "Please repeat your password.";
  if (password !== repeatPassword) return "Passwords do not match.";
  return null;
}

function compact(errors) {
  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => message),
  );
}

export function validateLoginForm({ email, password }) {
  return compact({
    email: validateEmail(email),
    password: password ? null : "Password is required.",
  });
}

export function validateRegisterForm({
  fullName,
  email,
  password,
  repeatPassword,
}) {
  return compact({
    fullName: validateFullName(fullName),
    email: validateEmail(email),
    password: validatePassword(password),
    repeatPassword: validateRepeatPassword(password, repeatPassword),
  });
}
