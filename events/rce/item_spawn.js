// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.ItemSpawn,

    // Asynchronous function to execute when an item is spawned
    async execute(data, rce, client) {
        // Log an informational message indicating that an item has been spawned
        const itemSpawnedMessage = `[${data.server.identifier}] [ITEM SPAWNED] ${data.ign} Was Given ${data.quantity}x ${data.item}!`;

        // Utilize the logging function from the client to log the join event
        await client.functions.log("info", itemSpawnedMessage);
    }
};
