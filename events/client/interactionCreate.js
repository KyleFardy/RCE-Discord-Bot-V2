const { Events } = require('discord.js');
module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;
        const command = client.commands.get(interaction.commandName);
        if (!command) {
            await interaction.reply({
                content: `An Error Occurred With Command ${interaction.commandName}`,
                ephemeral: true
            });
        }
        command.execute(interaction, interaction.client);
    }
}