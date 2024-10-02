// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.PlayerLeft,

    // Asynchronous function to execute when a player joins the server
    async execute(data, rce, client) {
        // Log an informational message indicating that a player has joined the server
        const leftMessage = `[${data.server.identifier}] [PLAYER LEFT] ${data.ign} Left The Server!`;

        // Utilize the logging function from the client to log the join event
        await client.functions.log("info", leftMessage);
    }
};
