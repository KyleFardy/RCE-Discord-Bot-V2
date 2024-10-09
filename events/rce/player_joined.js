// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");
// Load environment variables from the .env file
require('dotenv').config();

// Export the event handler module
module.exports = {
    name: RCEEvent.PlayerJoined,

    // Asynchronous function to execute when a player joins the server
    async execute(data, rce, client) {
        await log_player_joined(client, data);
        //await send_welcome_message(rce, data);
        await insert_or_update_player(client, data);
    },
};

// Helper function to log player joining
async function log_player_joined(client, data) {
    const message = `\x1b[38;5;208m[${data.server.identifier}]\x1b[0m \x1b[32;1m[PLAYER JOINED]\x1b[0m ${data.ign} Joined The Server!`;
    await client.functions.log("info", message);
}

// Helper function to send a welcome message
async function send_welcome_message(rce, data) {
    const welcomeMessage = process.env.WELCOME_MESSAGE.replace('{{username}}', data.ign);
    await rce.sendCommand(data.server.identifier, `say ${welcomeMessage}`);
}

// Helper function to insert or update player in the database
async function insert_or_update_player(client, data) {
    await client.player_stats.insert_player(data.ign, data.server);
}
