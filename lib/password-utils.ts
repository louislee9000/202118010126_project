import crypto from 'crypto';

/**
 * Encrypt password using PBKDF2 algorithm
 * @param password Original password
 * @returns Encrypted string in format 'salt:iterations:hash'
 */
export function encryptPassword(password: string): string {
  // Generate random salt
  const salt = crypto.randomBytes(16).toString('hex');
  // Set iteration count
  const iterations = 100000;
  // Generate hash
  const hash = crypto.pbkdf2Sync(
    password,
    salt,
    iterations,
    64,
    'sha512'
  ).toString('hex');

  // Return formatted string containing salt, iterations, and hash
  return `${salt}:${iterations}:${hash}`;
}

/**
 * Verify if password matches
 * @param plainPassword Original password
 * @param hashedPassword Encrypted password string (format: salt:iterations:hash)
 * @returns Whether password matches
 */
export function verifyPassword(plainPassword: string, hashedPassword: string): boolean {
  try {
    // Parse stored password string
    const [salt, iterations, storedHash] = hashedPassword.split(':');
    
    // Recalculate hash using same parameters
    const hash = crypto.pbkdf2Sync(
      plainPassword,
      salt,
      parseInt(iterations),
      64,
      'sha512'
    ).toString('hex');

    // Compare hash values
    return storedHash === hash;
  } catch (error) {
    console.error('Password verification failed:', error);
    return false;
  }
}

