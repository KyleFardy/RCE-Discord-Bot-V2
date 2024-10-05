// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the error event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.Error,

    // Asynchronous function to execute when an error event occurs
    async execute(data, rce, client) {
        // Construct the error message with context
        const errorMessage = data.server
            ? `\x1b[31;1m[${data.server.identifier}] ERROR:\x1b[0m ${data.error}`  // Bold red for server error
            : `\x1b[31;1m[ERROR]:\x1b[0m ${data.error}`;                                   // Bold red for general error

        try {
            // Log the error message using the client's logging function
            await client.functions.log("error", errorMessage);
        } catch (logError) {
            // Handle any potential errors that occur during logging
            const logErrorMessage = `\x1b[31;1m[LOG ERROR]:\x1b[0m Failed To Log Error: ${logError.message}`;
            await client.functions.log("error", logErrorMessage);
        }
    }
};
