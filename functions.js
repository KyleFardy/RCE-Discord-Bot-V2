// Import the required modules and components
const client = require("./core"); // Import the bot instance
const { EmbedBuilder } = require("discord.js"); 
const fs = require('fs');
const fsp = require('fs/promises'); // Import fs/promises for promise-based fs methods
const path = require('path');
require('dotenv').config();

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
const is_json = str => { try { return !!JSON.parse(str); } catch { return false; } };

// Asynchronous function to send a message to a Discord channel
async function discord_log(client, message, channelId) {
    try {
        // Get the channel using the provided channelId
        const channel = await client.channels.fetch(channelId);
        if (!channel) {
            throw new Error("Channel Not Found");
        }

        // Send the message to the specified channel
        await channel.send({ content: message });
    } catch (error) {
        await client.functions.log("error", "Failed To Send Message To Channel:", error);
    }
}


async function get_item_image(display_name) {
    const itemsPath = path.join(__dirname, 'items.json');
    const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
    const item = items.find(item => item.displayName.toLowerCase() === display_name.toLowerCase());
    if (item) {
        return `https://void-dev.co/proxy?image=${item.shortName}`;
    } else {
        return "https://cdn.void-dev.co/rce.png"; // Return an error message if not found
    }
}
const ignored_attacker = [
    "scientist",
    "thirst",
    "hunger",
    "heat",
    "guntrap.deployed",
    "pee pee 9000",
    "barricade.wood",
    "wall.external.high.stone",
    "wall.external.high",
    "gates.external.high.wood",
    "gates.external.high.wood (entity)",
    "gates.external.high.stone",
    "gates.external.high.stone (entity)",
    "bear",
    "autoturret_deployed",
    "cold",
    "bleeding",
    "boar",
    "wolf",
    "fall",
    "drowned",
    "radiation",
    "autoturret_deployed (entity)",
    "bear (bear)",
    "boar (boar)",
    "wolf (wolf)",
    "guntrap.deployed (entity)",
    "fall!",
    "lock.code (entity)",
    "bradleyapc (entity)",
    "wall.external.high.stone (entity)",
    "barricade.metal (entity)",
    "spikes.floor (entity)",
    "sentry.bandit.static (entity)",
    "cactus-7 (entity)",
    "cactus-6 (entity)",
    "cactus-5 (entity)",
    "cactus-4 (entity)",
    "cactus-3 (entity)",
    "cactus-2 (entity)",
    "cactus-1 (entity)",
    "landmine (entity)",
    "wall.external.high.wood (entity)",
    "sentry.scientist.static (entity)",
    "patrolhelicopter (entity)",
    "flameturret.deployed (entity)",
    "oilfireballsmall (entity)",
    "napalm (entity)",
    "cargoshipdynamic2 (entity)",
    "barricade.wood (entity)",
    "beartrap (entity)",
    "landmine (entity)",
    "cargoshipdynamic1 (entity)",
    "campfire (entity)",
    "barricade.woodwire (entity)",
    "rocket_crane_lift_trigger (entity)",
    "lock.code (entity)",
    "rowboat (entity)",
    "fireball (entity)",
    "teslacoil.deployed (entity)"
];
// Asynchronous function to send an embedded message to a Discord channel
async function send_embed(client, channel, title, description, fields = [], thumbnailUrl = null, imageUrl = null) {
    // Create a new embed
    const embed = new EmbedBuilder()
        .setTitle(title) // Set the title of the embed
        .setColor("#e6361d"); // Set the color of the embed

    // Set the description if provided
    if (description.length > 0) {
        embed.setDescription(description);
    }

    // Add fields if provided
    if (fields.length > 0) {
        fields.forEach(field => {
            if (typeof field.value === 'string' && field.value.trim() !== '') {
                embed.addFields(field); // Add each field to the embed
            }
        });
    }

    // Add thumbnail if provided
    if (thumbnailUrl !== null) {
        embed.setThumbnail(thumbnailUrl);
    }

    // Add image if provided
    if (imageUrl !== null) {
        embed.setImage(imageUrl);
    }

    // Attempt to send the embed
    try {
        const channelToSend = await client.channels.fetch(channel); // Fetch the channel
        await channelToSend.send({ embeds: [embed] }); // Send the embed
    } catch (error) {
        // Log detailed error information for debugging
        await client.functions.log("error", `Error Sending Embed to Channel ${channel}:`, error);
    }
}

// Function to format a hostname with color codes based on the provided color
function format_hostname(hostname) {
    const colorCodes = {
        //custom
        'purple': '\x1b[35m', // Add purple as magenta

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
    return hostname.replace(/<color=([^>]+)>(.*?)<\/color>/g, (match, color, text) => {
        // Use the corresponding ANSI code or default to reset if the color is not defined
        const ansiColor = colorCodes[color] || '\x1b[0m'; // Reset to default if color not found
        return `${ansiColor}${text}\x1b[0m`; // Append reset code after the text
    });
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
const get_count = async (client, condition, params) => {
    if (!client.database_connection) {
        throw new Error('Database connection is not initialized');
    }

    const [results] = await client.database_connection.execute(condition, params);
    return results[0]?.count || 0; // Use optional chaining to avoid errors
};

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
async function get_random_item(client) {
    // Check if items array is empty
    if (!client.items || client.items.length === 0) {
        throw new Error("The items array is empty or not loaded");
    }
    const randomIndex = Math.floor(Math.random() * client.items.length);
    return client.items[randomIndex];
}

function random_int(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
async function load_items() {
    const filePath = path.join(__dirname, 'items.json');
    try {
        const data = await fsp.readFile(filePath, 'utf-8'); // Specify encoding for text files
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading items:', error);
        return [];
    }
}
async function trigger_random_item(client, server, players) {
    // Exit early if RANDOM_ITEMS is disabled
    if (process.env.RANDOM_ITEMS === "false") return;

    // Retrieve the multiplier from the environment variable, defaulting to 1
    const multiplier = parseInt(process.env.LOOT_SCALE) || 1;

    // Create a helper function to determine the quantity based on item category or shortName
    const get_item_quantity = (item) => {
        let base_quantity;
        switch (item.category) {
            case 'Resources':
                base_quantity = 1000 * multiplier;
                break;
            case 'Component':
            case 'Food':
                base_quantity = random_int(10, 40) * multiplier;
                break;
            case 'ammo.rifle':
            case 'ammo.rifle.incendiary':
            case 'ammo.rifle.explosive':
            case 'ammo.rifle.hv':
            case 'ammo.pistol':
            case 'ammo.pistol.fire':
            case 'ammo.pistol.hv':
            case 'ammo.shotgun':
            case 'ammo.shotgun.fire':
            case 'ammo.shotgun.slug':
                base_quantity = 128 * multiplier;
                break;
            case 'ammo.rocket.basic':
            case 'ammo.rocket.fire':
            case 'ammo.rocket.hv':
                base_quantity = 3 * multiplier;
                break;
            case 'lowgradefuel':
                base_quantity = 500 * multiplier;
                break;
            default:
                base_quantity = 1; // Default quantity
        }
        return Math.floor(base_quantity); // Apply multiplier and round down
    };

    // Iterate over players and give random items
    await Promise.all(players.map(async (player) => {
        const item = await get_random_item(client);
        const quantity = get_item_quantity(item);

        // Send command to give item to user
        await client.rce.sendCommand(server, `giveto "${player}" "${item.shortName}" "${quantity}"`);
        await client.functions.log("info", `\x1b[38;5;208m[${server}]\x1b[0m \x1b[32;1m[RANDOM ITEMS] Giving ${player} ${quantity}x ${item.displayName}`);
    }));
}
async function get_server(identifier) {
    // Read the servers.json file
    const data = fs.readFileSync('servers.json', 'utf8');

    // Parse the JSON data
    const servers = JSON.parse(data);

    // Search for the server with the specified identifier
    const server = servers.find(server => server.identifier === identifier);

    // Return the server or a message if not found
    return server || `Server with identifier "${identifier}" not found.`;
}
const handle_teleport = async (client, player_name, coords, location, server) => {
    await client.functions.log("info", `\x1b[32;1m[TELEPORT]\x1b[0m \x1b[38;5;208m${player_name}\x1b[0m Teleporting To \x1b[38;5;208m${location}\x1b[0m`);
    await client.rce.sendCommand(server.identifier, await client.functions.format_teleport_pos(player_name, coords));
    await client.functions.send_embed(process.env.TELEPORT_LOGS_CHANNEL, "New Teleport", "", [
        { name: 'Player', value: `👤 ${player_name}`, inline: true },
        { name: 'Time', value: `🕜 <t:${Math.floor(new Date().getTime() / 1000)}:R>`, inline: true },
        { name: 'Teleported To', value: location, inline: true },
        { name: 'Coords', value: ` \`\`\`${coords}\`\`\``, inline: true },
    ], "");
};
const format_teleport_pos = (player_name, coordinates) => {
    return `teleportpos "${coordinates}" "${player_name}"`;
};
const get_player_info = async (client, player_name, server) => {
    try {
        // Fetch player info
        const [rows] = await client.database_connection.query(
            'SELECT * FROM players WHERE server = ? AND region = ? AND display_name = ?',
            [server.serverId, server.region, player_name]
        );

        if (rows.length === 0) return;  // Exit if no player found

        const playerInfo = rows[0];
        const { display_name: name, currency } = playerInfo;

        // Helper function to get the last record
        const get_last_record = async (query, params) => {
            const [rows] = await client.database_connection.query(query, params);
            return rows.length > 0 ? rows[0] : null;
        };

        // Get kills and deaths count
        const kills_count = await get_count(client,
            'SELECT COUNT(*) as count FROM kills WHERE display_name = ? AND victim != "A Scientist"',
            [name]
        );
        const deaths_count = await get_count(client, 
            'SELECT COUNT(*) as count FROM kills WHERE victim = ? AND display_name != "A Scientist"',
            [name]
        );

        // Get the last kill, last death, and worst enemy details
        const [last_kill, last_death, worst_enemy] = await Promise.all([
            get_last_record(
                "SELECT victim FROM kills WHERE type = 'Kill' AND display_name = ? ORDER BY id DESC LIMIT 1",
                [name]
            ),
            get_last_record(
                "SELECT display_name FROM kills WHERE type = 'Kill' AND victim = ? ORDER BY id DESC LIMIT 1",
                [name]
            ),
            get_last_record(
                "SELECT display_name, COUNT(*) AS count FROM kills WHERE type = 'Kill' AND victim = ? GROUP BY display_name ORDER BY count DESC LIMIT 1",
                [name]
            ),
        ]);

        // Compute K/D ratio
        const kd_ratio = deaths_count === 0 ? kills_count : (kills_count / deaths_count).toFixed(2);

        // Handle default values
        const last_killer_name = last_kill ? last_kill.victim : 'Not Killed Anyone';
        const last_death_name = last_death ? last_death.display_name : 'Not Been Killed';
        const worst_enemy_name = worst_enemy
            ? `${worst_enemy.display_name} (Deaths: ${worst_enemy.count})`
            : 'Not Found';

        // Construct the message
        const message = `
            <br><color=orange><size=50>Stats For ${name}</size></color>
            <size=25>Currency: <b><color=yellow>${currency}</color></b></size>
            <size=25>Last Killed : <b><color=orange>${last_killer_name}</color></b></size>
            <size=25>Last Killer : <b><color=orange>${last_death_name}</color></b></size>
            <size=25>Worst Enemy : <b><color=orange>${worst_enemy_name}</color></b></size>
            <size=25>Kills : <b><color=orange>${kills_count}</color></b></size>
            <size=25>Deaths : <b><color=orange>${deaths_count}</color></b></size>
            <size=25>K/D Ratio : <b><color=orange>${kd_ratio}</color></b></size>
        `;
        await client.rce.sendCommand(server.identifier, `global.say ${message}`);
    } catch (err) {
        client.functions.log("error", 'Error Fetching Player Info:', err);
        throw err;
    }
};
// Function to get a kit record from the MySQL database
async function get_record(client, player_name, type, server) {
    try {
        const [rows] = await client.database_connection.query(
            'SELECT last_redeemed FROM kit_redemptions WHERE display_name = ? AND type = ? AND server = ? AND region = ?',
            [player_name, type, server.serverId, server.region]
        );
        if (rows.length > 0) {
            return rows[0].last_redeemed; // Return last redeemed time
        } else {
            return null; // No record found
        }
    } catch (err) {
        console.error('Error fetching record:', err);
        throw err;
    }
}

// Function to set a kit record in the MySQL database
async function set_record(client, player_name, type, server, last_redeemed) {
    try {
        // Check if the player already has a record for this kit on this server and region
        const [existingRows] = await client.database_connection.query(
            'SELECT id FROM kit_redemptions WHERE display_name = ? AND type = ? AND server = ? AND region = ?',
            [player_name, type, server.serverId, server.region]
        );

        if (existingRows.length > 0) {
            // Update existing record
            await client.database_connection.query(
                'UPDATE kit_redemptions SET last_redeemed = ? WHERE display_name = ? AND type = ? AND server = ? AND region = ?',
                [last_redeemed, player_name, type, server.serverId, server.region]
            );
        } else {
            // Insert new record
            await client.database_connection.query(
                'INSERT INTO kit_redemptions (display_name, type, server, region, last_redeemed) VALUES (?, ?, ?, ?, ?)',
                [player_name, type, server.serverId, server.region, last_redeemed]
            );
        }
    } catch (err) {
        console.error('Error setting record:', err);
        throw err;
    }
}
function get_kit_time(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return { hours, minutes };
}

const SECONDS_IN_A_MINUTE = 60;
const SECONDS_IN_AN_HOUR = 3600;
const SECONDS_IN_A_DAY = 24 * SECONDS_IN_AN_HOUR;
const AN_HOUR = 1 * SECONDS_IN_AN_HOUR;
const TWO_HOURS = 2 * SECONDS_IN_AN_HOUR;

const handle_kit = async (client, player_name, server) => {
    try {
        const last_redeemed = await get_record(client, player_name, 'hourly', server);
        const current_timestamp = Math.floor(Date.now() / 1000);
        const timeDiff = current_timestamp - (last_redeemed || 0);

        // Function to log and send messages for cooldown or successful claim
        const notify = async (log_message, embed_title, embed_fields, chat_message, server) => {
            await client.functions.log("info", log_message);
            if (process.env.KIT_REDEMPTION_LOGS === 'true' && !client.functions.is_empty(process.env.KIT_REDEMPTION_CHANNEL)) {
                await client.functions.send_embed(client, process.env.KIT_REDEMPTION_CHANNEL, `${server.identifier} - ${embed_title}`, "", embed_fields, "https://cdn.void-dev.co/ak.png");
            }
            await client.rce.sendCommand(server.identifier, chat_message);
        };

        if (timeDiff < AN_HOUR) {
            const remaining_time = get_kit_time(AN_HOUR - timeDiff);
            const log_message = `[KITS] ${player_name} On Cooldown For ${remaining_time.hours} Hours And ${remaining_time.minutes} Minutes!`;

            const embed_fields = [
                { name: 'Player', value: `👤 ${player_name}`, inline: true },
                { name: 'Time', value: `🕜 <t:${current_timestamp}:R>`, inline: true },
                { name: 'Kit Type', value: `Hourly Kit`, inline: true },
                { name: 'Reason', value: `Kit Can Be Claimed In ${remaining_time.hours} Hours And ${remaining_time.minutes} Minutes!`, inline: true },
            ];

            const chat_message = `global.say <color=green>[KITS]</color> <color=#3498eb><b>${player_name}</b></color>: <color=orange><b>You Can Claim The Hourly Kit In ${remaining_time.hours} Hours And ${remaining_time.minutes} Minutes!</b></color>`;

            notify(log_message, "Kit Not Redeemed", embed_fields, chat_message, server);
        } else {
            await set_record(client, player_name, 'hourly', server, current_timestamp);
            const log_message = `[KITS] ${player_name} Claimed Hourly Kit!`;

            const embed_fields = [
                { name: 'Player', value: `👤 ${player_name}`, inline: true },
                { name: 'Time', value: `🕜 <t:${current_timestamp}:R>`, inline: true },
                { name: 'Kit Type', value: `Hourly Kit`, inline: true },
            ];

            const chat_message = `global.say <color=green>[KITS]</color> <color=#3498eb><b>${player_name}</b></color>: <color=green><b>Claimed Their Hourly Kit!</b></color>`;

            // Give the player the kit
            await client.rce.sendCommand(server.identifier, `kit givetoplayer "${process.env.HOURLY_KIT_NAME}" "${player_name}"`);

            notify(log_message, "Kit Redeemed", embed_fields, chat_message, server);
        }
    } catch (error) {
        console.error('Error handling hourly kit:', error);
    }
}
async function check_link(client, discord_id) {
    try {
        const [row] = await client.database_connection.execute("SELECT * FROM players WHERE discord_id = ?", [discord_id]);
        return row.length > 0;
    } catch (error) {
        await client.functions.log("error", `\x1b[34;1m[DATABASE]\x1b[0m Error In Checking Link: ${error.message}`);
        return false;
    }
}
const handle_vip_kit = async (client, player_name, server) => {
    const member = client.guilds.cache.get(process.env.GUILD_ID).members.cache.find(
        member => member.nickname === player_name || member.user.username === player_name
    );

    if (!member) {
        await client.functions.log("info", `[KITS] Member ${player_name} Not Found In The Discord Server!`);
        await client.rce.sendCommand(server.identifier, `global.say <color=green>[KITS]</color> <color=#3498eb><b>${player_name}</b></color> : <color=red><b>Could Not Find Your Discord Account, Are You Linked?</b></color>`);
        return;
    }
    if (!member.roles.cache.has(process.env.VIP_ROLE_ID)) {
        await client.functions.log("info", `[KITS] Member ${player_name} Does Not Have The VIP Role!`);
        await client.rce.sendCommand(server.identifier, `global.say <color=green>[KITS]</color> <color=#3498eb><b>${player_name}</b></color> : <color=red><b>You Do Not Have The VIP Role To Claim This Kit!</b></color>`);
        return;
    }
    try {
        const last_redeemed = await get_record(client, player_name, 'vip', server);
        const current_timestamp = Math.floor(Date.now() / 1000);
        const timeDiff = current_timestamp - (last_redeemed || 0);

        // Function to log and send messages for cooldown or successful claim
        const notify = async (log_message, embed_title, embed_fields, chat_message, server) => {
            await client.functions.log("info", log_message);
            if (process.env.KIT_REDEMPTION_LOGS === 'true' && !client.functions.is_empty(process.env.KIT_REDEMPTION_CHANNEL)) {
                await client.functions.send_embed(client, process.env.KIT_REDEMPTION_CHANNEL, `${server.identifier} - ${embed_title}`, "", embed_fields, "https://cdn.void-dev.co/ak.png");
            }
            await client.rce.sendCommand(server.identifier, chat_message);
        };

        if (timeDiff < TWO_HOURS) {
            const remaining_time = get_kit_time(TWO_HOURS - timeDiff);
            const log_message = `[KITS] ${player_name} On Cooldown For ${remaining_time.hours} Hours And ${remaining_time.minutes} Minutes!`;

            const embed_fields = [
                { name: 'Player', value: `👤 ${player_name}`, inline: true },
                { name: 'Time', value: `🕜 <t:${current_timestamp}:R>`, inline: true },
                { name: 'Kit Type', value: `VIP Kit`, inline: true },
                { name: 'Reason', value: `VIP Kit Can Be Claimed In ${remaining_time.hours} Hours And ${remaining_time.minutes} Minutes!`, inline: true },
            ];

            const chat_message = `global.say <color=green>[KITS]</color> <color=#3498eb><b>${player_name}</b></color>: <color=orange><b>You Can Claim The Hourly Kit In ${remaining_time.hours} Hours And ${remaining_time.minutes} Minutes!</b></color>`;

            notify(log_message, "Kit Not Redeemed", embed_fields, chat_message, server);
        } else {
            await set_record(client, player_name, 'vip', server, current_timestamp);
            const log_message = `[KITS] ${player_name} Claimed Hourly Kit!`;

            const embed_fields = [
                { name: 'Player', value: `👤 ${player_name}`, inline: true },
                { name: 'Time', value: `🕜 <t:${current_timestamp}:R>`, inline: true },
                { name: 'Kit Type', value: `VIP Kit`, inline: true },
            ];

            const chat_message = `global.say <color=green>[KITS]</color> <color=#3498eb><b>${player_name}</b></color>: <color=green><b>Claimed Their VIP Kit!</b></color>`;

            // Give the player the kit
            await client.rce.sendCommand(server.identifier, `kit givetoplayer "${process.env.VIP_KIT_NAME}" "${player_name}"`);

            notify(log_message, "Kit Redeemed", embed_fields, chat_message, server);
        }
    } catch (error) {
        console.error('Error handling hourly kit:', error);
    }
}

module.exports = {
    log,
    format_date,
    discord_log,
    send_embed,
    is_empty,
    format_hostname,
    edit_servers,
    get_player_currency,
    get_player_by_discord,
    get_count,
    get_event_name,
    get_item_image,
    is_json,
    ignored_attacker,
    trigger_random_item,
    load_items,
    get_server,
    handle_teleport,
    format_teleport_pos,
    get_player_info,
    get_record,
    set_record,
    handle_kit,
    handle_vip_kit,
    check_link
};