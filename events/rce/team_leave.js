// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.TeamLeave,

    // Asynchronous function to execute when a player leaves a team
    async execute(data, rce, client) {
        // Log an informational message indicating that a player has left a team
        const teamLeftMessage = `[${data.server.identifier}] [TEAM LEFT] ${data.ign} Has Left ${data.owner}\'s Team (${data.id})!`;

        // Utilize the logging function from the client to log the join event
        await client.functions.log("info", teamLeftMessage);
    }
};
