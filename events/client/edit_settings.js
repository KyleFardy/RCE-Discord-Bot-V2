const {
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    // Extract the custom ID from the interaction
    const button = interaction.customId;

    // Check if the interaction is for the "Edit" button
    if (button.startsWith('edit_settings_')) {
      const server_id = button.split('_')[2]; // Extract server ID from customId

      // Handle the editing of settings here
      await interaction.reply({
        content: `You clicked the Edit button for server: **${server_id}**. Implement your editing logic here.`,
        ephemeral: true,
      });
    } else if (button.startsWith('refresh_settings_')) {
      const server_id = button.split('_')[2]; // Extract server ID from customId

      try {
        const db_server = await client.functions.get_server(client, server_id);
        const guild = await client.guilds.cache.get(db_server.guild_id); // Assuming you store guild_id in the server object
        const settingsChannelId = db_server.settings_channel_id; // Assuming this is stored in your server object

        // Acknowledge the button press to prevent interaction timeout
        await interaction.deferUpdate();

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
        console.error('Error while refreshing settings:', error);
        await interaction.reply({
          content: 'An error occurred while refreshing settings.',
          ephemeral: true,
        });
      }
    }
  },
};
