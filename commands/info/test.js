const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const shown_message = {};
module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Test Command')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute(interaction) {
        
    },
};
