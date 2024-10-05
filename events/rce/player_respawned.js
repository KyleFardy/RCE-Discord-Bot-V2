// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.PlayerRespawned,

    // Asynchronous function to execute when a player spawns
    async execute(data, rce, client) {
        // Log an informational message indicating that a player has respawned
        const playerRespawnedMessage = `\x1b[38;5;208m[${data.server.identifier}]\x1b[0m \x1b[32;1m[PLAYER RESPAWNED]\x1b[0m \x1b[32;1m${data.ign}\x1b[0m Has Respawned!`;

        // Utilize the logging function from the client to log the join event
        await client.functions.log("info", playerRespawnedMessage);
    }
};
