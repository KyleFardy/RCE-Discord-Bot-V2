// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the event handler module
module.exports = {
    name: RCEEvent.PlayerSuicide,

    // Asynchronous function to execute when a player kills themselves
    async execute(data, rce, client) {
        await log_player_suicide(client, data.server.identifier, data.ign);

        // Remove the points for the player who committed suicide
        const current_server = await client.functions.get_server(client, data.server.identifier);
        await client.player_stats.remove_points(data.server, data.ign, current_server.suicide_points);
    },
};

// Helper function to log player suicide
async function log_player_suicide(client, server_id, ign) {
    await client.functions.log("info", `\x1b[38;5;208m[${server_id}]\x1b[0m \x1b[32;1m[PLAYER SUICIDE]\x1b[0m \x1b[32;1m${ign}\x1b[0m Killed Themselves!`);
}
