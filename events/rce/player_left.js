// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.PlayerLeft,

    // Asynchronous function to execute when a player joins the server
    async execute(data, rce, client) {
        // Log an informational message indicating that a player has joined the server
        const leftMessage = `\x1b[38;5;208m[${data.server.identifier}]\x1b[0m \x1b[32;1m[PLAYER LEFT]\x1b[0m \x1b[32;1m${data.ign}\x1b[0m Left The Server!`;

        // Utilize the logging function from the client to log the join event
        await client.functions.log("info", leftMessage);
    }
};
