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

            // Construct the log message
            const event_started_message = `\x1b[38;5;208m[${data.server.identifier}]\x1b[0m \x1b[32m\x1b[1m[EVENT]\x1b[0m ${console}`;

            // Log the event start message
            await client.functions.log("info", event_started_message);

            // Send the event message to the specified server
            await rce.sendCommand(data.server.identifier, `global.say ${formatted}`);

            // Check if logging to Discord is enabled
            if (should_log_event(client)) {
                try {
                    await client.functions.send_embed(client, process.env.EVENTS_LOG_CHANNEL, `${data.server.identifier} - ${discord.title}`, discord.message, [], discord.image);
                } catch (error) {
                    await client.functions.log("error", 'Failed to send event embed:', error);
                }
            }
        } else {
            // Log an error if the event type is unrecognized
            await client.functions.log("error", `Unrecognized Event: ${data.event}`);
        }
    }
};

// Check if we should log the event
function should_log_event(client) {
    return process.env.EVENTS_LOG === 'true' && !client.functions.is_empty(process.env.EVENTS_LOG_CHANNEL);
}
