// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the message event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.KitSpawn,

    // Asynchronous function to execute when a kit spawn event occurs
    async execute(data, rce, client) {
        await client.functions.log("info", format_kit_spawn_message(data));
        // Check if we should log the kit spawn event
        if (should_log_kit_spawn(client)) {

            const member_name = get_member_name(client, data.ign);
            await client.functions.send_embed(client, process.env.KITS_LOG_CHANNEL, `${data.server.identifier} - Kit Spawned`, "", [
                { name: 'Receiver', value: `👤 ${member_name}`, inline: true },
                { name: 'Time', value: `🕜 <t:${Math.floor(new Date().getTime() / 1000)}:R>`, inline: true },
                { name: 'Kit', value: `***${data.kit}***`, inline: true },
            ], "https://cdn.void-dev.co/ak.png");
        }
    }
};

// Check if we should log the kit spawn event
function should_log_kit_spawn(client) {
    return process.env.KITS_LOGS === 'true' && !client.functions.is_empty(process.env.KITS_LOG_CHANNEL);
}

// Format the kit spawn log message for output
function format_kit_spawn_message(data) {
    return `\x1b[38;5;208m[${data.server.identifier}]\x1b[0m \x1b[32;1m[KIT SPAWNED]\x1b[0m ${data.ign} Was Given Kit \x1b[38;5;208m${data.kit}\x1b[0m!`;
}

// Get the member name from the guild cache
function get_member_name(client, ign) {
    return client.guilds.cache.get(process.env.GUILD_ID)?.members.cache.find(member => member.nickname === ign || member.user.username === ign)?.toString() || ign;
}
