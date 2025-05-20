export function validatePassword(password: string | null) {
  if (!password) return false;
  // Regular expression for validation
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Test the password against the regex
  return regex.test(password);
}
