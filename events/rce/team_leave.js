// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");
require('dotenv').config(); // Load environment variables from .env file

// Export the event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.TeamLeave,

    // Asynchronous function to execute when a player leaves a team
    async execute(data, rce, client) {
        const { ign, owner, id, server: { identifier } } = data; // Destructure data

        // Check if the player is the team owner and handle accordingly
        if (ign === owner) {
            await client.functions.log("info", `\x1b[38;5;208m[${identifier}]\x1b[0m \x1b[32;1m[TEAM DISBANDED] \x1b[0m${ign} \x1b[32;1mHas Deleted Their Team \x1b[32;1m(${id})!\x1b[0m`);
            if (process.env.TEAM_LOGS === 'true' && !client.functions.is_empty(process.env.TEAM_LOGS_CHANNEL)) {
                await client.functions.send_embed(client, process.env.TEAM_LOGS_CHANNEL, `${data.server.identifier} - Team Deleted`, `**${owner}** Deleted Their Team (***${id}***)`, [], "https://cdn.void-dev.co/team_deleted.png");
            }
        } else {
            await client.functions.log("info", `\x1b[38;5;208m[${identifier}]\x1b[0m \x1b[32;1m[TEAM LEFT] \x1b[0m${ign} \x1b[32;1mHas Left \x1b[0m${owner}'s Team \x1b[32;1m(${id})!\x1b[0m`);
            if (process.env.TEAM_LOGS === 'true' && !client.functions.is_empty(process.env.TEAM_LOGS_CHANNEL)) {
                await client.functions.send_embed(client, process.env.TEAM_LOGS_CHANNEL, `${data.server.identifier} - Team Left`, `**${ign}** Left **${owner}**'s Team (***${id}***)`, [], "https://cdn.void-dev.co/team_deleted.png");
            }
        }
    }
};
