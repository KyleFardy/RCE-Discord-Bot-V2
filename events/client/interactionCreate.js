const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        await handle_chat_input_command(interaction, client);
    },
};

async function handle_chat_input_command(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
        await interaction.reply({
            content: `An Error Occurred With Command ${interaction.commandName}`,
            ephemeral: true
        });
        return; // Return early to avoid executing the command
    }

    await command.execute(interaction, client);
}
