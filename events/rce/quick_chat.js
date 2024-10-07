// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent, QuickChat } = require("rce.js");

// Export the message event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.QuickChat,

    // Asynchronous function to execute when a message event occurs
    async execute(data, rce, client) {
        const { server, ign, message } = data; // Destructure data for clarity

        // Log the quick chat message
        await log_quick_chat_message(client, server.identifier, ign, message);

        // Handle quick chat messages based on the predefined constants
        await handle_quick_chat_message(client, ign, server, message);
    }
};

// Helper function to log quick chat messages
async function log_quick_chat_message(client, server_id, ign, message) {
    const log_message = `\x1b[38;5;208m[${server_id}]\x1b[0m \x1b[32;1m[QUICK CHAT]\x1b[0m ${ign} Sent \x1b[38;5;208m${message}\x1b[0m!`;
    await client.functions.log("info", log_message);
}

// Helper function to handle quick chat messages
async function handle_quick_chat_message(client, ign, server, message) {
    switch (message) {
        case QuickChat.COMBAT_WereUnderAttack:
            await client.functions.get_player_info(client, ign, server);
            break;
        case QuickChat.NEED_Wood:
            await client.functions.handle_kit(client, ign, server);
            break;
        case QuickChat.NEED_MetalFragments:
            await client.functions.handle_vip_kit(client, ign, server);
            break;
        case QuickChat.QUESTIONS_WantToTrade:
            await client.functions.handle_teleport(client, ign, process.env.OUTPOST, "Outpost", server);
            break;
        case QuickChat.QUESTIONS_CouldYouHelpMe:
            await client.functions.handle_teleport(client, ign, process.env.BANDIT, "Bandit Camp", server);
            break;
    }
}
