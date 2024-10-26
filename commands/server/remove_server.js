const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeserver')
    .setDescription('Remove One Of Your Servers')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName('server')
        .setDescription('Select The Server To Remove')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    try {
      const servers = await interaction.client.functions.get_servers_by_guild(
        interaction.client,
        interaction.guildId
      );

      // Respond with the filtered list of server names and their values (identifiers)
      await interaction.respond(
        servers.map((server) => ({
          name: `[${server.region}] ${server.identifier} - ${server.server_id}`,
          value: server.identifier,
        }))
      );
    } catch (error) {
      await interaction.client.functions.log(
        'error',
        'Error In Auto Complete:',
        error
      ); // Log any errors
    }
  },

  async execute(interaction) {
    // Respond immediately to acknowledge the interaction
    await interaction.reply({
      content: 'Processing Your Request...',
      ephemeral: true,
    });

    // Get the selected server identifier from options
    const server_identifier = interaction.options.getString('server');

    // Fetch the server to remove from the database
    const server_to_remove = await interaction.client.functions.get_server(
      interaction.client,
      server_identifier,
      interaction.guildId
    );

    if (typeof server_to_remove === 'string') {
      return await interaction.followUp({
        content: server_to_remove,
        ephemeral: true,
      });
    }

    // Array of channel IDs to remove
    const channel_ids = [
      server_to_remove.link_channel_id,
      server_to_remove.kill_feeds_channel_id,
      server_to_remove.events_channel_id,
      server_to_remove.stats_channel_id,
      server_to_remove.chat_logs_channel_id,
      server_to_remove.item_spawning_channel_id,
      server_to_remove.kits_logs_channel_id,
      server_to_remove.team_logs_channel_id,
      server_to_remove.teleport_logs_channel_id,
      server_to_remove.shop_channel_id,
      server_to_remove.settings_channel_id,
    ];

    try {
      // Remove channels first
      await Promise.all(
        channel_ids.map(async (channel_id) => {
          if (channel_id) {
            const channel = await interaction.guild.channels
              .fetch(channel_id)
              .catch(() => null);
            if (channel) {
              await channel.delete().catch(() => null);
            }
          }
        })
      );

      // Remove the single category
      const category_id = server_to_remove.category_id;
      if (category_id) {
        const category = await interaction.guild.channels
          .fetch(category_id)
          .catch(() => null);
        if (category && category.type === 4) {
          await category.delete().catch(() => null);
        }
      }
    } catch (error) {
      await interaction.client.functions.log(
        'debug',
        'Error Deleting Channels Or Category:',
        error
      );
    }

    // Perform the removal logic for the server itself
    try {
      await interaction.client.functions.delete_server(
        interaction.client,
        server_to_remove.guild_id,
        server_to_remove.region,
        server_to_remove.server_id,
        server_to_remove.identifier
      );
      const server = await interaction.client.rce.servers.get(
        server_identifier
      );
      await interaction.client.rce.servers.remove(server);

      const server_embed = new EmbedBuilder()
        .setColor(process.env.EMBED_COLOR)
        .setTitle(`Server Removed: ${server_to_remove.identifier}`)
        .setDescription(
          `You Have Successfully Removed The Server **${server_to_remove.identifier}**!`
        )
        .setTimestamp()
        .addFields(
          {
            name: 'Server ID',
            value: ` ${server_to_remove.server_id} `,
            inline: true,
          },
          {
            name: 'Region',
            value: ` ${server_to_remove.region} `,
            inline: true,
          }
        )
        .setFooter({
          text: process.env.EMBED_FOOTER_TEXT,
          iconURL: process.env.EMBED_LOGO,
        });

      // Follow up with the final message
      await interaction.followUp({
        embeds: [server_embed],
        ephemeral: true,
      });
    } catch (error) {
      await interaction.client.functions.log(
        'debug',
        'Error Removing Server:',
        error
      );
      return await interaction.followUp({
        content: 'An Error Occurred While Removing The Server!',
        ephemeral: true,
      });
    }
  },
};
