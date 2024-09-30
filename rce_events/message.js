// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the message event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.Message,

    // Asynchronous function to execute when a message event occurs
    async execute(data, rce, client) {
        // Construct the log message with the server identifier and the received message
        const logMessage = `[${data.server.identifier}] ${data.message}`;

        // Log the message at the "info" level using the client's logging function
        //await client.functions.log("info", logMessage);
    }
};
