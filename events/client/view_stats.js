const { EmbedBuilder } = require("@discordjs/builders");
const { Events } = require("discord.js");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.isButton()) return;

        // Check if the custom ID starts with "view_stats_"
        if (interaction.customId.startsWith("view_stats_")) {
            // Extract the server identifier
            const server_identifier = interaction.customId.split("_")[2];
            if (!server_identifier) {
                await interaction.reply({
                    content: "Invalid Server Identifier!",
                    ephemeral: true,
                });
                return;
            }

            const existing_link = await client.functions.check_link(client, interaction.user.id);
            if (!existing_link) {
                await interaction.reply({
                    content: "Your Discord Is Not Linked To An Account!",
                    ephemeral: true,
                });
                return;
            }

            try {
                const player_info = await get_player_info(client, interaction.user.id);
                if (!player_info) {
                    await interaction.reply({
                        content: "No Player Was Found With The Provided Discord ID!",
                        ephemeral: true,
                    });
                    return;
                }

                const stats = await get_player_stats(client, player_info.display_name, server_identifier, interaction);
                const embed = await create_stats_embed(interaction, player_info, stats, server_identifier);
                return interaction.reply({ embeds: [embed], ephemeral: true });

            } catch (error) {
                client.functions.log("error", "[STATS]", error);
                await interaction.reply({
                    content: "An Error Occurred While Fetching Player Info!",
                    ephemeral: true,
                });
            }
        }
    },
};

// Fetch player information
async function get_player_info(client, discord_id) {
    const [rows] = await client.database_connection.query(
        "SELECT * FROM players WHERE discord_id = ?",
        [discord_id]
    );
    return rows.length > 0 ? rows[0] : null;
}

// Fetch player statistics
async function get_player_stats(client, display_name, server, interaction) {
    const current_server = await client.functions.get_server_discord_identifier(client, interaction.guild.id, server);
    const [kills_count_rows] = await client.database_connection.query(
        'SELECT COUNT(*) as killCount FROM kills WHERE display_name = ? AND victim != "A Scientist" AND server = ?',
        [display_name, current_server.server_id]
    );

    const [deaths_count_rows] = await client.database_connection.query(
        'SELECT COUNT(*) as deathCount FROM kills WHERE victim = ? AND display_name != "A Scientist" AND server = ?',
        [display_name, current_server.server_id]
    );

    const [kills_rows] = await client.database_connection.query(
        "SELECT * FROM kills WHERE type = 'Kill' AND display_name = ? AND server = ? ORDER BY id DESC LIMIT 1",
        [display_name, current_server.server_id]
    );

    const [death_rows] = await client.database_connection.query(
        "SELECT * FROM kills WHERE type = 'Kill' AND victim = ? AND server = ? ORDER BY id DESC LIMIT 1",
        [display_name, current_server.server_id]
    );

    const [worst_enemy_rows] = await client.database_connection.query(
        "SELECT display_name, COUNT(*) AS KillCount FROM kills WHERE type = 'Kill' AND victim = ? AND server = ? GROUP BY display_name ORDER BY KillCount DESC LIMIT 1",
        [display_name, current_server.server_id]
    );

    return {
        kills_count: kills_count_rows[0].killCount,
        deaths_count: deaths_count_rows[0].deathCount,
        last_kill: kills_rows.length > 0 ? kills_rows[0] : null,
        last_death: death_rows.length > 0 ? death_rows[0] : null,
        worst_enemy: worst_enemy_rows.length > 0 ? worst_enemy_rows[0] : null
    };
}

// Create embed for player statistics
async function create_stats_embed(interaction, player_info, stats, server) {
    const current_server = await interaction.client.functions.get_server_discord_identifier(interaction.client, interaction.guild.id, server);
    const name = player_info.display_name;
    const kd_ratio = stats.deaths_count === 0
        ? stats.kills_count
        : Math.round((stats.kills_count / stats.deaths_count) * 100) / 100;

    const last_kill = stats.last_kill ? format_player_link(stats.last_kill.victim, interaction.client) : "Not Killed Anyone";
    const last_killer = stats.last_death ? format_player_link(stats.last_death.display_name, interaction.client) : "Not Been Killed";
    const worst_enemy = stats.worst_enemy ? format_player_link(stats.worst_enemy.display_name, interaction.client) + ` (Deaths: *${stats.worst_enemy.KillCount}*)` : "Not Found";

    return new EmbedBuilder()
        .setColor(0xc74421)
        .setTitle(`Your ${current_server.identifier} Statistics`)
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setFooter({
            text: process.env.EMBED_FOOTER_TEXT,
            iconURL: process.env.EMBED_LOGO,
        })
        .addFields(
            { name: "Gamertag", value: `** ${name} **`, inline: true },
            { name: "Currency", value: `🪙 ${player_info.currency} (Use In <#${current_server.shop_channel_id}>)`, inline: true },
            { name: "Last Killed", value: `**${last_kill}**`, inline: true },
            { name: "Last Killer", value: `**${last_killer}**`, inline: true },
            { name: "Worst Enemy", value: `**${worst_enemy}**`, inline: true },
            { name: "Kills", value: `** ${stats.kills_count} **`, inline: true },
            { name: "Deaths", value: `** ${stats.deaths_count} **`, inline: true },
            { name: "K/D Ratio", value: `** ${kd_ratio.toFixed(1)} **`, inline: true }
        );
}

// Format player link function (add your implementation)
function format_player_link(display_name, client) {
    // Implement the logic to format player links based on display names
    return display_name; // Placeholder
}
