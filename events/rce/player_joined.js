// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");
// Load environment variables from the .env file
require('dotenv').config();

// Export the event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.PlayerJoined,

    // Asynchronous function to execute when a player joins the server
    async execute(data, rce, client) {
        // Log a message indicating that a player has joined the server
        await client.functions.log("info", `\x1b[38;5;208m[${data.server.identifier}]\x1b[0m \x1b[32;1m[PLAYER JOINED]\x1b[0m ${data.ign} Joined The Server!`);

        // Send the welcome message to the server
        //await rce.sendCommand(data.server.identifier, `say ${process.env.WELCOME_MESSAGE.replace('{{username}}', data.ign) }`);

        // insert/update the player into the database
        await client.player_stats.insert_player(data.ign, data.server);
    }
};
