// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent, QuickChat } = require("rce.js");

// Export the message event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.QuickChat,

    // Asynchronous function to execute when a message event occurs
    async execute(data, rce, client) {
        // Construct the log message with the server identifier and the received message
        await client.functions.log("info", `\x1b[38;5;208m[${data.server.identifier}]\x1b[0m \x1b[32;1m[QUICK CHAT]\x1b[0m ${data.ign} Sent \x1b[38;5;208m${data.message}\x1b[0m!`);

        switch (data.message) {
            case QuickChat.COMBAT_WereUnderAttack:
                await client.functions.get_player_info(client, data.ign, data.server);
                break;
            case QuickChat.NEED_Wood:
                await client.functions.handle_kit(client, data.ign, data.server);
                break;
            case QuickChat.NEED_MetalFragments:
                await client.functions.handle_vip_kit(client, data.ign, data.server);
                break;
            case QuickChat.QUESTIONS_WantToTrade:
                await client.functions.handle_teleport(client, data.ign, process.env.OUTPOST, "Outpost", data.server);
                break;
            case QuickChat.QUESTIONS_CouldYouHelpMe:
                await client.functions.handle_teleport(client, data.ign, process.env.BANDIT, "Bandit Camp", data.server);
                break;
            default:
                console.log(data.message);
                break;
        }
    }
};
