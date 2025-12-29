import DOMPurify from 'isomorphic-dompurify';

export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    // Sanitize HTML content to prevent XSS
    return DOMPurify.sanitize(input.trim());
  }
  
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }
  
  if (typeof input === 'object' && input !== null) {
    const cleanObj: any = {};
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        cleanObj[key] = sanitizeInput(input[key]);
      }
    }
    return cleanObj;
  }
  
  return input;
};

// Validate if email format is correct
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const isStrongPassword = (password: string): boolean => {
  // Min 8 chars, at least one uppercase, one lowercase, one number
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /[0-9]/.test(password);
};
