// Import the required modules and components
const client = require("./core"); // Import the bot instance
const { MessageEmbed } = require("discord.js");

// Function to log messages with various types and formatting
// Define log levels without success
const logLevels = ["error", "warn", "info", "debug"]; // Ordered from most severe to least severe

// Set the minimum log level from an environment variable (or default to "info")
const minLogLevel = process.env.LOG_LEVEL || "info"; // e.g., "warn" to log only warnings and above

function log(type = "info", ...args) {
    const date = new Date();
    const timestamp = date.toLocaleTimeString([], { hour12: false }); // Get the current time in 24-hour format

    let prefix = ""; // Initialize prefix for log type
    let emoji = "";  // Initialize emoji for log type
    let color = "\x1b[0m"; // Default color reset

    // Define mappings for log types
    const log_type = {
        "success": { prefix: "[SUCCESS]", emoji: "✅", color: "\x1b[32m" },   // Green color for success
        "error": { prefix: "[ERROR]", emoji: "❌", color: "\x1b[31m" },     // Red color for errors
        "warn": { prefix: "[WARNING]", emoji: "⚠️", color: "\x1b[33m" },    // Yellow color for warnings
        "info": { prefix: "[INFO]", emoji: "💬", color: "\x1b[36m" },        // Cyan color for info
        "debug": { prefix: "[DEBUG]", emoji: "🔧", color: "\x1b[35m" }     // Purple color for custom logs
    };

    // Check if the provided log type exists in mappings, otherwise use custom type
    if (log_type[type]) {
        prefix = log_type[type].prefix; // Get prefix for the log type
        emoji = log_type[type].emoji;    // Get emoji for the log type
        color = log_type[type].color;     // Update color if specified
    } else {
        prefix = `[${type.toUpperCase()}]`; // Default prefix for unknown types
        emoji = "🔧"; // Default emoji for unknown types
    }

    // Always log success messages, and check if the current log type is above the minimum log level
    if (type === "success" || logLevels.indexOf(type) <= logLevels.indexOf(minLogLevel)) {
        // Calculate padding based on the length of the prefix
        const padding = ' '.repeat(Math.max(0, 15 - prefix.length)); // Adjust 15 as needed for your layout

        // Create the formatted log message with the timestamp, prefix, emoji, and color
        const formattedMessage = `\x1b[90m[${timestamp}]\x1b[0m ${color}${prefix}${padding}${emoji}\x1b[0m`;

        // Output the formatted log message followed by the additional arguments
        console.log(formattedMessage, ...args);
    }
}

// Function to check if a string is empty or contains only whitespace
function is_empty(s) {
    return (!s || /^\s*$/.test(s)); // Returns true if the string is empty or only whitespace
}

// Function to format a date according to the specified locale
function format_date(date, locale = "en-GB") {
    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
    };
    return new Intl.DateTimeFormat(locale, options).format(date); // Format date using Intl API
}

// Asynchronous function to send a message to a Discord channel
async function discord_log(message, channel) {
    await client.channels.cache.get(channel).send({ content: message }); // Send message to the specified channel
}

// Asynchronous function to send an embedded message to a Discord channel
async function send_embed(channel, title, description, fields = [], thumbnailUrl = null, imageUrl = null) {
    const embed = new MessageEmbed()
        .setTitle(title) // Set the title of the embed
        .setColor("#e6361d"); // Set the color of the embed

    if (description.length > 0) {
        embed.setDescription(description); // Set the description if provided
    }

    // Add fields if provided
    if (fields.length > 0) {
        fields.forEach(field => {
            // Check if field value is a non-empty string
            if (typeof field.value === 'string' && field.value.trim() !== '') {
                embed.addFields(field); // Add each field to the embed
            }
        });
    }

    // Add thumbnail if thumbnailUrl is not null
    if (thumbnailUrl !== null) {
        embed.setThumbnail(thumbnailUrl); // Set the thumbnail URL
    }

    // Add image if imageUrl is not null
    if (imageUrl !== null) {
        embed.setImage(imageUrl); // Set the image URL
    }

    try {
        await client.channels.cache.get(channel).send({ embeds: [embed] }); // Send the embed to the specified channel
    } catch (error) {
        client.functions.log("error", "Error Sending Embed:", error); // Log error if sending fails
    }
}

// Function to format a hostname with color codes based on the provided color
function format_hostname(hostname) {
    const colorCodes = {
        // Basic colors
        '#000000': '\x1b[30m', // Black
        '#ff0000': '\x1b[31m', // Red
        '#00ff00': '\x1b[32m', // Green
        '#0000ff': '\x1b[34m', // Blue
        '#fcba03': '\x1b[33m', // Yellow
        '#ffff00': '\x1b[33m', // Yellow
        '#ff00ff': '\x1b[35m', // Magenta
        '#00ffff': '\x1b[36m', // Cyan
        '#ffffff': '\x1b[37m', // White
        '#808080': '\x1b[90m', // Gray

        // Extended colors
        '#a52a2a': '\x1b[31m', // Brown
        '#ff4500': '\x1b[31m', // OrangeRed
        '#ff8c00': '\x1b[33m', // DarkOrange
        '#ffd700': '\x1b[33m', // Gold
        '#f0e68c': '\x1b[33m', // Khaki
        '#b22222': '\x1b[31m', // FireBrick
        '#7fff00': '\x1b[32m', // Chartreuse
        '#d2691e': '\x1b[33m', // Chocolate
        '#ff6347': '\x1b[31m', // Tomato
        '#4682b4': '\x1b[34m', // SteelBlue
        '#20b2aa': '\x1b[36m', // LightSeaGreen
        '#add8e6': '\x1b[34m', // LightBlue
        '#87ceeb': '\x1b[36m', // SkyBlue
        '#6495ed': '\x1b[34m', // CornflowerBlue
        '#b0e0e6': '\x1b[36m', // PowderBlue
        '#ff69b4': '\x1b[35m', // HotPink
        '#ff1493': '\x1b[35m', // DeepPink
        '#e6e6fa': '\x1b[37m', // Lavender
        '#fff0f5': '\x1b[37m', // LavenderBlush
        '#ffe4e1': '\x1b[37m', // MistyRose
        '#ffc0cb': '\x1b[35m', // Pink
        '#ffb6c1': '\x1b[35m', // LightPink
        '#dc143c': '\x1b[31m', // Crimson
        '#ffdead': '\x1b[33m', // NavajoWhite
        '#f5deb3': '\x1b[33m', // Wheat
        '#d2b48c': '\x1b[33m', // Tan
        '#8b4513': '\x1b[33m', // SaddleBrown
        '#f4a460': '\x1b[33m', // SandyBrown
        '#cd853f': '\x1b[33m', // Peru
        '#4b0082': '\x1b[35m', // Indigo
        '#483d8b': '\x1b[34m', // DarkSlateBlue
        '#2f4f4f': '\x1b[30m', // DarkSlateGray
        '#708090': '\x1b[90m', // SlateGray
        '#6a5acd': '\x1b[34m', // SlateBlue
        '#5f9ea0': '\x1b[36m', // CadetBlue
        '#3cb371': '\x1b[32m', // MediumSeaGreen
        '#66cdaa': '\x1b[36m', // MediumAquamarine
        '#8fbc8f': '\x1b[32m', // DarkSeaGreen
        '#afeeee': '\x1b[36m', // PaleTurquoise
        '#b0c4de': '\x1b[34m', // LightSteelBlue
        '#e0ffff': '\x1b[36m', // LightCyan
        '#f0fff0': '\x1b[37m', // HoneyDew
        '#f5fffa': '\x1b[37m', // MintCream
        '#faebd7': '\x1b[37m', // AntiqueWhite
        '#d3d3d3': '\x1b[90m', // LightGray
        '#c0c0c0': '\x1b[37m', // Silver
        '#a9a9a9': '\x1b[90m', // DarkGray
        '#000080': '\x1b[34m', // Navy
        '#2e8b57': '\x1b[32m', // SeaGreen
        '#8a2be2': '\x1b[35m', // BlueViolet
        '#9400d3': '\x1b[35m', // DarkViolet
        '#9932cc': '\x1b[35m', // DarkOrchid
        '#8b0000': '\x1b[31m', // DarkRed
        '#ffdab9': '\x1b[37m', // PeachPuff
        '#fffaf0': '\x1b[37m', // FloralWhite
        '#f5f5dc': '\x1b[37m', // Beige
        '#f0f8ff': '\x1b[37m', // AliceBlue
        '#dcdcdc': '\x1b[90m', // Gainsboro
        '#f8f8ff': '\x1b[37m', // GhostWhite
        '#faf0e6': '\x1b[37m', // Linen
        '#1e90ff': '\x1b[34m', // DodgerBlue
        '#03bcff': '\x1b[34m', // DodgerBlue
        '#00bfff': '\x1b[36m', // DeepSkyBlue
        '#3357ff': '\x1b[36m', // DeepSkyBlue
        '#ff7f50': '\x1b[31m', // Coral
        '#da70d6': '\x1b[35m', // Orchid
        '#f08080': '\x1b[31m', // LightCoral
        '#cd5c5c': '\x1b[31m', // IndianRed
        '#c71585': '\x1b[35m', // MediumVioletRed
        '#db7093': '\x1b[35m', // PaleVioletRed
        '#4169e1': '\x1b[34m', // RoyalBlue
        '#a0522d': '\x1b[33m', // Sienna
        '#7b68ee': '\x1b[34m', // MediumSlateBlue
    };
    // Use a regular expression to find the color tags and their contents
    return hostname.replace(/<color=([^>]+)>(.*?)<\/color>/g, (match, hexColor, text) => {
        // Use the corresponding ANSI code or default to reset if the color is not defined
        const ansiColor = colorCodes[hexColor] || '\x1b[0m'; // Reset to default if color not found
        return `${ansiColor}${text}\x1b[0m`; // Append reset code after the text
    });
}
function edit_config(action, key, value) {
    if (!client.config.hasOwnProperty(key)) {
        return client.functions.log("error", `Key '${key}' Not Found!`);
    }

    const is_auto_messages = key === "auto_messages" && Array.isArray(client.config[key]);

    switch (action) {
        case "add_message":
            if (is_auto_messages) {
                client.config[key].push(value);
                client.functions.log("info", `Auto Message Added: ${value}`);
            } else {
                client.functions.log("error", `'auto_messages' Must Be An Array!`);
            }
            break;

        case "remove_message":
            if (is_auto_messages) {
                const index = client.config[key].indexOf(value);
                if (index > -1) {
                    client.config[key].splice(index, 1);
                    client.functions.log("info", `Auto Message Removed: ${value}`);
                } else {
                    client.functions.log("error", `Message Not Found!`);
                }
            } else {
                client.functions.log("error", `'auto_messages' Must Be An Array!`);
            }
            break;

        case "update":
            client.config[key] = value;
            client.functions.log("info", `Config Updated: ${key} = ${value}`);
            break;

        default:
            client.functions.log("error", `Invalid Action: '${action}'.`);
    }
}
function edit_servers(action, identifier, data) {
    const index = client.servers.findIndex(server => server.identifier === identifier);

    switch (action) {
        case "add_server":
            if (index === -1) {
                client.servers.push(data);
                client.functions.log("info", `Server Added: ${JSON.stringify(data)}`);
            } else {
                client.functions.log("error", `Server With Identifier '${identifier}' Already Exists!`);
            }
            break;

        case "remove_server":
            if (index > -1) {
                const removed = client.servers.splice(index, 1);
                client.functions.log("info", `Server Removed: ${JSON.stringify(removed[0])}`);
            } else {
                client.functions.log("error", `Server With Identifier '${identifier}' Not Found!`);
            }
            break;

        case "update":
            if (index > -1) {
                client.servers[index] = { ...client.servers[index], ...data };
                client.functions.log("info", `Server Updated: ${JSON.stringify(client.servers[index])}`);
            } else {
                client.functions.log("error", `Server With Identifier '${identifier}' Not Found!`);
            }
            break;

        default:
            client.functions.log("error", `Invalid Action: '${action}'`);
    }
}
async function get_player_currency(discord_id, server) {
    console.log(discord_id);
    console.log(server.serverId);
    console.log(server.region);
    try {
        const [discordIdRows] = await client.database_connection.execute(
            'SELECT currency FROM players WHERE discord_id = ? AND server = ? AND region = ?',
            [discord_id, server.serverId, server.region]
        );

        if (discordIdRows.length > 0 && discordIdRows[0].currency != null) {
            return discordIdRows[0].currency;
        } else {
            return 0;
        }
    } catch (err) {
        console.error("Error during query execution:", err.message);
        throw err;
    }
}

async function get_player_by_discord(discord_id, server) {
    try {
        const [discordIdRows] = await client.database_connection.execute(
            'SELECT display_name FROM players WHERE discord_id = ? AND server = ? AND region = ?',
            [discord_id, server.serverId, server.region]
        );

        if (discordIdRows.length > 0 && discordIdRows[0].display_name != null) {
            return discordIdRows[0].display_name;
        } else {
            return discord_id;
        }
    } catch (err) {
        console.error("Error during query execution:", err.message);
        throw err;
    }
}
const get_count = async (condition, params) => (await client.database_connection.query(condition, params))[0][0].count;
const events = Object.freeze({

    //rce
    Message: "message",                        // Event triggered when a message is sent
    PlayerKill: "player_kill",                // Event triggered when a player is killed
    PlayerJoined: "player_joined",            // Event triggered when a player joins the server
    PlayerLeft: "player_left",                 // Event triggered when a player leaves the server
    PlayerRespawned: "player_respawned",      // Event triggered when a player respawns
    PlayerSuicide: "player_suicide",          // Event triggered when a player commits suicide
    PlayerRoleAdd: "player_role_add",         // Event triggered when a role is added to a player
    QuickChat: "quick_chat",                  // Event triggered for quick chat messages
    NoteEdit: "note_edit",                    // Event triggered when a note is edited
    EventStart: "event_start",                // Event triggered when a general event starts
    PlayerListUpdate: "playerlist_update",    // Event triggered when the player list is updated
    ItemSpawn: "item_spawn",                  // Event triggered when an item spawns
    VendingMachineName: "vending_machine_name", // Event triggered when a vending machine is renamed
    KitSpawn: "kit_spawn",                    // Event triggered when a kit spawns
    KitGive: "kit_give",                      // Event triggered when a kit is given to a player
    TeamCreate: "team_create",                // Event triggered when a team is created
    TeamJoin: "team_join",                    // Event triggered when a player joins a team
    TeamLeave: "team_leave",                  // Event triggered when a player leaves a team
    SpecialEventStart: "special_event_start", // Event triggered when a special event starts
    SpecialEventEnd: "special_event_end",     // Event triggered when a special event ends
    ExecutingCommand: "executing_command",    // Event triggered when a command is being executed
    Error: "error",                           // Event triggered when an error occurs
    Log: "log",                               // Event triggered for logging purposes
    ServiceState: "service_state",            // Event triggered to report the service state
    CustomZoneAdded: "custom_zone_added",     // Event triggered when a custom zone is added
    CustomZoneRemoved: "custom_zone_removed", // Event triggered when a custom zone is removed

    //discord
    AutoModerationRuleCreate: "autoModerationRuleCreate", // Triggered when an auto moderation rule is created
    AutoModerationRuleDelete: "autoModerationRuleDelete", // Triggered when an auto moderation rule is deleted
    AutoModerationRuleUpdate: "autoModerationRuleUpdate", // Triggered when an auto moderation rule is updated
    ChannelCreate: "channelCreate",                       // Triggered when a channel is created
    ChannelDelete: "channelDelete",                       // Triggered when a channel is deleted
    ChannelUpdate: "channelUpdate",                       // Triggered when a channel is updated
    GuildBanAdd: "guildBanAdd",                           // Triggered when a user is banned from a guild
    GuildBanRemove: "guildBanRemove",                     // Triggered when a user is unbanned from a guild
    GuildCreate: "guildCreate",                           // Triggered when the bot joins a new guild
    GuildDelete: "guildDelete",                           // Triggered when the bot is removed from a guild
    GuildIntegrationsUpdate: "guildIntegrationsUpdate",   // Triggered when a guild's integrations are updated
    GuildMemberAdd: "guildMemberAdd",                     // Triggered when a member joins a guild
    GuildMemberRemove: "guildMemberRemove",               // Triggered when a member leaves a guild
    GuildMemberUpdate: "guildMemberUpdate",               // Triggered when a member's information is updated
    GuildUpdate: "guildUpdate",                           // Triggered when a guild's information is updated
    InteractionCreate: "interactionCreate",               // Triggered when an interaction occurs (e.g., slash commands)
    InviteCreate: "inviteCreate",                         // Triggered when an invite is created
    InviteDelete: "inviteDelete",                         // Triggered when an invite is deleted
    MessageCreate: "messageCreate",                       // Triggered when a message is created
    MessageDelete: "messageDelete",                       // Triggered when a message is deleted
    MessageDeleteBulk: "messageDeleteBulk",               // Triggered when multiple messages are deleted at once
    MessageReactionAdd: "messageReactionAdd",             // Triggered when a reaction is added to a message
    MessageReactionRemove: "messageReactionRemove",       // Triggered when a reaction is removed from a message
    MessageReactionRemoveAll: "messageReactionRemoveAll", // Triggered when all reactions are removed from a message
    MessageUpdate: "messageUpdate",                       // Triggered when a message is updated
    PresenceUpdate: "presenceUpdate",                     // Triggered when a user's presence (status) is updated
    Ready: "ready",                                       // Triggered when the bot is ready
    RoleCreate: "roleCreate",                             // Triggered when a role is created
    RoleDelete: "roleDelete",                             // Triggered when a role is deleted
    RoleUpdate: "roleUpdate",                             // Triggered when a role is updated
    ShardDisconnect: "shardDisconnect",                   // Triggered when a shard disconnects from Discord
    ShardReconnect: "shardReconnect",                     // Triggered when a shard reconnects to Discord
    ShardReady: "shardReady",                             // Triggered when a shard is ready and connected to Discord
    ShardResume: "shardResume",                           // Triggered when a shard resumes its connection to Discord after being disconnected
    StageInstanceCreate: "stageInstanceCreate",           // Triggered when a Stage instance is created
    StageInstanceDelete: "stageInstanceDelete",           // Triggered when a Stage instance is deleted
    StageInstanceUpdate: "stageInstanceUpdate",           // Triggered when a Stage instance is updated
    TypingStart: "typingStart",                           // Triggered when someone starts typing in a channel
    UserUpdate: "userUpdate",                             // Triggered when a user's information is updated
    VoiceStateUpdate: "voiceStateUpdate",                 // Triggered when a user's voice state changes
    WebhookUpdate: "webhookUpdate",                       // Triggered when a webhook is updated
});
function get_event_name(event){
    for (const [key, value] of Object.entries(events)) {
        if (value === event) {
            return key; // Return the event name (e.g., "ExecutingCommand")
        }
    }
    return event; // Return event if the event string is not found
}
module.exports = {
    log,
    format_date,
    discord_log,
    send_embed,
    is_empty,
    format_hostname,
    edit_config,
    edit_servers,
    get_player_currency,
    get_player_by_discord,
    get_count,
    get_event_name
};