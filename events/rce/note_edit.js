// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require('rce.js');

// Export the message event handler module
module.exports = {
  name: RCEEvent.NoteEdit,

  // Asynchronous function to execute when a message event occurs
  async execute(data, rce, client) {
    const { server, ign, old_content, new_content } = data; // Destructure data for clarity

    const current_server = await client.functions.get_server(
      client,
      data.server.identifier
    );

    const new_message = sanitize_message(new_content);
    const is_blacklisted = await check_blacklisted(ign, client);

    if (is_blacklisted) {
      await handle_blacklisted_message(
        server.identifier,
        ign,
        new_message,
        client
      );
      return;
    }

    await log_new_message(server.identifier, ign, new_content, client);
    await send_chat_message(server.identifier, ign, new_message, client);
    await log_chat_message(
      old_content,
      new_content,
      ign,
      client,
      current_server
    );
  },
};

// Sanitize the new message by redacting certain patterns
function sanitize_message(message) {
  return message.replace(/\b\d{4}\b/g, '[REDACTED]').replace('@', '@/'); // Redact 4-digit numbers and escape "@" symbol
}

// Check if the player is blacklisted
async function check_blacklisted(ign, client) {
  const [rows] = await client.database_connection.query(
    'SELECT * FROM chat_blacklist WHERE display_name = ?',
    [ign]
  );
  return rows.length !== 0;
}

// Handle a message from a blacklisted player
async function handle_blacklisted_message(server_id, ign, new_message, client) {
  await client.rce.servers.command(
    server_id,
    `global.say <color=green>[CHAT]</color> <color=#3498eb><b>${ign}</b></color> <color=red><b>Is Banned From Chatting!</b></color>`
  );
  await client.functions.log(
    'error',
    `[BLACKLISTED MESSAGE] ${ign} : ${new_message}`
  );
}

// Log a new message from a player
async function log_new_message(server_id, ign, new_content, client) {
  await client.functions.log(
    'info',
    `\x1b[38;5;208m[${server_id}]\x1b[0m \x1b[32;1m[NEW MESSAGE]\x1b[0m ${ign} Sent \x1b[38;5;208m${new_content}\x1b[0m!`
  );
}

// Send a chat message to the server
async function send_chat_message(server_id, ign, new_message, client) {
  await client.rce.servers.command(
    server_id,
    `global.say <color=green>[CHAT]</color> <color=#3498eb><b>${ign}</b></color> : ${new_message}`
  );
}

// Log chat messages to a channel
async function log_chat_message(old_content, new_content, ign, client, server) {
  const member_name =
    client.guilds.cache
      .get(server.guild_id)
      ?.members.cache.find(
        (member) => member.nickname === ign || member.user.username === ign
      )
      ?.toString() || ign;

  await client.functions.send_embed(
    client,
    server.chat_logs_channel_id,
    'New Message',
    '',
    [
      { name: 'Player', value: `👤 ${member_name}`, inline: true },
      { name: '\u200B\u200B', value: '\u200B\u200B', inline: true },
      { name: 'Old Message', value: `${old_content}`, inline: true },
      { name: 'New Message', value: `${new_content}`, inline: true },
      {
        name: 'Time',
        value: `🕜 <t:${Math.floor(new Date().getTime() / 1000)}:R>`,
        inline: true,
      },
    ],
    'https://cdn.void-dev.co/chat.png'
  );
}
