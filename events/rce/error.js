// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the error event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.Error,

    // Asynchronous function to execute when an error event occurs
    async execute(data, rce, client) {
        // Construct the error message
        const errorMessage = data.server
            ? `[${data.server.identifier}]: ${data.error}`  // Include server identifier if available
            : data.error;                                   // Log only the error message if no server info is provided

        try {
            // Log the error message using the client's logging function
            await client.functions.log("error", errorMessage);
        } catch (logError) {
            // Handle any potential errors that occur during logging
            await client.functions.log("error", "Failed To Log Error:", logError);
        }
    }
};
