const {
    Events,
    ModalBuilder,
    TextInputBuilder,
    ActionRowBuilder,
} = require("discord.js");
module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.isModalSubmit()) return;
        if (interaction.customId === "link_modal") {
            const result = await interaction.fields.getTextInputValue(
                "gamertag"
            );
            if (!result) {
                await interaction.reply({
                    content: "Please Enter Your Gamertag!",
                    ephemeral: true,
                });
            } else {
                if (!client.functions.is_empty(result)) {
                    const existingLink = await client.functions.check_link(client,
                        interaction.user.id
                    );
                    if (existingLink) {
                        await interaction.reply({
                            content: "Your Discord Is Already Linked To A Account!",
                            ephemeral: true,
                        });
                    } else {
                        try {
                            const [rows] = await client.database_connection.query(
                                `SELECT * FROM players WHERE display_name = ? AND discord_id IS NULL OR discord_id = ''`,
                                [result]
                            );

                            if (rows.length > 0) {
                                await client.database_connection.query(
                                    "UPDATE players SET discord_id = ? WHERE display_name = ?",
                                    [interaction.user.id, result]
                                );

                                const member = interaction.guild.members.cache.get(
                                    interaction.user.id
                                );
                                try {
                                    await member.setNickname(result);
                                    await member.roles.add(process.env.LINKED_ROLE);
                                } catch { }
                                await interaction.reply({
                                    content: `Linked Your Discord To **${result}**!`,
                                    ephemeral: true,
                                });
                            } else {
                                await interaction.reply({
                                    content: `Either The Gamertag **${result}** Is Already Linked Or Does Not Exist, Please Kill Somebody Or Relog!`,
                                    ephemeral: true,
                                });
                            }
                        } catch (error) {
                            client.log("error", "[DISCORD LINK]", error);
                            await interaction.reply({
                                content: `An Error Occurred While Linking The Account!\n${error}`,
                                ephemeral: true,
                            });
                        }
                    }
                } else {
                    await interaction.reply({
                        content: "Please Enter Your Gamertag!",
                        ephemeral: true,
                    });
                }
            }
        }
    },
};
