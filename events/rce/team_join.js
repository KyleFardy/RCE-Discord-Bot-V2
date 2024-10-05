// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.TeamJoin,

    // Asynchronous function to execute when a player joins a team
    async execute(data, rce, client) {
        // Log an informational message indicating that a player has joined a team
        const teamJoinedMessage = `\x1b[38;5;208m[${data.server.identifier}]\x1b[0m \x1b[32;1m[TEAM JOINED] \x1b[0m${data.ign} \x1b[32;1mHas Joined \x1b[0m${data.owner}\'s Team \x1b[32;1m(${data.id})!\x1b[0m`;


        // Utilize the logging function from the client to log the join event
        await client.functions.log("info", teamJoinedMessage);
    }
};
