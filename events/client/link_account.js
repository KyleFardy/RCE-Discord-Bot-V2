const {
  Events,
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
} = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'link_account') {
      await handle_link_account(interaction, client);
    }
  },
};

async function handle_link_account(interaction, client) {
  const existingLink = await client.functions.check_link(
    client,
    interaction.user.id
  );
  if (!existingLink) {
    const modal = create_link_modal();
    await interaction.showModal(modal);
  } else {
    await interaction.reply({
      content: 'You Have Already Linked Your Account!',
      ephemeral: true,
    });
  }
}

function create_link_modal() {
  const modal = new ModalBuilder()
    .setCustomId('link_modal')
    .setTitle('Account Linking');

  const gamertag = new TextInputBuilder()
    .setCustomId('gamertag')
    .setLabel('Enter Your In Game Name')
    .setStyle('Short');

  const actionRow = new ActionRowBuilder().addComponents(gamertag);
  modal.addComponents(actionRow);

  return modal;
}
