const {
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { RCEManager, LogLevel } = require('rce.js');

const shown_message = {};

module.exports = {
  name: Events.ClientReady,
  async execute(client) {
    try {
      await log_successful_login(client);
      await initialize_servers(client);
      await update_auto_messages(client);
      setInterval(() => {
        update_presence(client).catch(console.error); // Log any errors
      }, 60000);

      // Initial call to set the presence immediately
      update_presence(client).catch(console.error);
    } catch (error) {
      await log_initialization_error(client, error);
    }
  },
};

async function log_successful_login(client) {
  await client.functions.log(
    'info',
    `\x1b[34;1m[BOT]\x1b[0m Logged In As ${client.user.tag}!`
  );
}

async function initialize_servers(client) {
  const servers = await client.rce.servers.getAll();
  servers.forEach(async (server) => {
    if (server.flags.indexOf('READY') === -1) return;

    try {
      const db_server = await client.functions.get_server(
        client,
        server.identifier
      );
      const server_response = await client.rce.servers.info(
        db_server.identifier,
        true
      );
      const guild = await client.guilds.cache.get(db_server.guild_id); // Assuming you store guild_id in the server object
      const settingsChannelId = db_server.settings_channel_id; // Assuming this is stored in your server object

      if (!shown_message[db_server.identifier]) {
        await client.functions.log(
          'success',
          `\x1b[32;1m[${
            db_server.identifier
          }]\x1b[0m Successfully Connected To ${await client.functions.format_hostname(
            server_response.Hostname
          )}`
        );
        shown_message[db_server.identifier] = true;
      }

      // Fetch the settings channel
      try {
        const settingsChannel = await guild.channels.cache.get(
          settingsChannelId
        );
        if (!settingsChannel) {
          await client.functions.log(
            'warning',
            `\x1b[33;1m[${db_server.identifier}]\x1b[0m Settings channel not found with ID: ${settingsChannelId}`
          );
          return; // Exit early if the channel is not found
        }

        await client.functions.log(
          'debug',
          `\x1b[34;1m[${db_server.identifier}]\x1b[0m Fetching settings channel with ID: ${settingsChannelId}`
        );

        const settingsEmbed = await client.functions.create_settings_embed(
          client,
          db_server.identifier
        );
        const actionRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`edit_settings_${db_server.identifier}`)
            .setLabel('Edit')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId(`refresh_settings_${db_server.identifier}`)
            .setLabel('Refresh')
            .setStyle(ButtonStyle.Primary)
        );

        const messages = await settingsChannel.messages.fetch();
        const lastMessage = messages.find((msg) => msg.embeds.length > 0);

        if (lastMessage) {
          await client.functions.log(
            'debug',
            `\x1b[34;1m[${db_server.identifier}]\x1b[0m Updating existing settings embed message`
          );
          await lastMessage.edit({
            embeds: [settingsEmbed],
            components: [actionRow],
          });
        } else {
          await client.functions.log(
            'debug',
            `\x1b[34;1m[${db_server.identifier}]\x1b[0m Sending new settings embed message`
          );
          await settingsChannel.send({
            embeds: [settingsEmbed],
            components: [actionRow],
          });
        }
      } catch (error) {
        await client.functions.log(
          'error',
          `\x1b[31;1m[${db_server.identifier}]\x1b[0m Error handling the settings channel: ${error.message}`
        );
        console.error('Settings Channel Error:', error); // Detailed error for further debugging
      }
    } catch (error) {
      // Log an error message if parsing or command execution fails
      await client.functions.log(
        'error',
        `\x1b[31;1m[${server.identifier}]\x1b[0m Failed To Parse Server Data: ${error.message}`
      );
    }
  });
}

async function update_auto_messages(client) {
  if (client.auto_messages.enabled) {
    const servers = await client.rce.servers.getAll();
    servers.forEach(async (server) => {
      if (!server.ready) return;

      await client.functions.send_auto_messages(client, server);
    });
  }
}

async function update_presence(client) {
  const players = await client.functions.get_count(
    client,
    'SELECT COUNT(*) as count FROM players'
  );
  await client.user.setPresence({
    activities: [
      {
        name: 'Rust: Console Edition',
        type: 0, // ActivityType
        state: `Watching ${client.rce.servers.size} Servers With ${players} Players`,
        largeImage: 'rce',
        smallImage: 'rce',
        buttons: [
          {
            label: 'Github',
            url: 'https://github.com/KyleFardy/RCE-Discord-Bot-V2',
          },
          { label: 'Discord', url: 'https://discord.void-dev.co/' },
        ],
      },
    ],
    status: 'online',
  });
}

async function log_initialization_error(client, error) {
  await client.functions.log(
    'error',
    `\x1b[34;1m[BOT]\x1b[0m Failed To Initialize: ${error.message}`,
    error
  );
}
