// Validators return translation keys ("validation.*"); forms translate them with t().
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

export function validateFullName(value) {
  const name = value.trim().replace(/\s+/g, " ");
  if (!name) return "validation.fullNameRequired";
  if (name.length < 2) return "validation.fullNameMin";
  if (name.length > 60) return "validation.fullNameMax";
  return null;
}

export function validateEmail(value) {
  const email = normalizeEmail(value);
  if (!email) return "validation.emailRequired";
  if (!EMAIL_PATTERN.test(email)) return "validation.emailInvalid";
  return null;
}

export function validatePassword(value) {
  if (!value) return "validation.passwordRequired";
  if (value.length < 8) return "validation.passwordMin";
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return "validation.passwordLettersNumbers";
  }
  return null;
}

export function validateRepeatPassword(password, repeatPassword) {
  if (!repeatPassword) return "validation.repeatPasswordRequired";
  if (password !== repeatPassword) return "validation.passwordsMismatch";
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
    password: password ? null : "validation.passwordRequired",
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

export function normalizeText(value) {
  return value.trim().replace(/\s+/g, " ");
}

export function validateTripTitle(value) {
  const title = normalizeText(value);
  if (!title) return "validation.titleRequired";
  if (title.length < 2) return "validation.titleMin";
  if (title.length > 100) return "validation.titleMax";
  return null;
}

export function validateLocation(value) {
  const location = normalizeText(value);
  if (!location) return "validation.locationRequired";
  if (location.length < 2) return "validation.locationMin";
  if (location.length > 120) return "validation.locationMax";
  return null;
}

export function validateVisitDate(value) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return "validation.dateRequired";
  }
  return null;
}

export function validateCategory(value, allowedValues) {
  if (!value) return "validation.categoryRequired";
  if (!allowedValues.includes(value)) return "validation.categoryInvalid";
  return null;
}

export function validateDescription(value) {
  if (value.trim().length > 1000) {
    return "validation.descriptionMax";
  }
  return null;
}

export function validateImageUrl(value) {
  const url = value.trim();
  if (!url) return null;
  if (!/^https:\/\/\S+$/i.test(url)) {
    return "validation.imageUrlInvalid";
  }
  if (url.length > 2048) return "validation.imageUrlTooLong";
  return null;
}

export function validateAttractionName(value) {
  const name = normalizeText(value);
  if (!name) return "validation.nameRequired";
  if (name.length < 2) return "validation.nameMin";
  if (name.length > 100) return "validation.nameMax";
  return null;
}

export function validateAttractionForm(values) {
  return compact({
    name: validateAttractionName(values.name),
    description: validateDescription(values.description),
  });
}

export function validateTripForm(values, allowedCategories) {
  return compact({
    title: validateTripTitle(values.title),
    location: validateLocation(values.location),
    visitDate: validateVisitDate(values.visitDate),
    category: validateCategory(values.category, allowedCategories),
    description: validateDescription(values.description),
    imageUrl:
      values.imageMode === "url" ? validateImageUrl(values.imageUrl) : null,
  });
}
