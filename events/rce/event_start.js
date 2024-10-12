// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");
require('dotenv').config(); // Load environment variables from .env file

module.exports = {
    name: RCEEvent.EventStart,

    async execute(data, rce, client) {
        // Retrieve event details from the structured messages
        const event_details = client.functions.event_messages[data.event];

        // Check if a message exists for the event
        if (event_details) {
            const { formatted, discord, console } = event_details;
            
            // Log the event start message
            await client.functions.log("info", `\x1b[38;5;208m[${data.server.identifier}]\x1b[0m \x1b[32m\x1b[1m[EVENT]\x1b[0m ${console}`);

            // Send the event message to the specified server
            await client.rce.servers.command(data.server.identifier, `global.say ${formatted}`);

            try {
                const current_server = await client.functions.get_server(client, data.server.identifier);
                await client.functions.send_embed(client, current_server.events_channel_id, `${data.server.identifier} - ${discord.title}`, discord.message, [], discord.image);
            } catch (error) {
                await client.functions.log("error", 'Failed to send event embed:', error);
            }
        } else {
            // Log an error if the event type is unrecognized
            await client.functions.log("error", `Unrecognized Event: ${data.event}`);
        }
    }
};
