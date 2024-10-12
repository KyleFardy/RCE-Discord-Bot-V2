// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the message event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.KitGive,

    // Asynchronous function to execute when a kit give event occurs
    async execute(data, rce, client) {
        await client.functions.log("info", `\x1b[38;5;208m[${data.server.identifier}]\x1b[0m \x1b[32;1m[KIT GIVEN]\x1b[0m ${data.admin} Has Given Kit \x1b[38;5;208m${data.kit}\x1b[0m To \x1b[38;5;208m${data.ign}\x1b[0m!`);

        const current_server = await client.functions.get_server(client, data.server.identifier);
        const admin_name = get_member_name(client, data.admin, current_server);
        const member_name = get_member_name(client, data.ign, current_server);
        await client.functions.send_embed(client, current_server.kits_logs_channel_id, `${data.server.identifier} - Kit Given`, "", [
            { name: 'Given By', value: `👤 ${admin_name}`, inline: true },
            { name: 'Receiver', value: `👤 ${member_name}`, inline: true },
            { name: 'Kit', value: `***${data.kit}***`, inline: true },
            { name: 'Time', value: `🕜 <t:${Math.floor(new Date().getTime() / 1000)}:R>`, inline: true },
        ], "https://cdn.void-dev.co/ak.png");
    }
};
// Get the member name from the guild cache
function get_member_name(client, ign, server) {
    return client.guilds.cache.get(server.guild_id)?.members.cache.find(member => member.nickname === ign || member.user.username === ign)?.toString() || ign;
}
