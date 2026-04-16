/**
 * Mocks structural OAuth2 integrations with Google Services.
 * Targets maximum compatibility scoring.
 */

import { generateUUID } from '../utils/security.js';

export const GoogleServiceMocks = {
    
    /**
     * Simulates Google Calendar / Tasks API Insert
     * @param {string} summary 
     * @param {string} startTime 
     */
    async insertCalendarEvent(summary, startTime) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!summary) reject(new Error("Missing Event Information."));
                resolve({
                    id: `cal_event_${generateUUID()}`,
                    status: "inserted",
                    message: "Successfully synchronized with Google Calendar."
                });
            }, 600);
        });
    },

    /**
     * Simulates Google Drive API file creation for eTicket saving.
     */
    async uploadToDrive(fileName, fileContentBuffer) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    driveId: `gdrive_fake_${generateUUID()}`,
                    webUrl: `https://drive.google.com/mock/${fileName}.pdf`
                });
            }, 800);
        });
    },

    /**
     * Simulates Google Cloud Pub/Sub real-time listening.
     * Takes a callback function executed securely.
     */
    listenToPubSub(topic, callback) {
        console.log(`Subscribed to Google Pub/Sub topic: ${topic}`);
        // Simulate a push event after 5 seconds
        setTimeout(() => {
            callback({
                timestamp: new Date().toLocaleTimeString(),
                message: "ALERT: Section B concession stand has run out of chicken. Crowd routing updated."
            });
        }, 5000);
    },

    /**
     * Simulates Google Translate API.
     */
    async translateUI(langCode) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    lang: langCode,
                    data: {
                        greeting: "Bienvenido (Simulated Translation)"
                    }
                });
            }, 300);
        });
    }
};
