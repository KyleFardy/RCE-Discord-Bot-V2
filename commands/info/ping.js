const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot\'s latency and WebSocket ping')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute(interaction) {
        try {
            // Initial loading message
            const initialReply = await interaction.reply({ content: 'Pinging...', ephemeral: true, fetchReply: true });

            // Calculate latency based on reply delay
            const latency = initialReply.createdTimestamp - interaction.createdTimestamp;
            const apiPing = interaction.client.ws.ping;  // WebSocket ping

            // Send the final response with detailed ping info
            await interaction.editReply({
                content: `🏓 Pong! \n**Bot Latency:** ${latency}ms \n**WebSocket Ping:** ${apiPing}ms`,
                ephemeral: true // Keep this response hidden (can modify this based on command options)
            });
        } catch (error) {
            // Log an error if the reply or editing fails
            await interaction.client.functions.log("error", `Failed To Reply To Interaction: ${error.message}`);

            // Send a fallback error response
            try {
                await interaction.editReply({ content: 'An Error Occurred While Processing Your Request.', ephemeral: true });
            } catch (editError) {
                // Handle case if editing reply also fails
                await interaction.client.functions.log("error", `Failed To Edit Interaction Reply: ${editError.message}`);
            }
        }
    },
};
