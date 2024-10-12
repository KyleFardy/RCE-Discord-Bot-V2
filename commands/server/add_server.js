const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Add Your Server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Restrict command to users with Administrator permission

    async execute(interaction) {
        // Check if the user has the Administrator permission
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: 'You Do Not Have Permission To Use This Command!', ephemeral: true });
        }

        // Create the modal
        const modal = new ModalBuilder()
            .setCustomId('add_server')
            .setTitle('Add Your Server');

        // Add Text Inputs for the modal
        const identifier = new TextInputBuilder()
            .setCustomId('identifier')
            .setLabel('Server Identifier')
            .setPlaceholder('Can Be Anything')
            .setStyle('Short')
            .setRequired(true);

        const server_region = new TextInputBuilder()
            .setCustomId('server_region')
            .setPlaceholder('Either EU/US')
            .setLabel('Server Region')
            .setStyle('Short')
            .setRequired(true);

        const server_id = new TextInputBuilder()
            .setCustomId('server_id')
            .setPlaceholder('Your GPortal Server ID (Found In Address Bar)')
            .setLabel('Server ID')
            .setStyle('Short')
            .setRequired(true);

        // Add all text inputs into action rows
        modal.addComponents(
            new ActionRowBuilder().addComponents(identifier),
            new ActionRowBuilder().addComponents(server_region),
            new ActionRowBuilder().addComponents(server_id)
        );

        // Show the modal to the user
        await interaction.showModal(modal);
    },
};
