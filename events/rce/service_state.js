// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.ServiceState,

    // Asynchronous function to execute when the server status has changed
    async execute(data, rce, client) {
        // Log an informational message indicating what the status is
        // Map server states to user-friendly messages
        const stateMessages = {
            "STOPPING": "The Server Is Stopping!",
            "MAINTENANCE": "The Server Is Under Maintenance!",
            "UPDATING": "The Server Is Updating!",
            "STOPPED": "The Server Has Stopped!",
            "STARTING": "The Server Is Starting!",
            "RUNNING": "The Server Is Running!",
            "SUSPENDED": "The Server Has Been Suspended!",
        };

        // Get the user-friendly message for the current state
        const stateMessage = stateMessages[data.state] || "Unknown Server State";

        // Construct the final status message
        const statusMessage = `\x1b[38;5;208m[${data.server.identifier}]\x1b[0m \x1b[32;1m[SERVER STATUS] ${stateMessage}\x1b[0m`;

        // Utilize the logging function from the client to log the join event
        await client.functions.log("info", statusMessage);
    }
};
