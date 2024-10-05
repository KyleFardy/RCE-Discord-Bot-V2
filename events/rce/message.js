// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the message event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.Message,

    // Asynchronous function to execute when a message event occurs
    async execute(data, rce, client) {
        // Construct the log message with the server identifier and the received message

        if (process.env.CONSOLE_LOG === 'true' && !client.functions.is_empty(process.env.CONSOLE_LOG_CHANNEL)) {
            data.message = data.message.trim().replace(/\\n/g, "").replace(/\\/g, "");

            // Format the response for pretty printing if it is valid JSON
            const formattedResponse = client.functions.is_json(data.message)
                ? `\`\`\`json\n${JSON.stringify(JSON.parse(data.message), null, 2)}\n\`\`\`` // Pretty-print the JSON
                : `\`${data.message}\``;

            await client.functions.discord_log(client, `**[${data.server.identifier}]** ${formattedResponse}`, process.env.CONSOLE_LOG_CHANNEL);
        }


        // Log the message
        //await client.functions.log("info", `\x1b[38;5;208m[${data.server.identifier}]\x1b[0m \x1b[32;1m[MESSAGE]\x1b[0m ${data.message}`);
    }
};
