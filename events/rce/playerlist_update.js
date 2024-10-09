// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");
// Load environment variables from the .env file
require('dotenv').config();

// Export the event handler module
module.exports = {
    name: RCEEvent.PlayerListUpdate,

    // Asynchronous function to execute when a player joins the server
    async execute(data, rce, client) {
        const { server, players, joined, left } = data; // Destructure data for clarity

    },
};