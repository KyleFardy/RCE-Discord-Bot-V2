const { Events, ModalBuilder, TextInputBuilder, ActionRowBuilder } = require('discord.js');
module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.isButton()) return;
        if (interaction.customId === 'link_account') {
            const existingLink = await client.functions.check_link(client, interaction.user.id);
            if (!existingLink) {
                const modal = new ModalBuilder()
                    .setCustomId('link_modal')
                    .setTitle('Account Linking');

                const gamertag = new TextInputBuilder()
                    .setCustomId('gamertag')
                    .setLabel("Enter Your In Game Name")
                    .setStyle('Short'); // Use 'Short' for a short input

                // Create an action row and add the text input
                const actionRow = new ActionRowBuilder().addComponents(gamertag);

                // Add the action row to the modal
                modal.addComponents(actionRow);

                // Show the modal to the user
                await interaction.showModal(modal);
            } else {
                await interaction.reply({ content: "You Have Already Linked Your Account!", ephemeral: true });
            }
        }
    }
}