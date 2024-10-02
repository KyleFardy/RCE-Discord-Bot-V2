// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.TeamCreate,

    // Asynchronous function to execute when a player creates a team
    async execute(data, rce, client) {
        // Log an informational message indicating that a player has created a team
        const teamCreatedMessage = `[${data.server.identifier}] [TEAM CREATED] ${data.owner} Created A New Team (${data.id})!`;

        // Utilize the logging function from the client to log the join event
        await client.functions.log("info", teamCreatedMessage);
    }
};
