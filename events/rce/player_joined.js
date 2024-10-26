// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require('rce.js');
// Load environment variables from the .env file
require('dotenv').config();

// Export the event handler module
module.exports = {
  name: RCEEvent.PlayerJoined,

  // Asynchronous function to execute when a player joins the server
  async execute(data, rce, client) {
    const current_server = await client.functions.get_server(
      client,
      data.server.identifier
    );
    await log_player_joined(client, data);
    //await send_welcome_message(client, rce, data, current_server);
    await insert_or_update_player(client, data);
  },
};

// Helper function to log player joining
async function log_player_joined(client, data) {
  await client.functions.log(
    'info',
    `\x1b[38;5;208m[${data.server.identifier}]\x1b[0m \x1b[32;1m[PLAYER JOINED]\x1b[0m ${data.ign} Joined The Server!`
  );
}

// Helper function to send a welcome message
async function send_welcome_message(client, rce, data, server) {
  await client.rce.servers.command(
    data.server.identifier,
    `say ${server.welcome_message.replace('{{username}}', data.ign)}`
  );
}

// Helper function to insert or update player in the database
async function insert_or_update_player(client, data) {
  await client.player_stats.insert_player(data.ign, data.server);
}
