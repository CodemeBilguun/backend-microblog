export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  // At least 8 characters, one uppercase letter, one lowercase letter, one number
  return password.length >= 8;
}

export function sanitizeInput(input: string): string {
  // Basic sanitization
  return input.trim();
}
