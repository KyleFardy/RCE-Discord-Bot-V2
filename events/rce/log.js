// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the log event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.Log,

    // Asynchronous function to execute when a log event occurs
    async execute(data, rce, client) {
        // Construct the log message using the level and content from the data
        await client.functions.log("info", `\x1b[38;5;208m[${data.level}]\x1b[0m \x1b[32;1m[LOG]\x1b[0m ${data.content}`);
    }
};
