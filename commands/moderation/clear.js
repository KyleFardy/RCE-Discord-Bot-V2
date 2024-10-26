const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear A Specified Number Of Messages From The Channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages) // Requires Manage Messages permission
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('Number Of Messages To Delete (1-100)')
        .setRequired(true) // Make the amount required
        .setMinValue(1) // Set minimum value to 1
        .setMaxValue(100)
    ), // Set maximum value to 100
  async execute(interaction) {
    await clear_messages(interaction);
  },
};

async function clear_messages(interaction) {
  const amount = interaction.options.getInteger('amount'); // Get the amount of messages to delete

  // Check if the amount is valid
  if (amount < 1 || amount > 100) {
    return interaction.reply({
      content: 'You Need To Specify An Amount Between 1 And 100!',
      ephemeral: true, // Only the user who ran the command can see this message
    });
  }

  // Attempt to delete the messages
  try {
    const deletedMessages = await interaction.channel.bulkDelete(amount, true);
    return interaction.reply({
      content: `Successfully Deleted **${deletedMessages.size}** Messages!`,
      ephemeral: true, // Only the user who ran the command can see this message
    });
  } catch (error) {
    console.error(error);
    return interaction.reply({
      content:
        'There Was An Error Trying To Clear Messages, Please Ensure I Have The Necessary Permissions!',
      ephemeral: true, // Only the user who ran the command can see this message
    });
  }
}
