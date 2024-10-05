const { EmbedBuilder } = require("@discordjs/builders");
const {
    Events,
    ModalBuilder,
    TextInputBuilder,
    ActionRowBuilder,
} = require("discord.js");
module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.isButton()) return;
        if (interaction.customId === "view_stats") {
            const existingLink = await client.functions.check_link(client,
                interaction.user.id
            );
            if (!existingLink) {
                await interaction.reply({
                    content: "Your Discord Is Not Linked To An Account!",
                    ephemeral: true,
                });
            } else {
                try {
                    const [rows, fields] = await client.database_connection.query(
                        "SELECT * FROM players WHERE discord_id = ?",
                        [interaction.user.id]
                    );
                    if (rows.length > 0) {
                        const playerInfo = rows[0];
                        const name = playerInfo.display_name;
                        const [killsCountRows, killsCountFields] =
                            await client.database_connection.query(
                                'SELECT COUNT(*) as killCount FROM kills WHERE display_name = ? AND victim != "A Scientist"',
                                [playerInfo.display_name]
                            );
                        const [deathsCountRows, deathsCountFields] =
                            await client.database_connection.query(
                                'SELECT COUNT(*) as deathCount FROM kills WHERE victim = ?  AND display_name != "A Scientist"',
                                [playerInfo.display_name]
                            );
                        const [killsRows, killsFields] =
                            await client.database_connection.query(
                                "SELECT * FROM kills WHERE type = 'Kill' AND display_name = ? ORDER BY id DESC LIMIT 1",
                                [playerInfo.display_name]
                            );
                        const [deathRows, deathFields] =
                            await client.database_connection.query(
                                "SELECT * FROM kills WHERE type = 'Kill' AND victim = ? ORDER BY id DESC LIMIT 1",
                                [playerInfo.display_name]
                            );
                        const [worstEnemyRows, worstEnemyFields] =
                            await client.database_connection.query(
                                "SELECT display_name, COUNT(*) AS KillCount FROM kills WHERE type = 'Kill' AND victim = ? GROUP BY display_name ORDER BY KillCount DESC LIMIT 1",
                                [playerInfo.display_name]
                            );
                        let kd_ratio =
                            deathsCountRows[0].deathCount === 0
                                ? killsCountRows[0].killCount
                                : Math.round(
                                    (killsCountRows[0].killCount /
                                        deathsCountRows[0].deathCount) *
                                    100
                                ) / 100;
                        var last_kill = "";
                        var last_killer = "";
                        var worst_enemy = "";
                        if (killsRows.length > 0) {
                            const lastKil = killsRows[0];
                            const [discordIdRows, discordIdFields] =
                                await client.database_connection.query(
                                    "SELECT discord_id FROM players WHERE display_name = ?",
                                    [lastKil.Victim]
                                );
                            if (
                                discordIdRows.length > 0 &&
                                discordIdRows[0].discord_id != null
                            ) {
                                last_kill = `<@${discordIdRows[0].discord_id}>`;
                            } else {
                                last_kill = lastKil.Victim;
                            }
                        } else {
                            last_kill = "Not Killed Anyone";
                        }
                        if (deathRows.length > 0) {
                            const lastdeath = deathRows[0];
                            last_killer = lastdeath.display_name;
                            const [discordIdRows, discordIdFields] =
                                await client.database_connection.query(
                                    "SELECT discord_id FROM players WHERE display_name = ?",
                                    [lastdeath.display_name]
                                );
                            if (
                                discordIdRows.length > 0 &&
                                discordIdRows[0].discord_id != null
                            ) {
                                last_killer = `<@${discordIdRows[0].discord_id}>`;
                            } else {
                                last_killer = lastdeath.display_name;
                            }
                        } else {
                            last_killer = "Not Been Killed";
                        }
                        if (worstEnemyRows.length > 0) {
                            const worstEnemyKillCount = worstEnemyRows[0].KillCount;
                            const [discordIdRows, discordIdFields] =
                                await client.database_connection.query(
                                    "SELECT discord_id FROM players WHERE display_name = ?",
                                    [worstEnemyRows[0].display_name]
                                );
                            if (
                                discordIdRows.length > 0 &&
                                discordIdRows[0].discord_id != null
                            ) {
                                worst_enemy = `<@${discordIdRows[0].discord_id}> (Deaths : *${worstEnemyKillCount}*)`;
                            } else {
                                worst_enemy = `${worstEnemyRows[0].display_name} (Deaths : *${worstEnemyKillCount}*)`;
                            }
                        } else {
                            worst_enemy = "Not Found";
                        }
                        const embed = new EmbedBuilder()
                            .setColor(0xc74421)
                            .setTitle("Statistics")
                            .setThumbnail(
                                interaction.user.displayAvatarURL({ dynamic: true })
                            )
                            .setFooter({
                                text: process.env.EMBED_FOOTER_TEXT,
                                iconURL: process.env.EMBED_LOGO,
                            })
                            .addFields(
                                { name: "Gamertag", value: `** ${name} **`, inline: true },
                                { name: "\u200B\u200B", value: "\u200B\u200B", inline: true },
                                { name: "\u200B\u200B", value: "\u200B\u200B", inline: true },

                                {
                                    name: "Last Killed",
                                    value: `**${last_kill}**`,
                                    inline: true,
                                },
                                {
                                    name: "Last Killer",
                                    value: `**${last_killer}**`,
                                    inline: true,
                                },
                                {
                                    name: "Worst Enemy",
                                    value: `**${worst_enemy}**`,
                                    inline: true,
                                },

                                {
                                    name: "Kills",
                                    value: `** ${killsCountRows[0].killCount} **`,
                                    inline: true,
                                },
                                {
                                    name: "Deaths",
                                    value: `** ${deathsCountRows[0].deathCount} **`,
                                    inline: true,
                                },
                                {
                                    name: "K/D Ratio",
                                    value: `** ${kd_ratio.toFixed(1)} **`,
                                    inline: true,
                                },

                                {
                                    name: "Currency",
                                    value: `🪙 ${playerInfo.currency} (Use Points In <#${process.env.USE_CURRENCY}>)`,
                                    inline: false,
                                }
                            );

                        return interaction.reply({ embeds: [embed], ephemeral: true });
                    } else {
                        await interaction.reply({
                            content: "No Player Was Found With The Provided Discord ID!",
                            ephemeral: true,
                        });
                    }
                } catch (error) {
                    client.log("error", "[STATS]", error);
                    await interaction.reply({
                        content: "An Error Occurred While Fetching Player Info!",
                        ephemeral: true,
                    });
                }
            }
        }
    },
};
