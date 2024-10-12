const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("link")
        .setDescription("Send The Embed For Linking")
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers | PermissionFlagsBits.BanMembers | PermissionFlagsBits.ManageGuild | PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        await check_permissions_and_send_embed(interaction);
    },
};

async function check_permissions_and_send_embed(interaction) {
    // Check if the member has the required permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers | PermissionFlagsBits.BanMembers | PermissionFlagsBits.ManageGuild | PermissionFlagsBits.ManageMessages)) {
        return await interaction.reply({ content: "You Do Not Have Permission To Use This Command!", ephemeral: true });
    }
    const server = interaction.client.functions.get_server_discord(interaction.client, interaction.guild.id);
    const channel = await interaction.client.channels.cache.get(server.link_channel_id);

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('link_account').setLabel('Link Account').setStyle('Success')
    );

    const embed = new EmbedBuilder()
        .setColor(process.env.EMBED_COLOR)
        .setTitle('Account Linking')
        .setThumbnail(process.env.EMBED_LOGO)
        .setTimestamp()
        .setFooter({ text: process.env.EMBED_FOOTER_TEXT, iconURL: process.env.EMBED_LOGO })
        .setDescription('Select The Button Below To Link Your Account');

    await channel.send({
        embeds: [embed],
        components: [row]
    });

    await interaction.reply({ content: "Link Embed Sent!", ephemeral: true });
}
