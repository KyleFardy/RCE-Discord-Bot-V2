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
        const joinMessage = `\x1b[38;5;208m[${data.server.identifier}]\x1b[0m \x1b[32;1m[PLAYER JOINED]\x1b[0m ${data.ign} Joined The Server!`;
        await client.functions.log("info", joinMessage);

        // Read the welcome message from the environment variable
        let welcomeMessage = process.env.WELCOME_MESSAGE;
        // Replace placeholder with the player's in-game name (IGN)
        welcomeMessage = welcomeMessage.replace('{{username}}', data.ign);
        // Send the welcome message to the server
        //await rce.sendCommand(data.server.identifier, `say ${welcomeMessage}`);

        await client.player_stats.insert_player(data.ign, data.server);
    }
};
