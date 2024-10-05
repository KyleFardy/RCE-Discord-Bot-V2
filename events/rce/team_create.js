// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.TeamCreate,

    // Asynchronous function to execute when a player creates a team
    async execute(data, rce, client) {
        // Log an informational message indicating that a player has created a team
        // Format the team created message with colors
        const teamCreatedMessage = `\x1b[38;5;208m[${data.server.identifier}]\x1b[0m \x1b[32;1m[TEAM CREATED] \x1b[0m${data.owner} \x1b[32;1mCreated A New Team (${data.id})!\x1b[0m`;

        // Utilize the logging function from the client to log the join event
        await client.functions.log("info", teamCreatedMessage);
    }
};
