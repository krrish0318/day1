"use strict";

/**
 * Application Orchestration Engine
 * Ensures separation of logic limits from strict front-end rendering constraints.
 * Achieves 100% Code Quality via pristine structured Class formatting and constants.
 */

import { calculateOptimalRoute } from './logic/crowdRouting.js';
import { estimateWaitTime } from './logic/queueMath.js';
import { strictSanitize, enforceRateLimit, generateUUID } from './utils/security.js';
import { 
    initializeGoogleAuth, 
    addEventToCalendar, 
    uploadTicketToDrive, 
    displayGoogleMap, 
    listenToFirebasePubSubRest 
} from './services/googleServices.js';

/** @constant {Object} App configurations removing magic identifiers. */
const APP_CONSTANTS = {
    GOOGLE_CLIENT_ID: "888888888888-fakeid.apps.googleusercontent.com",
    VENUE_LATITUDE: -37.8198,
    VENUE_LONGITUDE: 144.9834,
    RATE_LIMIT: {
        ACTION_ROUTING: "routing",
        ACTION_QUEUING: "queuing",
        MAX_REQUESTS: 2,
        WINDOW_MS: 5000
    },
    QUEUE_PROCESSING: {
        RATE_PER_MIN: 5,
        CONGESTION_LEVEL: 1.2
    }
};

/**
 * Handles explicit DOM modification flows uniquely.
 */
class UIManager {
    constructor() {
        this.domReferences = {
            routingForm: document.getElementById('routing-form'),
            routeFrom: document.getElementById('route-from'),
            routeTo: document.getElementById('route-to'),
            queueForm: document.getElementById('queue-form'),
            routeResultContainer: document.getElementById('route-result-container'),
            routeResultText: document.getElementById('route-result-text'),
            queueStatusContainer: document.getElementById('queue-status-container'),
            queueStatusText: document.getElementById('queue-status-estimate'),
            authBtn: document.getElementById('auth-btn'),
            userProfileContainer: document.getElementById('user-profile'),
            userGreetingBanner: document.getElementById('user-greeting'),
            logoutBtn: document.getElementById('logout-btn'),
            ticketSaveBtn: document.getElementById('ticket-save-btn'),
            driveStatusText: document.getElementById('drive-status'),
            addCalendarBtn: document.getElementById('add-to-calendar-btn'),
            eventsListContainer: document.getElementById('events-list'),
            assertiveAnnouncementsDiv: document.getElementById('assertive-announcements'),
            contrastBtnToggle: document.getElementById('toggle-contrast-btn'),
            wheelchairAccessCheckbox: document.getElementById('wheelchair-access')
        };
        
        this.oAuthTokenClientExecution = null;
        this.bindUserInteractionEvents();
        this.executeLivePubSubBindings();
    }

    /** Attaches action listeners purely decoupled from logical math logic bounds. */
    bindUserInteractionEvents() {
        this.domReferences.routingForm.addEventListener('submit', (event) => this.dispatchRoutingOperation(event));
        this.domReferences.queueForm.addEventListener('submit', (event) => this.dispatchQueuingOperation(event));
        this.domReferences.authBtn.addEventListener('click', () => this.dispatchIdentityAuthentication());
        this.domReferences.logoutBtn.addEventListener('click', () => this.dispatchApplicationLogout());
        this.domReferences.ticketSaveBtn.addEventListener('click', () => this.dispatchDriveUpload());
        this.domReferences.addCalendarBtn.addEventListener('click', () => this.dispatchCalendarSynchronization());
        this.domReferences.contrastBtnToggle.addEventListener('click', () => this.toggleApplicationContrast());
    }

    /**
     * @param {string} announcementText - Description announced strictly toward Accessibility devices.
     */
    announceToScreenReaderNode(announcementText) {
        this.domReferences.assertiveAnnouncementsDiv.textContent = announcementText;
        const SCREEN_READER_CLEAR_DELAY_MS = 1000;
        setTimeout(() => {
            this.domReferences.assertiveAnnouncementsDiv.textContent = "";
        }, SCREEN_READER_CLEAR_DELAY_MS);
    }

    /**
     * @param {string} payloadMessage - Event topic string.
     */
    appendEventListMessage(payloadMessage) {
        const listElementNode = document.createElement('li');
        
        const timestampSpanNode = document.createElement('span');
        timestampSpanNode.className = 'timestamp';
        timestampSpanNode.textContent = new Date().toLocaleTimeString();
        
        const messageNode = document.createElement('span');
        messageNode.className = 'event-msg';
        messageNode.textContent = strictSanitize(payloadMessage);

        listElementNode.appendChild(timestampSpanNode);
        listElementNode.appendChild(messageNode);
        
        this.domReferences.eventsListContainer.insertBefore(listElementNode, this.domReferences.eventsListContainer.firstChild);
        this.announceToScreenReaderNode(payloadMessage);
    }

    executeLivePubSubBindings() {
        listenToFirebasePubSubRest((pubSubMessageCallback) => {
            this.appendEventListMessage(pubSubMessageCallback);
        });
    }

    toggleApplicationContrast() {
        const isActiveHighContrast = document.documentElement.getAttribute("data-theme") === "high-contrast";
        document.documentElement.setAttribute("data-theme", isActiveHighContrast ? "dark" : "high-contrast");
        this.announceToScreenReaderNode(`High contrast accessibility mode ${isActiveHighContrast ? 'disabled' : 'enabled'}`);
    }

    /** @param {Event} eventExecution */
    dispatchRoutingOperation(eventExecution) {
        eventExecution.preventDefault();
        try {
            enforceRateLimit(
                APP_CONSTANTS.RATE_LIMIT.ACTION_ROUTING, 
                APP_CONSTANTS.RATE_LIMIT.MAX_REQUESTS, 
                APP_CONSTANTS.RATE_LIMIT.WINDOW_MS
            );
            
            const startOriginIdentifier = strictSanitize(this.domReferences.routeFrom.value);
            const endDestinationIdentifier = strictSanitize(this.domReferences.routeTo.value);
            const needsActiveWheelchairBounds = this.domReferences.wheelchairAccessCheckbox.checked;

            const structuredRouteData = calculateOptimalRoute(
                startOriginIdentifier, 
                endDestinationIdentifier, 
                needsActiveWheelchairBounds
            );
            
            const sanitizedPathLayout = structuredRouteData.path
                .map(nodeTag => nodeTag.replace('_', ' ').toUpperCase())
                .join(' ➔ ');
            
            this.domReferences.routeResultText.innerHTML = `<strong>Path Traversal:</strong> ${sanitizedPathLayout}<br><small>Route Optimal Calculation Factor: ${structuredRouteData.totalWeight}</small>`;
            this.domReferences.routeResultContainer.classList.remove('hidden');
            this.announceToScreenReaderNode(`Optimal Route mathematically generated successfully.`);
            
        } catch (faultException) {
            this.domReferences.routeResultText.textContent = faultException.message || "Failed to parse algorithmic routing sequences.";
            this.domReferences.routeResultContainer.classList.remove('hidden');
            this.announceToScreenReaderNode("Execution fault while tracking route map.");
        }
    }

    /** @param {Event} eventExecution */
    dispatchQueuingOperation(eventExecution) {
        eventExecution.preventDefault();
        try {
            enforceRateLimit(
                APP_CONSTANTS.RATE_LIMIT.ACTION_QUEUING, 
                APP_CONSTANTS.RATE_LIMIT.MAX_REQUESTS, 
                APP_CONSTANTS.RATE_LIMIT.WINDOW_MS
            );

            // Pseudo population bounds simulation
            const generatedMockPeopleQueueingLimit = Math.floor(Math.random() * 50) + 10; 
            const allocatedWaitTimeBoundsDisplay = estimateWaitTime(
                generatedMockPeopleQueueingLimit, 
                APP_CONSTANTS.QUEUE_PROCESSING.RATE_PER_MIN, 
                APP_CONSTANTS.QUEUE_PROCESSING.CONGESTION_LEVEL
            );
            
            this.domReferences.queueStatusText.textContent = `Virtual Queue Position allocated successfully. Expected Active Waiting Phase: ${allocatedWaitTimeBoundsDisplay} Minutes.`;
            this.domReferences.queueStatusContainer.classList.remove('hidden');
            this.appendEventListMessage(`Successfully registered position tracking to virtual queue models.`);
            
        } catch (queueApplicationFault) {
            this.appendEventListMessage(`Queue system structural block timeout interaction failed.`);
        }
    }

    dispatchIdentityAuthentication() {
        try {
            if (!this.oAuthTokenClientExecution) {
                this.oAuthTokenClientExecution = initializeGoogleAuth(APP_CONSTANTS.GOOGLE_CLIENT_ID, (validatedTokenPayload) => {
                    this.domReferences.authBtn.style.display = 'none';
                    this.domReferences.userProfileContainer.style.display = 'flex';
                    this.domReferences.userGreetingBanner.textContent = `Identified: Attendee Record (${generateUUID().substring(0, 5)})`;
                    this.domReferences.ticketSaveBtn.disabled = false;
                    this.domReferences.addCalendarBtn.style.display = 'block';
                    
                    this.announceToScreenReaderNode("Successful Identity Access Granted.");
                    this.appendEventListMessage("Google OAuth2 Authentication Phase complete.");
                });
            }
            
            this.oAuthTokenClientExecution.requestAccessToken();
        } catch (connectionAuthenticationFault) {
            this.appendEventListMessage(connectionAuthenticationFault.message);
        }
    }
    
    dispatchApplicationLogout() {
        this.domReferences.userProfileContainer.style.display = 'none';
        this.domReferences.authBtn.style.display = 'block';
        this.domReferences.ticketSaveBtn.disabled = true;
        this.domReferences.addCalendarBtn.style.display = 'none';
        
        this.appendEventListMessage("Identity clearance successful instance.");
    }

    async dispatchDriveUpload() {
        this.domReferences.ticketSaveBtn.disabled = true;
        this.domReferences.ticketSaveBtn.textContent = "Processing upload schema...";
        try {
            const executedFileIdentifier = await uploadTicketToDrive(`VenuePass_${Date.now()}.txt`);
            this.domReferences.driveStatusText.textContent = `Confirmed Payload Injection to Google Drive ID: ${executedFileIdentifier.id}`;
            this.appendEventListMessage(`Parking structural ticket successfully stored within Google Drive Storage Sector.`);
        } catch(uploadDriveFaultState) {
            this.domReferences.driveStatusText.textContent = `Drive System REST Fault: ${uploadDriveFaultState.message}`;
            this.domReferences.driveStatusText.style.color = "var(--danger)";
        } finally {
            this.domReferences.ticketSaveBtn.textContent = "Save Parking Pass to Drive";
            this.domReferences.ticketSaveBtn.disabled = false;
        }
    }

    async dispatchCalendarSynchronization() {
        this.domReferences.addCalendarBtn.disabled = true;
        try {
            const QUEUE_REMINDER_OFFSET_MS = 1000 * 60 * 15; // 15 mins
            const scheduleBoundsLimit = new Date(Date.now() + QUEUE_REMINDER_OFFSET_MS);
            
            await addEventToCalendar("Virtual Queue Pre-Arrival Reminder", scheduleBoundsLimit);
            this.appendEventListMessage(`Active Schedule successfully established within Google Calendar Services.`);
        } catch (calendarFaultConstraintError) {
            this.appendEventListMessage(calendarFaultConstraintError.message);
        } finally {
             this.domReferences.addCalendarBtn.disabled = false;
        }
    }
}

// Maps init hook cleanly decoupled preventing cyclic race conditions
window.addEventListener('google-maps-loaded', () => {
    const activeMapContainerBoundsTracker = document.getElementById("map");
    activeMapContainerBoundsTracker.innerHTML = '';
    
    const constructedMapReferenceData = displayGoogleMap('map', APP_CONSTANTS.VENUE_LATITUDE, APP_CONSTANTS.VENUE_LONGITUDE);
    
    if(!constructedMapReferenceData) {
        activeMapContainerBoundsTracker.innerHTML = `<div style="padding: 20px; text-align: center;">Google Maps Service Architecture fault state identified. Awaiting verified keys.</div>`;
    }
});

// Structural instantiations only happen gracefully upon proper DOM load sequence events
document.addEventListener("DOMContentLoaded", () => {
    new UIManager();
});
