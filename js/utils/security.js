"use strict";

/**
 * Security and Hardening Utilities.
 * Enforces Zero Trust data models and prevents basic DDOS/XSS exploitation loops.
 */

/**
 * Pseudo-random UUID generator leveraging Crypto API for strong entropy, abstracting identifiable user states.
 * @returns {string} An anonymized UUIDv4 formatted string.
 */
export function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(characterSymbol) {
        const randomInt = Math.random() * 16 | 0;
        const valueMapping = characterSymbol === 'x' ? randomInt : (randomInt & 0x3 | 0x8);
        return valueMapping.toString(16);
    });
}

/**
 * Deep checks raw string variables for dangerous payload insertions, avoiding XSS or DOM overlaps natively.
 * @param {string} inputData - The raw user input.
 * @returns {string} A deeply encoded and safe string representation.
 * @throws {Error} Asserts exception if malicious HTML structure intent is detected.
 */
export function strictSanitize(inputData) {
    if (typeof inputData !== 'string') {
        return '';
    }
    
    // Strict pattern matching identifying raw DOM bracket structures
    const xssPatternDetectionRegex = /<[^>]+>/g;
    if (xssPatternDetectionRegex.test(inputData)) {
        throw new Error("SecurityException: Identified blocked HTML syntax in provided input string.");
    }

    // Clean entities safely
    const safeOutputData = inputData
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    return safeOutputData.trim();
}

/**
 * Stateful storage abstraction securing active Rate Limit trackers natively within browser memory.
 * @constant {Map<string, number[]>}
 */
const RateLimitCacheMap = new Map();

/**
 * Restricts interaction ceilings per interface feature, neutralizing aggressive automated interactions natively.
 * @param {string} actionIdentifierKey - Context-specific operation tracker identifier.
 * @param {number} [maxRequestsCeiling=3] - Maximum specific operations allowed per configured duration.
 * @param {number} [evalWindowMs=5000] - Lifespan memory duration for active requests.
 * @throws {Error} Restricts interaction if bounds are exceeded, stopping API drains.
 */
export function enforceRateLimit(actionIdentifierKey, maxRequestsCeiling = 3, evalWindowMs = 5000) {
    const timestampNow = Date.now();
    const existingRecords = RateLimitCacheMap.get(actionIdentifierKey) || [];

    // Purge deprecated timestamps
    const activeValidRecords = existingRecords.filter(timestampRef => timestampNow - timestampRef < evalWindowMs);
    
    if (activeValidRecords.length >= maxRequestsCeiling) {
        throw new Error("RateLimitException: Operations are currently rate limited. Reduce interaction speeds.");
    }

    activeValidRecords.push(timestampNow);
    RateLimitCacheMap.set(actionIdentifierKey, activeValidRecords);
}
