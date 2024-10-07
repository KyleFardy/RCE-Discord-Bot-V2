// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the message event handler module
module.exports = {
    name: RCEEvent.Message,

    // Asynchronous function to execute when a message event occurs
    async execute(data, rce, client) {
        // Check if console logging is enabled and the log channel is specified
        if (process.env.CONSOLE_LOG === 'true' && !client.functions.is_empty(process.env.CONSOLE_LOG_CHANNEL)) {
            data.message = data.message.trim().replace(/\\n/g, "").replace(/\\/g, "");

            // Format the response for pretty printing if it is valid JSON
            const formatted_response = format_response(data.message, client);

            await client.functions.discord_log(client, `**[${data.server.identifier}]** ${formatted_response}`, process.env.CONSOLE_LOG_CHANNEL);
        }

        // Log the message
        // await client.functions.log("info", `\x1b[38;5;208m[${data.server.identifier}]\x1b[0m \x1b[32;1m[MESSAGE]\x1b[0m ${data.message}`);
    }
};

// Format the response message, prettifying it if it is valid JSON
function format_response(message, client) {
    return client.functions.is_json(message)
        ? `\`\`\`json\n${JSON.stringify(JSON.parse(message), null, 2)}\n\`\`\`` // Pretty-print the JSON
        : `\`${message}\``; // Return as plain text
}
