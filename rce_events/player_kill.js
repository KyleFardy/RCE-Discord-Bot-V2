// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the player joined event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.PlayerKill,

    // Asynchronous function to execute when a player is killed
    async execute(data, rce, client) {
        // Log an informational message indicating that a player has been killed
        const playerKilledMessage = `[${data.server.identifier}] [KILL] ${data.killer.name} Killed ${data.victim.name}!`;

        // Utilize the logging function from the client to log the join event
        await client.functions.log("info", playerKilledMessage);
    }
};
