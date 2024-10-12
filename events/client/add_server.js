const {
    Events,
    ChannelType,
    PermissionsBitField,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder
} = require("discord.js");
const { RCEIntent } = require("rce.js");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId === "add_server") {
            await handle_add_modal(interaction, client);
        }
    },
};

async function handle_add_modal(interaction, client) {
    const identifier = interaction.fields.getTextInputValue('identifier');
    const server_region = interaction.fields.getTextInputValue('server_region');
    const server_id = interaction.fields.getTextInputValue('server_id');

    if (hasEmptyFields(identifier, server_region, server_id)) {
        return await reply_with_empty_error(interaction);
    }

    const existing_link = await client.functions.check_server_link(client, identifier, server_region, server_id);
    if (existing_link) {
        return await reply_with_existing_link_error(interaction);
    }

    if (!isValidRegion(server_region)) {
        return await reply_with_invalid_region(interaction, server_region);
    }

    if (!client.functions.valid_server_id(server_id)) {
        return await reply_with_invalid_server_id(interaction, server_id);
    }

    // Acknowledge the interaction
    await interaction.deferReply({ ephemeral: true });

    return await process_add(interaction, client, {
        identifier,
        server_region,
        server_id,
    });
}

function hasEmptyFields(...fields) {
    return fields.some(field => !field); // Check if any field is empty
}

function isValidRegion(region) {
    return region === "EU" || region === "US"; // Check if the region is valid
}

async function reply_with_empty_error(interaction) {
    await interaction.reply({
        content: "Please Fill Out All The Fields!",
        ephemeral: true,
    });
}

async function reply_with_existing_link_error(interaction) {
    await interaction.reply({
        content: "Your Server Already Exists!",
        ephemeral: true,
    });
}

async function reply_with_invalid_region(interaction, region) {
    await interaction.reply({
        content: `The Region \`${region}\` Is Invalid, Please Use EU Or US!`,
        ephemeral: true,
    });
}
async function reply_with_invalid_server_id(interaction, server_id) {
    await interaction.reply({
        content: `The Server ID \`${server_id}\` Is Invalid!`,
        ephemeral: true,
    });
}

async function process_add(interaction, client, server) {
    try {
        const [rows] = await client.database_connection.query(
            `SELECT * FROM servers WHERE identifier = ? AND region = ? AND server_id = ?`,
            [server.identifier, server.server_region, server.server_id]
        );

        if (rows.length > 0) {
            await reply_with_add_error(interaction, server);
        } else {
            await add_server(interaction, client, server);
        }
    } catch (error) {
        await handle_add_error(interaction, error);
    }
}

async function add_server(interaction, client, server) {
    const guild = interaction.guild;

    // Create the LINKED role if it doesn't exist
    let linked_role = guild.roles.cache.find(role => role.name === 'LINKED');
    if (!linked_role) {
        letlinked_role = await guild.roles.create({
            name: 'LINKED',
            reason: 'Created For Account Linking',
            permissions: [], // No specific permissions for the linked role
        });
    }

    // Create the category with the server identifier
    const category = await guild.channels.create({
        name: `${server.identifier}`,
        type: ChannelType.GuildCategory,
    });

    // Create channels with specific permissions
    const channels = [
        { name: 'Account Linking', allowLinkedRole: true },
        { name: 'Kill Feeds', allowLinkedRole: false },
        { name: 'Events', allowLinkedRole: false },
        { name: 'Stats', allowLinkedRole: true },
        { name: 'Chat', allowLinkedRole: false },
        { name: 'Item Spawning', allowLinkedRole: false, adminOnly: true },
        { name: 'Kits', allowLinkedRole: false, adminOnly: true },
        { name: 'Team Logs', allowLinkedRole: false, adminOnly: true },
        { name: 'Teleport Logs', allowLinkedRole: false, adminOnly: true },
        { name: 'Shop', allowLinkedRole: true },
        { name: 'Settings', adminOnly: true },
    ];

    const channelPromises = channels.map(channel_data => {
        const permissionOverwrites = [
            {
                id: guild.roles.everyone.id,
                allow: [PermissionsBitField.Flags.ViewChannel],
                deny: [PermissionsBitField.Flags.SendMessages],
            },
        ];

        if (channel_data.allowLinkedRole) {
            permissionOverwrites.push({
                id: linked_role.id,
                allow: [PermissionsBitField.Flags.ViewChannel],
            });
        }

        if (channel_data.adminOnly) {
            permissionOverwrites.push({
                id: guild.roles.cache.find(role => role.permissions.has(PermissionsBitField.Flags.Administrator)).id, // Admin role based on permissions
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
            });
        }

        return guild.channels.create({
            name: channel_data.name,
            type: ChannelType.GuildText,
            parent: category.id,
            permissionOverwrites,
        });
    });

    // Wait for all channels to be created
    const createdChannels = await Promise.all(channelPromises);
    const channel_ids = createdChannels.map(channel => channel.id);

    // Insert into the database
    await client.database_connection.query(
        `INSERT INTO servers (identifier, region, server_id, guild_id, guild_owner, category_id, linked_role_id, link_channel_id, kill_feeds_channel_id, events_channel_id, stats_channel_id, chat_logs_channel_id, item_spawning_channel_id, kits_logs_channel_id, team_logs_channel_id, teleport_logs_channel_id, shop_channel_id, settings_channel_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            server.identifier,        // identifier
            server.server_region,     // server region
            server.server_id,         // server id
            guild.id,                 // guild id
            interaction.user.id,      // user id
            category.id,              // the category id 
            linked_role.id,           // linked role
            channel_ids[0],           // link channel
            channel_ids[1],           // kill feeds
            channel_ids[2],           // events
            channel_ids[3],           // stats
            channel_ids[4],           // chat
            channel_ids[5],           // item spawning
            channel_ids[6],           // kits
            channel_ids[7],           // team logs
            channel_ids[8],           // teleport logs
            channel_ids[9],            // shop channel
            channel_ids[10]           // settings channel
        ]
    );

    // Create and send the confirmation embed
    const server_embed = new EmbedBuilder()
        .setColor(process.env.EMBED_COLOR)
        .setTitle(`Server Added: ${server.identifier}`)
        .setTimestamp()
        .setDescription(`You Have Successfully Added The Server **${server.identifier}**!`)
        .addFields(
            { name: 'Server ID', value: server.server_id.toString(), inline: true },
            { name: 'Region', value: server.server_region, inline: true },
            { name: 'Linked Role', value: `<@&${linked_role.id}>`, inline: true }
        )
        .setFooter({ text: process.env.EMBED_FOOTER_TEXT, iconURL: process.env.EMBED_LOGO });

    const channel_embed = new EmbedBuilder()
        .setColor(process.env.EMBED_COLOR)
        .setTitle('Channels Created')
        .setTimestamp()
        .setDescription(`The Following Channels Have Been Created For The Server **${server.identifier}**`)
        .setFooter({ text: process.env.EMBED_FOOTER_TEXT, iconURL: process.env.EMBED_LOGO });

    // Add each channel as a separate field
    channels.forEach((channel, index) => {
        channel_embed.addFields({
            name: channel.name,
            value: `<#${channel_ids[index]}>`, // Mention the channel using its ID
            inline: false
        });
    });

    const stats_embed = new EmbedBuilder()
        .setColor(process.env.EMBED_COLOR)
        .setTitle('Player Statistics')
        .setThumbnail(process.env.EMBED_LOGO)
        .setTimestamp()
        .setFooter({ text: process.env.EMBED_FOOTER_TEXT, iconURL: process.env.EMBED_LOGO })
        .setDescription('Select The Button Below To View Your Stats');

    const stats_channel = await guild.channels.cache.get(channel_ids[3]);
    await stats_channel.send({
        embeds: [stats_embed],
        components: [new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`view_stats_${server.identifier}`).setLabel('View Statistics').setStyle('Success')
        )]
    });

    const link_embed = new EmbedBuilder()
        .setColor(process.env.EMBED_COLOR)
        .setTitle('Account Linking')
        .setThumbnail(process.env.EMBED_LOGO)
        .setTimestamp()
        .setFooter({ text: process.env.EMBED_FOOTER_TEXT, iconURL: process.env.EMBED_LOGO })
        .setDescription('Select The Button Below To Link Your Account');

    const link_channel = await guild.channels.cache.get(channel_ids[0]);
    await link_channel.send({
        embeds: [link_embed],
        components: [new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`link_account`).setLabel('Link Account').setStyle('Success')
        )]
    });
    await client.rce.servers.add({
        identifier: server.identifier, // A Unique Name For your Server To Be Recognised By
        region: server.region, // It's Either EU or US
        serverId: Number(server.server_id), // Find This In The URL On Your Server Page
        intents: [RCEIntent.All], // Specify Which WebSocket Subscriptions To Use
        playerRefreshing: true, // Enable Playerlist Caching
        radioRefreshing: true, // Enable RF Events
        extendedEventRefreshing: true, // Enable Bradley / Heli Events
    });

    // Send the embeds in the interaction reply
    await interaction.editReply({
        embeds: [server_embed, channel_embed],
        ephemeral: true
    });
}
async function reply_with_add_error(interaction, server) {
    await interaction.reply({
        content: `The Server **${server.identifier}** Is Already Linked Or Does Not Exist!`,
        ephemeral: true,
    });
}

async function handle_add_error(interaction, error) {
    console.error("[ADD SERVER]", error);
    await interaction.reply({
        content: `An Error Occurred While Adding The Server!\n${error}`,
        ephemeral: true,
    });
}
