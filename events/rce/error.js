// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the error event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.Error,

    // Asynchronous function to execute when an error event occurs
    async execute(data, rce, client) {
        try {
            await client.functions.log("error", data.server ? `\x1b[31;1m[${data.server.identifier}] ERROR:\x1b[0m ${data.error}` : `\x1b[31;1m[ERROR]:\x1b[0m ${data.error}`);
        } catch (log_error) {
            // Handle any potential errors that occur during logging
            await client.functions.log("error", `\x1b[31;1m[LOG ERROR]:\x1b[0m Failed to log error: ${log_error.message}`);
        }
    }
};