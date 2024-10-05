// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the message event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.KitSpawn,

    // Asynchronous function to execute when a message event occurs
    async execute(data, rce, client) {
        // Construct the log message with the server identifier and the received message
        await client.functions.log("info", `\x1b[38;5;208m[${data.server.identifier}]\x1b[0m \x1b[32;1m[KIT SPAWNED]\x1b[0m ${data.ign} Was Given Kit \x1b[38;5;208m${data.kit}\x1b[0m!`);

        if (process.env.KITS_LOGS === 'true' && !client.functions.is_empty(process.env.KITS_LOG_CHANNEL)) {
            await client.functions.send_embed(client, process.env.KITS_LOG_CHANNEL, `${data.server.identifier} - Kit Spawned`, "", [
                { name: 'Receiver', value: `👤 ${data.ign}`, inline: true },
                { name: 'Time', value: `🕜 <t:${Math.floor(new Date().getTime() / 1000)}:R>`, inline: true },
                { name: 'Kit', value: `***${data.kit}***`, inline: true },
            ], "https://cdn.void-dev.co/ak.png");
        }
    }
};
