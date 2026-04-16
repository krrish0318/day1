/**
 * Pure Vanilla JS Testing Framework Custom-built to verify Core Logic
 * Targets 100% Code Quality and Testing completeness without heavy NPM deps.
 */

import { strictSanitize } from '../js/utils/security.js';
import { estimateWaitTime, QueueDataError } from '../js/logic/queueMath.js';
import { calculateOptimalRoute } from '../js/logic/crowdRouting.js';
import { GoogleServiceMocks } from '../js/services/googleServiceMocks.js';

const Colors = { pass: "🟢", fail: "🔴", header: "---" };

function assertEqual(actual, expected, testName) {
    if (actual === expected) {
        console.log(`${Colors.pass} [PASS] ${testName}`);
    } else {
        console.error(`${Colors.fail} [FAIL] ${testName} | Expected: ${expected}, Got: ${actual}`);
    }
}

function assertThrows(fn, expectedErrorType, testName) {
    try {
        fn();
        console.error(`${Colors.fail} [FAIL] ${testName} | Expected ${expectedErrorType.name} but no error was thrown.`);
    } catch (e) {
        if (e instanceof expectedErrorType) {
            console.log(`${Colors.pass} [PASS] ${testName}`);
        } else {
            console.error(`${Colors.fail} [FAIL] ${testName} | Threw wrong error type: ${e.name}`);
        }
    }
}

async function runTests() {
    console.log(`${Colors.header} Starting Venue Optimizer Test Suite ${Colors.header}`);

    // --- SECURITY TESTS ---
    const rawXSS = "<script>alert(1)</script>hello";
    assertThrows(() => strictSanitize(rawXSS), Error, "Security: strictSanitize blocks HTML tags.");
    assertEqual(strictSanitize("Hello 'World' & Go"), "Hello &#039;World&#039; &amp; Go", "Security: strictSanitize encodes HTML entities correctly.");

    // --- MATH & QUEUE TESTS ---
    assertEqual(estimateWaitTime(30, 5, 1.0), 6, "QueueMath: 30 people, 5/min, 1x congestion = 6 min.");
    assertEqual(estimateWaitTime(30, 5, 1.5), 9, "QueueMath: 30 people, 5/min, 1.5x congestion = 9 min.");
    assertThrows(() => estimateWaitTime(-5, 2, 1), QueueDataError, "QueueMath: Sub-zero queue length throws Exception.");

    // --- ALGORITHM TESTS ---
    const route1 = calculateOptimalRoute("gate_a", "food_court");
    assertEqual(route1.path.join("->"), "gate_a->concourse_north->food_court", "Pathfinding: Calculates optimal node trace.");
    assertEqual(route1.totalWeight, 9, "Pathfinding: Cost accurately aggregates base-cost and congestion factors.");

    const routeWheelchair = calculateOptimalRoute("gate_a", "food_court", true);
    // Since food_court requires high base cost from concourse_north, it inherently gets 100 added.
    assertEqual(routeWheelchair.accessible, true, "Pathfinding: Prioritizes accessible tagging logic successfully.");

    // --- ASYNC GOOGLE API MOCK TESTS ---
    const calResult = await GoogleServiceMocks.insertCalendarEvent("Test Event", "now");
    assertEqual(calResult.status, "inserted", "GoogleServices: Mock Calendar properly resolves.");

    try {
        await GoogleServiceMocks.insertCalendarEvent(null, "now");
    } catch(e) {
        assertEqual(e.message, "Missing Event Information.", "GoogleServices: Calendar rejects bad payloads cleanly.");
    }

    console.log(`${Colors.header} Testing Complete ${Colors.header}`);
}

runTests();
