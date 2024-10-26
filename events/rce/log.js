// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require('rce.js');

// Export the log event handler module
module.exports = {
  // Set the name of the event this handler listens for
  name: RCEEvent.Log,

  // Asynchronous function to execute when a log event occurs
  async execute(data, rce, client) {
    // Construct the log message using the level and content from the data
    const logMessage = `[${data.level}] [LOG] ${data.content}`;

    // Log the message with the specified level (info, warning, error, etc.)
    await client.functions.log('info', logMessage);
  },
};
