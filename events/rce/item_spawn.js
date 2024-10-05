// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.ItemSpawn,

    // Asynchronous function to execute when an item is spawned
    async execute(data, rce, client) {
        // Log an informational message indicating that an item has been spawned
        await client.functions.log("info", `\x1b[38;5;208m[${data.server.identifier}]\x1b[0m \x1b[32;1m[ITEM SPAWNED]\x1b[0m ${data.ign} Was Given \x1b[38;5;208m${data.quantity}\x1b[0mx ${data.item}!`);
        if (process.env.ITEM_SPAWN_LOG === 'true' && !client.functions.is_empty(process.env.ITEM_SPAWN_CHANNEL)) {
            try {
                var image_url = await client.functions.get_item_image(data.item);
                await client.functions.send_embed(client, process.env.ITEM_SPAWN_CHANNEL, `${data.server.identifier} - Item Spawned`, "", [
                    { name: 'Receiver', value: `👤 ${data.ign}`, inline: true },
                    { name: 'Time', value: `🕜 <t:${Math.floor(new Date().getTime() / 1000)}:R>`, inline: true },
                    { name: 'Item Received', value: `***${data.item}***`, inline: true },
                    { name: 'Amount Received', value: `**${data.quantity}**`, inline: true },
                ], image_url);
            } catch (error) {
                await client.functions.log("error", 'Failed To Send Item Spawned Embed:', error);
            }
        }
    }
};
