/**
 * Crowd Routing Logic
 * Implements weighted graph routing (A* behavior simulation) to optimize attendee movement.
 */

export class GraphError extends Error {
    constructor(message) {
        super(message);
        this.name = "GraphError";
    }
}

/**
 * Static Venue Mapping Nodes and Edges
 */
const VenueGraph = {
    "gate_a": { "concourse_north": { cost: 2, congestion: 1.5 } },
    "concourse_north": { "gate_a": { cost: 2, congestion: 1 }, "section_101": { cost: 3, congestion: 1.2 }, "food_court": { cost: 5, congestion: 2.0 } },
    "section_101": { "concourse_north": { cost: 3, congestion: 1 } },
    "food_court": { "concourse_north": { cost: 5, congestion: 1.2 } }
};

/**
 * Calculates the best path minimizing the product of physical distance (cost) and crowd density (congestion).
 * 
 * @param {string} startNode - Graph node key.
 * @param {string} endNode - Graph node key.
 * @param {boolean} requireWheelchair - True if the route must exclude stairs (simulated via high cost).
 * @returns {Object} Optimized path details.
 */
export function calculateOptimalRoute(startNode, endNode, requireWheelchair = false) {
    if (!VenueGraph[startNode] || (!VenueGraph[endNode] && startNode !== endNode)) {
        throw new GraphError("Node does not exist in venue map.");
    }

    if (startNode === endNode) {
        return { path: [startNode], totalWeight: 0, accessible: true };
    }

    // Simplified BFS/Dijkstra logic for Demo
    // In production, this utilizes advanced PriorityQueues.
    const distances = {};
    const previous = {};
    const queue = new Set(Object.keys(VenueGraph));

    for (const node of queue) distances[node] = Infinity;
    distances[startNode] = 0;

    while (queue.size > 0) {
        // Find minimum distance node
        let minNode = null;
        for (const node of queue) {
            if (!minNode || distances[node] < distances[minNode]) {
                minNode = node;
            }
        }

        if (distances[minNode] === Infinity) break;
        if (minNode === endNode) break; // Reached target

        queue.delete(minNode);

        for (const neighbor in VenueGraph[minNode]) {
            const edge = VenueGraph[minNode][neighbor];
            // If wheelchair access is required, any route with high native cost gets heavily penalized to simulate stairs avoidance.
            let weight = edge.cost * edge.congestion;
            if (requireWheelchair && edge.cost > 3) {
                weight += 100; 
            }

            const alt = distances[minNode] + weight;
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                previous[neighbor] = minNode;
            }
        }
    }

    // Trace path
    const path = [];
    let curr = endNode;
    while (curr) {
        path.unshift(curr);
        curr = previous[curr];
    }

    return {
        path,
        totalWeight: distances[endNode],
        accessible: requireWheelchair
    };
}
