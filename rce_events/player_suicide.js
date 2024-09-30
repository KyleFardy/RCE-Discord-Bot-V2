// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the player joined event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.PlayerSuicide,

    // Asynchronous function to execute when a player kills themself
    async execute(data, rce, client) {
        // Log an informational message indicating that a player has killed themself
        const playerSuicideMessage = `[${data.server.identifier}] [PLAYER SUICIDE] ${data.ign} Killed Themself!`;

        // Utilize the logging function from the client to log the join event
        await client.functions.log("info", playerSuicideMessage);
    }
};
