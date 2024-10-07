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

        // Check if the player is the team owner
        if (ign === owner) {
            await handle_team_disbanded(client, identifier, ign, id);
        } else {
            await handle_team_left(client, identifier, ign, owner, id);
        }
    }
};

// Helper function to handle team disbanding
async function handle_team_disbanded(client, server_id, owner_name, team_id) {
    await client.functions.log("info", `\x1b[38;5;208m[${server_id}]\x1b[0m \x1b[32;1m[TEAM DISBANDED] \x1b[0m${owner_name} \x1b[32;1mHas Deleted Their Team \x1b[32;1m(${team_id})!\x1b[0m`);

    if (should_log_team_leave(client)) {
        const member_name = get_member_name(client, owner_name);
        await send_team_deleted_log(client, member_name, server_id, team_id);
    }
}

// Helper function to handle player leaving a team
async function handle_team_left(client, server_id, member_name, owner, team_id) {
    await client.functions.log("info", `\x1b[38;5;208m[${server_id}]\x1b[0m \x1b[32;1m[TEAM LEFT] \x1b[0m${member_name} \x1b[32;1mHas Left \x1b[0m${owner}'s Team \x1b[32;1m(${team_id})!\x1b[0m`);

    if (should_log_team_leave(client)) {
        const owner_name = get_member_name(client, owner);
        await send_team_left_log(client, member_name, owner_name, server_id, team_id);
    }
}

// Helper function to check if team leave logging is enabled
function should_log_team_leave(client) {
    return process.env.TEAM_LOGS === 'true' && !client.functions.is_empty(process.env.TEAM_LOGS_CHANNEL);
}

// Helper function to get the member name from the guild
function get_member_name(client, player_name) {
    return client.guilds.cache.get(process.env.GUILD_ID)?.members.cache.find(member => member.nickname === player_name || member.user.username === player_name)?.toString() || player_name;
}

// Helper function to send a team deleted log message
async function send_team_deleted_log(client, member_name, server_id, team_id) {
    await client.functions.send_embed(
        client,
        process.env.TEAM_LOGS_CHANNEL,
        `${server_id} - Team Deleted`,
        `${member_name} Deleted Their Team (***${team_id}***)`,
        [],
        "https://cdn.void-dev.co/team_deleted.png"
    );
}

// Helper function to send a team left log message
async function send_team_left_log(client, member_name, owner_name, server_id, team_id) {
    await client.functions.send_embed(
        client,
        process.env.TEAM_LOGS_CHANNEL,
        `${server_id} - Team Left`,
        `${member_name} Left ${owner_name} Team (***${team_id}***)`,
        [],
        "https://cdn.void-dev.co/team_deleted.png"
    );
}
