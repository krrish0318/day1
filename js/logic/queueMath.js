"use strict";

/**
 * Queue Mathematical Model
 * Predicts wait times based on computational factors like standard service rates and varying crowd density.
 * Exclusively implements pure mathematical logic for maximum modularity.
 */

/**
 * Custom Error strictly used for Queue Logic parameter validation faults.
 * @extends Error
 */
export class QueueDataError extends Error {
    /**
     * @param {string} message - Description of the logic boundary violation.
     */
    constructor(message) {
        super(message);
        this.name = "QueueDataError";
    }
}

/**
 * Calculates estimated wait time incorporating congestion multipliers.
 * 
 * @param {number} peopleInLine - Current number of attendees ahead in the queue.
 * @param {number} serviceRatePerMin - Expected processed attendees per minute.
 * @param {number} congestionFactor - A multiplier representing local crowd thickness (1.0 = normal, 1.5 = high).
 * @returns {number} Estimated wait time in minutes, rounded up to the nearest whole minute.
 * @throws {QueueDataError} If any of the structural inputs are mathematically impossible or invalid.
 */
export function estimateWaitTime(peopleInLine, serviceRatePerMin, congestionFactor = 1.0) {
    const MINIMUM_RATE = 0;
    const MINIMUM_CONGESTION = 1;

    if (peopleInLine < MINIMUM_RATE || serviceRatePerMin <= MINIMUM_RATE || congestionFactor < MINIMUM_CONGESTION) {
        throw new QueueDataError("Invalid mathematical boundary inputs for calculating wait time constraints.");
    }
    
    const rawWaitTime = (peopleInLine / serviceRatePerMin) * congestionFactor;
    return Math.ceil(rawWaitTime);
}
