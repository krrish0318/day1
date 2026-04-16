/**
 * Queue Mathematical Model
 * Predicts wait times based on complex computational factors like crowd density.
 */

/**
 * Custom Error for Queue Logic Faults
 */
export class QueueDataError extends Error {
    constructor(message) {
        super(message);
        this.name = "QueueDataError";
    }
}

/**
 * Calculates estimated wait time incorporating congestion multipliers.
 * @param {number} peopleInLine - Current number of attendees ahead.
 * @param {number} serviceRatePerMin - Expected processed attendees per minute.
 * @param {number} congestionFactor - A multiplier representing local crowd thickness (1.0 = normal, 1.5 = high).
 * @returns {number} Estimated wait time in minutes (ceiled).
 * @throws {QueueDataError} If inputs are logically invalid.
 */
export function estimateWaitTime(peopleInLine, serviceRatePerMin, congestionFactor = 1.0) {
    if (peopleInLine < 0 || serviceRatePerMin <= 0 || congestionFactor < 1) {
        throw new QueueDataError("Invalid inputs for calculating wait time.");
    }
    
    // Formula: (People / Rate) * Congestion Delay Factor
    const rawWait = (peopleInLine / serviceRatePerMin) * congestionFactor;
    return Math.ceil(rawWait);
}

/**
 * Represents a secure Virtual Queue Entry.
 */
export class VirtualQueueEntry {
    /**
     * @param {string} attractionId 
     * @param {string} userId (UUID)
     */
    constructor(attractionId, userId) {
        this.id = `vq-${Date.now()}`;
        this.attractionId = attractionId;
        this.userId = userId; // Anonymized
        this.joinedAt = new Date();
    }
}
