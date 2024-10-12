// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the event handler module
module.exports = {
    name: RCEEvent.PlayerRespawned,

    // Asynchronous function to execute when a player respawns
    async execute(data, rce, client) {
        await log_player_respawn(client, data.server.identifier, data.ign);
    },
};

// Helper function to log player respawn
async function log_player_respawn(client, server_id, ign) {
    // Utilize the logging function from the client to log the respawn event
    await client.functions.log("info", `\x1b[38;5;208m[${server_id}]\x1b[0m \x1b[32;1m[PLAYER RESPAWNED]\x1b[0m \x1b[32;1m${ign}\x1b[0m Has Respawned!`);
}
