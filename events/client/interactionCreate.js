const { Events } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    // Handle command interactions
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        return await interaction.reply({
          content: `An Error Occurred With Command "${interaction.commandName}".`,
          ephemeral: true,
        });
      }

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.log('Error executing command:', error);
        await interaction.reply({
          content: 'There Was An Error Executing This Command!',
          ephemeral: true,
        });
      }
    }

    // Handle autocomplete interactions
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.log('Error In Auto Complete:', error);
      }
    }
  },
};
