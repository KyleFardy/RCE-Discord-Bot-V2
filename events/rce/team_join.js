// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.TeamJoin,

    // Asynchronous function to execute when a player joins a team
    async execute(data, rce, client) {
        // Log an informational message indicating that a player has joined a team
        const teamJoinedMessage = `[${data.server.identifier}] [TEAM JOINED] ${data.ign} Has Joined ${data.owner}\'s Team (${data.id})!`;

        // Utilize the logging function from the client to log the join event
        await client.functions.log("info", teamJoinedMessage);
    }
};
