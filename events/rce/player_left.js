// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the event handler module
module.exports = {
    name: RCEEvent.PlayerLeft,

    // Asynchronous function to execute when a player leaves the server
    async execute(data, rce, client) {
        //await log_player_left(client, data.server.identifier, data.ign);
    },
};

// Helper function to log player leaving
async function log_player_left(client, server_id, ign) {
    const left_message = `\x1b[38;5;208m[${server_id}]\x1b[0m \x1b[32;1m[PLAYER LEFT]\x1b[0m \x1b[32;1m${ign}\x1b[0m Left The Server!`;

    // Utilize the logging function from the client to log the leave event
    await client.functions.log("info", left_message);
}
