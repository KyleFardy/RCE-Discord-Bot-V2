module.exports = {
    name: 'ping', // Name of the command
    description: 'Replies with Pong!', // Description of the command
    async execute(interaction) {
        try {
            // Reply to the interaction with 'Pong!'
            await interaction.reply('Pong!');
        } catch (error) {
            // Log an error if the reply fails
            console.error(`Failed to reply to interaction: ${error.message}`);
        }
    },
};
