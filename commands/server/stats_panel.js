const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription("Send The Embed For Stats")
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers | PermissionFlagsBits.BanMembers | PermissionFlagsBits.ManageGuild | PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        await check_permissions_and_send_stats_embed(interaction);
    },
};

async function check_permissions_and_send_stats_embed(interaction) {
    // Check if the member has the required permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers | PermissionFlagsBits.BanMembers | PermissionFlagsBits.ManageGuild | PermissionFlagsBits.ManageMessages)) {
        return await interaction.reply({ content: "You Do Not Have Permission To Use This Command!", ephemeral: true });
    }

    const channel = await interaction.client.channels.cache.get(process.env.STATS_CHANNEL);

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('view_stats').setLabel('View Statistics').setStyle('Success')
    );

    const embed = new EmbedBuilder()
        .setColor(process.env.EMBED_COLOR)
        .setTitle('Player Statistics')
        .setThumbnail(process.env.EMBED_LOGO)
        .setFooter({ text: process.env.EMBED_FOOTER_TEXT, iconURL: process.env.EMBED_LOGO })
        .setDescription('Select The Button Below To View Your Stats');

    await channel.send({
        embeds: [embed],
        components: [row]
    });

    await interaction.reply({ content: "Stats Embed Sent!", ephemeral: true });
}
