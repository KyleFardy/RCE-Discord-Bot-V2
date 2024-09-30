// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the player joined event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.TeamJoin,

    // Asynchronous function to execute when the server status has changed
    async execute(data, rce, client) {
        // Log an informational message indicating what the status is
        const statusMessage = `[${data.server.identifier}] [SERVER STATUS]  ${data.state}!`;

        // Utilize the logging function from the client to log the join event
        await client.functions.log("info", statusMessage);
    }
};
