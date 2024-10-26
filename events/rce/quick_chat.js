// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent, QuickChat } = require('rce.js');

// Export the message event handler module
module.exports = {
  // Set the name of the event this handler listens for
  name: RCEEvent.QuickChat,

  // Asynchronous function to execute when a message event occurs
  async execute(data, rce, client) {
    const { server, ign, message } = data; // Destructure data for clarity

    const current_server = await client.functions.get_server(
      client,
      data.server.identifier
    );
    // Log the quick chat message
    await log_quick_chat_message(client, server.identifier, ign, message);

    // Handle quick chat messages based on the predefined constants
    await handle_quick_chat_message(
      client,
      ign,
      server,
      message,
      current_server
    );
  },
};

// Helper function to log quick chat messages
async function log_quick_chat_message(client, server_id, ign, message) {
  await client.functions.log(
    'info',
    `\x1b[38;5;208m[${server_id}]\x1b[0m \x1b[32;1m[QUICK CHAT]\x1b[0m ${ign} Sent \x1b[38;5;208m${message}\x1b[0m!`
  );
}

// Helper function to handle quick chat messages
async function handle_quick_chat_message(
  client,
  ign,
  server,
  message,
  current_server
) {
  switch (message) {
    case QuickChat.COMBAT_WereUnderAttack:
      await client.functions.get_player_info(client, ign, server);
      break;
    case QuickChat.NEED_Wood:
      await client.functions.handle_kit(client, ign, current_server, server);
      break;
    case QuickChat.NEED_MetalFragments:
      await client.functions.handle_vip_kit(
        client,
        ign,
        current_server,
        server
      );
      break;
    case QuickChat.QUESTIONS_WantToTrade:
      if (client.functions.is_empty(current_server.outpost)) {
        await client.rce.servers.command(
          server.identifier,
          `say <color=green><b>[TELEPORT]</b></color> <color=green><b>Outpost</b></color> Teleport Has <color=red><b>Not</b></color> Been Setup Yet!`
        );
        return;
      }
      await client.functions.handle_teleport(
        client,
        ign,
        current_server.outpost,
        'Outpost',
        server
      );
      break;
    case QuickChat.QUESTIONS_CouldYouHelpMe:
      if (client.functions.is_empty(current_server.bandit)) {
        await client.rce.servers.command(
          server.identifier,
          `say <color=green><b>[TELEPORT]</b></color> <color=green><b>Bandit Camp</b></color> Teleport Has <color=red><b>Not</b></color> Been Setup Yet!`
        );
        return;
      }
      await client.functions.handle_teleport(
        client,
        ign,
        current_server.bandit,
        'Bandit Camp',
        server
      );
      break;
  }
}
