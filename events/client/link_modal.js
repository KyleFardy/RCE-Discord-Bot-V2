const {
  Events,
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
} = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'link_modal') {
      await handle_link_modal(interaction, client);
    }
  },
};

async function handle_link_modal(interaction, client) {
  const result = await interaction.fields.getTextInputValue('gamertag');
  if (!result) {
    return await reply_with_gamertag_error(interaction);
  }

  if (!client.functions.is_empty(result)) {
    const existing_link = await client.functions.check_link(
      client,
      interaction.user.id
    );
    if (existing_link) {
      return await reply_with_existing_link_error(interaction);
    } else {
      return await process_link(interaction, client, result);
    }
  } else {
    return await reply_with_gamertag_error(interaction);
  }
}

async function reply_with_gamertag_error(interaction) {
  await interaction.reply({
    content: 'Please Enter Your Gamertag!',
    ephemeral: true,
  });
}

async function reply_with_existing_link_error(interaction) {
  await interaction.reply({
    content: 'Your Discord Is Already Linked To An Account!',
    ephemeral: true,
  });
}

async function process_link(interaction, client, gamertag) {
  try {
    const [rows] = await client.database_connection.query(
      `SELECT * FROM players WHERE display_name = ? AND (discord_id IS NULL OR discord_id = '')`,
      [gamertag]
    );

    if (rows.length > 0) {
      await link_account(interaction, client, gamertag);
    } else {
      await reply_with_link_error(interaction, gamertag);
    }
  } catch (error) {
    await handle_link_error(interaction, error);
  }
}

async function link_account(interaction, client, gamertag) {
  // Fetch linked_role_id from the database
  const [rows] = await client.database_connection.query(
    'SELECT linked_role_id FROM servers WHERE guild_id = ?',
    [interaction.guild.id]
  );

  if (rows.length === 0) {
    return await interaction.reply({
      content: 'No linked role found for this server.',
      ephemeral: true,
    });
  }

  const linkedRoleId = rows[0].linked_role_id; // Get the linked role ID

  // Update the player's discord ID in the database
  await client.database_connection.query(
    'UPDATE players SET discord_id = ? WHERE display_name = ?',
    [interaction.user.id, gamertag]
  );

  const member = interaction.guild.members.cache.get(interaction.user.id);
  try {
    await member.setNickname(gamertag);
    await member.roles.add(linkedRoleId); // Add the linked role using the fetched ID
  } catch (error) {
    console.error('Failed to update nickname or add role:', error);
  }

  await interaction.reply({
    content: `Linked Your Discord To **${gamertag}**!`,
    ephemeral: true,
  });
}

async function reply_with_link_error(interaction, gamertag) {
  await interaction.reply({
    content: `Either The Gamertag **${gamertag}** Is Already Linked Or Does Not Exist, Please Kill Somebody Or Relog!`,
    ephemeral: true,
  });
}

async function handle_link_error(interaction, error) {
  console.error('[DISCORD LINK]', error);
  await interaction.reply({
    content: `An Error Occurred While Linking The Account!\n${error}`,
    ephemeral: true,
  });
}
