// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the player joined event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.PlayerRespawned,

    // Asynchronous function to execute when a player spawns
    async execute(data, rce, client) {
        // Log an informational message indicating that a player has respawned
        const playerRespawnedMessage = `[${data.server.identifier}] [PLAYER RESPAWNED] ${data.ign} Has Respawned!`;

        // Utilize the logging function from the client to log the join event
        await client.functions.log("info", playerRespawnedMessage);
    }
};
