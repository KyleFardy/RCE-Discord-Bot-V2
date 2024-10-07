// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");
require('dotenv').config(); // Load environment variables from .env file

// Export the event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.TeamJoin,

    // Asynchronous function to execute when a player joins a team
    async execute(data, rce, client) {
        const { ign, owner, id, server: { identifier } } = data; // Destructure data

        // Prevent owner from being logged as joining their own team
        if (ign === owner) return;

        // Log an informational message indicating that a player has joined a team
        await log_team_join(client, identifier, ign, owner, id);

        // If team logging is enabled, send an embed message to the team logs channel
        if (should_log_team_join(client)) {
            const owner_name = get_member_name(client, owner);
            const member_name = get_member_name(client, ign);
            await send_team_join_log(client, member_name, owner_name, identifier, id);
        }
    }
};

// Helper function to log team join event
async function log_team_join(client, server_id, member_name, owner, team_id) {
    await client.functions.log("info", `\x1b[38;5;208m[${server_id}]\x1b[0m \x1b[32;1m[TEAM JOINED] \x1b[0m${member_name} \x1b[32;1mHas Joined \x1b[0m${owner}\'s Team \x1b[32;1m(${team_id})!\x1b[0m`);
}

// Helper function to check if team join logging is enabled
function should_log_team_join(client) {
    return process.env.TEAM_LOGS === 'true' && !client.functions.is_empty(process.env.TEAM_LOGS_CHANNEL);
}

// Helper function to get the member name from the guild
function get_member_name(client, player_name) {
    return client.guilds.cache.get(process.env.GUILD_ID)?.members.cache.find(member => member.nickname === player_name || member.user.username === player_name)?.toString() || player_name;
}

// Helper function to send a team join log message
async function send_team_join_log(client, member_name, owner_name, server_id, team_id) {
    await client.functions.send_embed(
        client,
        process.env.TEAM_LOGS_CHANNEL,
        `${server_id} - Team Joined`,
        `${member_name} Joined ${owner_name} Team (***${team_id}***)`,
        [],
        "https://cdn.void-dev.co/team_joined.png"
    );
}
