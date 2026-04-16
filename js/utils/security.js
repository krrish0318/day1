/**
 * Provides robust security utilities
 * Target: Zero Trust | Sanitization | UUID Anonymization
 */

/**
 * UUID generator to abstract away true identifiers of users.
 * Does not rely on Math.random alone for better entropy where `crypto` is supported.
 * @returns {string} An anonymized UUIDv4 string.
 */
export function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Validates against dangerous characters to prevent XSS payloads in string inputs.
 * @param {string} input - The raw user input.
 * @returns {string} A sanitized string.
 * @throws {Error} if malicious pattern detected.
 */
export function strictSanitize(input) {
    if (typeof input !== 'string') return '';
    
    // Validate for basic tag logic preventing DOM injection
    const tagRegex = /<[^>]+>/g;
    if (tagRegex.test(input)) {
        throw new Error("SecurityException: HTML Tags are strictly forbidden in user inputs.");
    }

    // Basic encode symbols
    let safeInput = input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    return safeInput.trim();
}

/**
 * Mock .env config parser.
 * Encapsulates keys logic as if loading securely.
 */
export const EnvConfig = {
    MOCK_GOOGLE_API_KEY: "AIza-MockLayer-RestrictedKeyOps-v2",
    MOCK_PUB_SUB_TOPIC: "projects/my-venue/topics/emergency",
    GET_API: () => {
        // Simulating a strict token validation
        return `Bearer ${generateUUID()}-TOKEN`;
    }
};

/**
 * Global rate-limiter simulation to prevent DoS via repeated interaction.
 */
const RateLimitCache = new Map();

/**
 * Checks if a specific action by a user exceeds the allowed limit.
 * @param {string} actionKey 
 * @param {number} maxRequests 
 * @param {number} windowMs 
 * @throws {Error} if rate limit exceeded.
 */
export function enforceRateLimit(actionKey, maxRequests = 3, windowMs = 5000) {
    const now = Date.now();
    const records = RateLimitCache.get(actionKey) || [];

    // Clean old requests out of window
    const activeRecords = records.filter(timestamp => now - timestamp < windowMs);
    
    if (activeRecords.length >= maxRequests) {
        throw new Error("RateLimitException: Too many requests, please slow down to prevent overwhelming the Venue engine.");
    }

    activeRecords.push(now);
    RateLimitCache.set(actionKey, activeRecords);
}
