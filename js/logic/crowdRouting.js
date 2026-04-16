"use strict";

/**
 * Crowd Routing Logic Layer
 * Integrates algorithmic Weighted Graph routing simulating path traversal to optimize attendee movement 
 * while penalizing congested edges and wheelchair-inaccessible routes.
 */

/**
 * Custom Error for mapping and logical Graph faults.
 * @extends Error
 */
export class GraphError extends Error {
    /**
     * @param {string} message - Clear specification of the node constraint violation.
     */
    constructor(message) {
        super(message);
        this.name = "GraphError";
    }
}

/**
 * Immutable Static Venue Mapping Constants
 * Abstracted representation of node paths and specific transition costs.
 * @constant {Object}
 */
export const VENUE_GRAPH_CONSTANTS = {
    "gate_a": { "concourse_north": { baseCost: 2, liveCongestion: 1.5 } },
    "concourse_north": { 
        "gate_a": { baseCost: 2, liveCongestion: 1.0 }, 
        "section_101": { baseCost: 3, liveCongestion: 1.2 }, 
        "food_court": { baseCost: 5, liveCongestion: 2.0 } 
    },
    "section_101": { "concourse_north": { baseCost: 3, liveCongestion: 1.0 } },
    "food_court": { "concourse_north": { baseCost: 5, liveCongestion: 1.2 } }
};

/**
 * Algorithmic path optimization assessing weights of transition costs against live congestion.
 * 
 * @param {string} startNode - Origin graph node identifier.
 * @param {string} endNode - Destination graph node identifier.
 * @param {boolean} requireWheelchair - True if the route must exclude physically hazardous edges (e.g. stairs).
 * @returns {{path: string[], totalWeight: number, accessible: boolean}} Optimized path trace map.
 * @throws {GraphError} Validates node bounds before execution.
 */
export function calculateOptimalRoute(startNode, endNode, requireWheelchair = false) {
    const STAIRS_PENALTY_WEIGHT = 100;
    const WHEELCHAIR_INACCESSIBLE_COST_THRESHOLD = 3;

    if (!VENUE_GRAPH_CONSTANTS[startNode] || (!VENUE_GRAPH_CONSTANTS[endNode] && startNode !== endNode)) {
        throw new GraphError("Target or origin node does not exist within the established bounds of the venue map.");
    }

    if (startNode === endNode) {
        return { path: [startNode], totalWeight: 0, accessible: true };
    }

    const pathDistances = {};
    const previousNodeMap = {};
    const unvisitedQueue = new Set(Object.keys(VENUE_GRAPH_CONSTANTS));

    for (const node of unvisitedQueue) {
        pathDistances[node] = Infinity;
    }
    pathDistances[startNode] = 0;

    let iterations = 0;
    const MAX_ITERATIONS = 5000; // Protection mechanism

    while (unvisitedQueue.size > 0 && iterations < MAX_ITERATIONS) {
        iterations++;
        
        // Locate minimum path distance node
        let minDistanceNode = null;
        for (const node of unvisitedQueue) {
            if (!minDistanceNode || pathDistances[node] < pathDistances[minDistanceNode]) {
                minDistanceNode = node;
            }
        }

        if (pathDistances[minDistanceNode] === Infinity || minDistanceNode === endNode) {
            break;
        }

        unvisitedQueue.delete(minDistanceNode);

        for (const neighborNode in VENUE_GRAPH_CONSTANTS[minDistanceNode]) {
            const edgeData = VENUE_GRAPH_CONSTANTS[minDistanceNode][neighborNode];
            let activeWeight = edgeData.baseCost * edgeData.liveCongestion;
            
            if (requireWheelchair && edgeData.baseCost > WHEELCHAIR_INACCESSIBLE_COST_THRESHOLD) {
                activeWeight += STAIRS_PENALTY_WEIGHT; 
            }

            const alternativePathDistance = pathDistances[minDistanceNode] + activeWeight;
            if (alternativePathDistance < pathDistances[neighborNode]) {
                pathDistances[neighborNode] = alternativePathDistance;
                previousNodeMap[neighborNode] = minDistanceNode;
            }
        }
    }

    // Trace generated optimal path backwards
    const optimalPathTrace = [];
    let traversalCursor = endNode;
    while (traversalCursor) {
        optimalPathTrace.unshift(traversalCursor);
        traversalCursor = previousNodeMap[traversalCursor];
    }

    return {
        path: optimalPathTrace,
        totalWeight: pathDistances[endNode],
        accessible: requireWheelchair
    };
}
