// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");
require('dotenv').config(); // Load environment variables from .env file

// Export the event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.TeamCreate,

    // Asynchronous function to execute when a player creates a team
    async execute(data, rce, client) {
        const { ign, owner, id, server: { identifier } } = data; // Destructure data

        // Log an informational message indicating that a player has joined a team
        await client.functions.log("info", `\x1b[38;5;208m[${data.server.identifier}]\x1b[0m \x1b[32;1m[TEAM CREATED] \x1b[0m${data.owner} \x1b[32;1m Has Created A Team \x1b[32;1m(${data.id})!\x1b[0m`);
        if (process.env.TEAM_LOGS === 'true' && !client.functions.is_empty(process.env.TEAM_LOGS_CHANNEL)) {
            await client.functions.send_embed(client, process.env.TEAM_LOGS_CHANNEL, `${data.server.identifier} - Team Created`, `**${owner}** Has Created A Team (***${id}***)`, [], "https://cdn.void-dev.co/team_created.png");
        }
    }
};
