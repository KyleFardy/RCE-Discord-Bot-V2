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

        // Log an informational message indicating that a player has created a team
        await log_team_creation(client, identifier, owner, id);

        // If team logging is enabled, send an embed message to the team logs channel
        if (should_log_team_creation(client)) {
            const member_name = get_member_name(client, owner);
            await send_team_creation_log(client, member_name, identifier, id);
        }
    }
};

// Helper function to log team creation
async function log_team_creation(client, server_id, owner, team_id) {
    await client.functions.log("info", `\x1b[38;5;208m[${server_id}]\x1b[0m \x1b[32;1m[TEAM CREATED] \x1b[0m${owner} \x1b[32;1m Has Created A Team \x1b[32;1m(${team_id})!\x1b[0m`);
}

// Helper function to check if team creation logging is enabled
function should_log_team_creation(client) {
    return process.env.TEAM_LOGS === 'true' && !client.functions.is_empty(process.env.TEAM_LOGS_CHANNEL);
}

// Helper function to get the member name from the guild
function get_member_name(client, owner) {
    return client.guilds.cache.get(process.env.GUILD_ID)?.members.cache.find(member => member.nickname === owner || member.user.username === owner)?.toString() || owner;
}

// Helper function to send a team creation log message
async function send_team_creation_log(client, member_name, server_id, team_id) {
    await client.functions.send_embed(
        client,
        process.env.TEAM_LOGS_CHANNEL,
        `${server_id} - Team Created`,
        `${member_name} Has Created A Team (***${team_id}***)`,
        [],
        "https://cdn.void-dev.co/team_created.png"
    );
}
