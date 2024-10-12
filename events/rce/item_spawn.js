// Import necessary components from the rce.js library
const { RCEEvent } = require("rce.js");

// Export the event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.ItemSpawn,

    async execute(data, rce, client) {
        const { server, ign, quantity, item } = data; // Destructure the data object for easier access

        // Log an informational message indicating that an item has been spawned
        await client.functions.log("debug", format_item_spawn_message(server, ign, quantity, item));
        const current_server = await client.functions.get_server(client, data.server.identifier);

        try {
            const itemImageUrl = await client.functions.get_item_image(item);
            const memberName = get_member_name(client, ign, current_server);

            // Construct the embed message for the item spawn event
            await client.functions.send_embed(client, current_server.item_spawning_channel_id,
                `${server.identifier} - Item Spawned`, "", [
                { name: 'Receiver', value: `👤 ${memberName}`, inline: true },
                { name: 'Time', value: `🕜 <t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: 'Item Received', value: `***${item}***`, inline: true },
                { name: 'Amount Received', value: `**${quantity}**`, inline: true },
            ], itemImageUrl);
        } catch (error) {
            await client.functions.log("error", `Failed to send Item Spawned embed for ${item} to ${current_server.item_spawning_channel_id}:`, error);
        }
    }
};
// Format the item spawn log message for output
function format_item_spawn_message(server, ign, quantity, item) {
    return `\x1b[38;5;208m[${server.identifier}]\x1b[0m \x1b[32;1m[ITEM SPAWNED]\x1b[0m ${ign} was given \x1b[38;5;208m${quantity}\x1b[0m x ${item}!`;
}

// Get the member name from the guild cache
function get_member_name(client, ign, server) {
    return client.guilds.cache.get(server.guild_id)?.members.cache.find(member => member.nickname === ign || member.user.username === ign)?.toString() || ign;
}
