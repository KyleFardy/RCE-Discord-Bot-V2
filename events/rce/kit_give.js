// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the message event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.KitGive,

    // Asynchronous function to execute when a message event occurs
    async execute(data, rce, client) {
        // Construct the log message with the server identifier and the received message
        await client.functions.log("info", `\x1b[38;5;208m[${data.server.identifier}]\x1b[0m \x1b[32;1m[KIT GIVEN]\x1b[0m ${data.admin} Has Given Kit \x1b[38;5;208m${data.kit}\x1b[0m To \x1b[38;5;208m${data.ign}\x1b[0m!`);

        if (process.env.KITS_LOGS === 'true' && !client.functions.is_empty(process.env.KITS_LOG_CHANNEL)) {
            await client.functions.send_embed(client, process.env.KITS_LOG_CHANNEL, `${data.server.identifier} - Kit Given`, "", [
                { name: 'Given By', value: `👤 ${data.admin}`, inline: true },
                { name: 'Receiver', value: `👤 ${data.ign}`, inline: true },
                { name: 'Kit', value: `***${data.kit}***`, inline: true },
                { name: 'Time', value: `🕜 <t:${Math.floor(new Date().getTime() / 1000)}:R>`, inline: true },
            ], "https://cdn.void-dev.co/ak.png");
        }
    }
};
