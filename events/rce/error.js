// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the error event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.Error,

    // Asynchronous function to execute when an error event occurs
    async execute(data, rce, client) {
        // Construct the error message with context
        const error_message = data.server
            ? `\x1b[31;1m[${data.server.identifier}] ERROR:\x1b[0m ${data.error}`  // Bold red for server error
            : `\x1b[31;1m[ERROR]:\x1b[0m ${data.error}`;                               // Bold red for general error

        // Log the error message using the client's logging function
        if (should_log_error(client)) {
            try {
                await client.functions.log("error", error_message);
            } catch (log_error) {
                // Handle any potential errors that occur during logging
                const log_error_message = `\x1b[31;1m[LOG ERROR]:\x1b[0m Failed to log error: ${log_error.message}`;
                await client.functions.log("error", log_error_message);
            }
        }
    }
};

// Check if we should log the error
function should_log_error(client) {
    return process.env.ERROR_LOGS === 'true' && !client.functions.is_empty(process.env.ERROR_LOG_CHANNEL);
}
