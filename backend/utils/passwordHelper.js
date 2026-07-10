const crypto = require('crypto');

/**
 * Hash a password using PBKDF2
 * @param {string} password 
 * @returns {string} - formatted as salt:hash
 */
const hashPassword = (password) => {
  if (!password) return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

/**
 * Verify a password against a hash
 * @param {string} password 
 * @param {string} storedHash - formatted as salt:hash
 * @returns {boolean}
 */
const verifyPassword = (password, storedHash) => {
  if (!password || !storedHash) return false;
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, originalHash] = parts;
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
};

module.exports = { hashPassword, verifyPassword };
