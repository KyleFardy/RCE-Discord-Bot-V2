// Import the required modules and components
const client = require('./core'); // Import the bot instance
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const fsp = require('fs/promises'); // Import fs/promises for promise-based fs methods
const path = require('path');
require('dotenv').config();

// Function to log messages with various types and formatting
// Define log levels without success
const logLevels = ['error', 'warn', 'info', 'debug']; // Ordered from most severe to least severe

// Set the minimum log level from an environment variable (or default to "info")
const minLogLevel = process.env.LOG_LEVEL || 'info'; // e.g., "warn" to log only warnings and above

function log(type = 'info', ...args) {
  const date = new Date();
  const timestamp = date.toLocaleTimeString([], { hour12: false }); // Get the current time in 24-hour format

  let prefix = ''; // Initialize prefix for log type
  let emoji = ''; // Initialize emoji for log type
  let color = '\x1b[0m'; // Default color reset

  // Define mappings for log types
  const log_type = {
    success: { prefix: '[SUCCESS]', emoji: '✅', color: '\x1b[32m' }, // Green color for success
    error: { prefix: '[ERROR]', emoji: '❌', color: '\x1b[31m' }, // Red color for errors
    warn: { prefix: '[WARNING]', emoji: '⚠️', color: '\x1b[33m' }, // Yellow color for warnings
    info: { prefix: '[INFO]', emoji: '💬', color: '\x1b[36m' }, // Cyan color for info
    debug: { prefix: '[DEBUG]', emoji: '🔧', color: '\x1b[35m' }, // Purple color for custom logs
  };

  // Check if the provided log type exists in mappings, otherwise use custom type
  if (log_type[type]) {
    prefix = log_type[type].prefix; // Get prefix for the log type
    emoji = log_type[type].emoji; // Get emoji for the log type
    color = log_type[type].color; // Update color if specified
  } else {
    prefix = `[${type.toUpperCase()}]`; // Default prefix for unknown types
    emoji = '🔧'; // Default emoji for unknown types
  }

  // Always log success messages, and check if the current log type is above the minimum log level
  if (
    type === 'success' ||
    logLevels.indexOf(type) <= logLevels.indexOf(minLogLevel)
  ) {
    // Output the formatted log message followed by the additional arguments
    console.log(
      `\x1b[90m[${timestamp}]\x1b[0m ${color}${prefix}${' '.repeat(
        Math.max(0, 15 - prefix.length)
      )}${emoji}\x1b[0m`,
      ...args
    );
  }
}

// Function to check if a string is empty or contains only whitespace
function is_empty(s) {
  return !s || /^\s*$/.test(s); // Returns true if the string is empty or only whitespace
}

// Function to format a date according to the specified locale
function format_date(date, locale = 'en-GB') {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  };
  return new Intl.DateTimeFormat(locale, options).format(date); // Format date using Intl API
}

const is_json = (str) => {
  try {
    return !!JSON.parse(str);
  } catch {
    return false;
  }
};

// Asynchronous function to send a message to a Discord channel
async function discord_log(client, message, channelId) {
  try {
    // Get the channel using the provided channelId
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      throw new Error('Channel Not Found');
    }
    const maxMessageLength = 1999;
    if (message.length > maxMessageLength) {
      // Split the message into chunks of maxMessageLength
      const chunks = message.match(new RegExp(`.{1,${maxMessageLength}}`, 'g'));

      // Send each chunk as a separate message
      for (const chunk of chunks) {
        await channel.send({ content: chunk });
      }
    } else {
      // Send the message to the specified channel
      await channel.send({ content: message });
    }
  } catch (error) {
    await client.functions.log(
      'error',
      'Failed To Send Message To Channel:',
      error
    );
  }
}

async function get_item_image(display_name) {
  const itemsPath = path.join(__dirname, 'items.json');
  const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
  const item = items.find(
    (item) => item.displayName.toLowerCase() === display_name.toLowerCase()
  );
  if (item) {
    return `https://void-dev.co/proxy?image=${item.shortName}`;
  } else {
    return 'https://cdn.void-dev.co/rce.png'; // Return an error message if not found
  }
}

const ignored_attacker = [
  'Thirst',
  'Hunger',
  'Shotgun Trap',
  'Pee Pee 9000',
  'Wooden Barricade',
  'High External Stone Wall',
  'High External Wooden Wall',
  'High External Wooden Gate',
  'High External Stone Gate',
  'Bear',
  'Auto Turret',
  'Cold',
  'Bleeding',
  'Boar',
  'Wolf',
  'Fall',
  'Drowned',
  'Radiation',
  'Fall',
  'Code Lock',
  'Bradley APC',
  'Metal Barricade',
  'Floor Spikes',
  'Bandit Sentry',
  'Cactus',
  'Landmine',
  'Scientist Sentry',
  'Patrol Helicopter',
  'Flame Turret',
  'Small Oil Fire',
  'Napalm',
  'Cargo Ship',
  'Wooden Barricade',
  'Bear Trap',
  'Campfire',
  'Crane Lift',
  'Rowboat',
  'Fireball',
  'Tesla Coil',
];

const event_messages = {
  Airdrop: {
    formatted:
      '<color=green>[EVENT]</color> An <b>Air Drop</b> Is Falling From The Sky, Can You Find It?',
    discord: {
      title: 'An Airdrop Is Inbound',
      message: 'An **Air Drop** Is Falling From The Sky, Can You Find It?',
      image: 'https://i.ibb.co/dKVrgmj/supply-drop.png',
    },
    console: 'An Air Drop Is Falling From The Sky, Can You Find It?',
  },
  'Cargo Ship': {
    formatted:
      '<color=green>[EVENT]</color> <b>Cargo Ship</b> Is Sailing The Seas Around The Island, Ready To Board?',
    discord: {
      title: 'Cargo Ship Is Sailing',
      message: 'The **Cargo Ship** Is Sailing The Seas Around The Island!',
      image: 'https://i.ibb.co/zFjhDd7/cargo-ship-scientist.png',
    },
    console:
      'Cargo Ship Is Sailing The Seas Around The Island, Ready To Board?',
  },
  Chinook: {
    formatted:
      '<color=green>[EVENT]</color> Chinook Is Looking For A Monument To Drop A Crate!',
    discord: {
      title: 'Locked Crate Incoming',
      message: '**Chinook** Is Looking For A Monument To Drop A Crate!',
      image: 'https://i.ibb.co/jyN7nht/codelockedhackablecrate.png',
    },
    console: 'Chinook Is Looking For A Monument To Drop A Crate!',
  },
  'Patrol Helicopter': {
    formatted:
      '<color=green>[EVENT]</color> A <b>Patrol Helicopter</b> Is Circling The Map, Ready To Take It Down?',
    discord: {
      title: 'Get That L9',
      message:
        'A **Patrol Helicopter** Is Circling The Map, Ready To Take It Down?',
      image: 'https://cdn.void-dev.co/patrol_helicopter.png',
    },
    console: 'A Patrol Helicopter Is Circling The Map, Ready To Take It Down?',
  },
  Halloween: {
    formatted:
      '<color=green>[SPECIAL EVENT]</color> A Halloween Event Has Started!',
    discord: {
      title: 'Spooky Spooky',
      message: 'A **Halloween** Event Has Started!',
      image: 'https://i.ibb.co/pr609gm/halloween.png',
    },
    console: 'A Halloween Event Has Started!',
  },
  Christmas: {
    formatted:
      '<color=green>[SPECIAL EVENT]</color> A Christmas Event Has Started!',
    discord: {
      title: 'Merry Christmas',
      message: 'A **Christmas** Event Has Started!',
      image: 'https://i.ibb.co/xLDqqst/christmas.png',
    },
    console: 'A Christmas Event Has Started!',
  },
  Easter: {
    formatted:
      '<color=green>[SPECIAL EVENT]</color> An Easter Event Has Started!',
    discord: {
      title: 'Eggs Incoming',
      message: 'An **Easter** Event Has Started!',
      image: 'https://i.ibb.co/zf27jLd/easter.png',
    },
    console: 'An Easter Event Has Started!',
  },
  'Bradley APC Debris': {
    formatted:
      '<color=green>[EVENT]</color> Somebody Has Just Destroyed <b><color=orange>Bradley APC</color>!',
    discord: {
      title: 'Bradley APC Taken',
      message: 'Somebody Just Took **Brad**, Ready To Counter?',
      image: 'https://cdn.void-dev.co/bradleyapc.png',
    },
    console: 'Brad Has Just Been Downed!',
  },
  'Patrol Helicopter Debris': {
    formatted:
      '<color=green>[EVENT]</color> Somebody Has Just Downed <b><color=orange>Patrol Helicopter</color>!',
    discord: {
      title: 'Patrol Helicopter Dropped',
      message: 'Somebody Has Just Dropped The **Patrol Helicopter**!',
      image: 'https://cdn.void-dev.co/patrol_helicopter.png',
    },
    console: 'The Patrol Helicopter Has Just Been Downed!',
  },
  'Small Oil Rig': {
    formatted:
      '<color=green>[EVENT]</color> Somebody Just Called In Heavy Scientists At <b><color=orange>Small Oil Rig</color>!',
    discord: {
      title: 'Small Oil Rig',
      message: 'Heavy Scientists Called In At **Small Oil Rig**!',
      image: 'https://cdn.void-dev.co/oil_rig.png',
    },
    console: 'Heavy Scientists Called In At Small Oil Rig!',
  },
  'Oil Rig': {
    formatted:
      '<color=green>[EVENT]</color> Somebody Just Called In Heavy Scientists At <b><color=orange>Large Oil Rig</color>!',
    discord: {
      title: 'Large Oil Rig',
      message: 'Heavy Scientists Called In At **Large Oil Rig**!',
      image: 'https://cdn.void-dev.co/oil_rig.png',
    },
    console: 'Heavy Scientists Called In At Large Oil Rig!',
  },
};

// Asynchronous function to send an embedded message to a Discord channel
async function send_embed(
  client,
  channel,
  title,
  description,
  fields = [],
  thumbnailUrl = null,
  imageUrl = null
) {
  // Create a new embed
  const embed = new EmbedBuilder()
    .setTitle(title) // Set the title of the embed
    .setTimestamp()
    .setColor('#e6361d') // Set the color of the embed
    .setFooter({
      text: process.env.EMBED_FOOTER_TEXT,
      iconURL: process.env.EMBED_LOGO,
    });

  // Set the description if provided
  if (description.length > 0) {
    embed.setDescription(description);
  }

  // Add fields if provided
  if (fields.length > 0) {
    fields.forEach((field) => {
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
    await client.functions.log(
      'error',
      `Error Sending Embed to Channel ${channel}:`,
      error
    );
  }
}

// Function to format a hostname with color codes based on the provided color
function format_hostname(hostname) {
  const color_codes = {
    //custom
    purple: '\x1b[35m', // Add purple as magenta

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
    purple: '\x1b[35m', // Purple
    orange: '\x1b[33m', // Orange
    green: '\x1b[32m', // Green
    red: '\x1b[31m', // Red
    blue: '\x1b[34m', // Blue
    // Specific Hex Colors
    '#3498eb': '\x1b[36m', // Light Blue
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
  };

  // Use a regular expression to find the color tags and their contents
  return hostname
    .replace(/<color=([^>]+)>(.*?)<\/color>/g, (match, color, text) => {
      // Use the corresponding ANSI code or default to reset if the color is not defined
      const ansi_color = color_codes[color] || '\x1b[0m'; // Reset to default if color not found
      return `${ansi_color}${text}\x1b[0m`; // Append reset code after the text
    })
    .replace(/<b>(.*?)<\/b>/g, '\x1b[1m$1\x1b[22m') // Handle bold text
    .replace(/<i>(.*?)<\/i>/g, '\x1b[3m$1\x1b[23m'); // Handle italic text
}

async function get_player_currency(discord_id, server) {
  try {
    const [discordIdRows] = await client.database_connection.execute(
      'SELECT currency FROM players WHERE discord_id = ? AND server = ? AND region = ?',
      [discord_id, server.serverId[0], server.region]
    );

    if (discordIdRows.length > 0 && discordIdRows[0].currency != null) {
      return discordIdRows[0].currency;
    } else {
      return 0;
    }
  } catch (err) {
    console.error('Error during query execution:', err.message);
    throw err;
  }
}

async function get_player_by_discord(discord_id, server) {
  try {
    const [discordIdRows] = await client.database_connection.execute(
      'SELECT display_name FROM players WHERE discord_id = ? AND server = ? AND region = ?',
      [discord_id, server.serverId[0], server.region]
    );

    if (discordIdRows.length > 0 && discordIdRows[0].display_name != null) {
      return discordIdRows[0].display_name;
    } else {
      return discord_id;
    }
  } catch (err) {
    console.error('Error during query execution:', err.message);
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
  Message: 'message', // Event triggered when a message is sent
  PlayerKill: 'player_kill', // Event triggered when a player is killed
  PlayerJoined: 'player_joined', // Event triggered when a player joins the server
  PlayerLeft: 'player_left', // Event triggered when a player leaves the server
  PlayerRespawned: 'player_respawned', // Event triggered when a player respawns
  PlayerSuicide: 'player_suicide', // Event triggered when a player commits suicide
  PlayerRoleAdd: 'player_role_add', // Event triggered when a role is added to a player
  QuickChat: 'quick_chat', // Event triggered for quick chat messages
  NoteEdit: 'note_edit', // Event triggered when a note is edited
  EventStart: 'event_start', // Event triggered when a general event starts
  PlayerListUpdate: 'playerlist_update', // Event triggered when the player list is updated
  ItemSpawn: 'item_spawn', // Event triggered when an item spawns
  VendingMachineName: 'vending_machine_name', // Event triggered when a vending machine is renamed
  KitSpawn: 'kit_spawn', // Event triggered when a kit spawns
  KitGive: 'kit_give', // Event triggered when a kit is given to a player
  TeamCreate: 'team_create', // Event triggered when a team is created
  TeamJoin: 'team_join', // Event triggered when a player joins a team
  TeamLeave: 'team_leave', // Event triggered when a player leaves a team
  SpecialEventStart: 'special_event_start', // Event triggered when a special event starts
  SpecialEventEnd: 'special_event_end', // Event triggered when a special event ends
  ExecutingCommand: 'executing_command', // Event triggered when a command is being executed
  Error: 'error', // Event triggered when an error occurs
  Log: 'log', // Event triggered for logging purposes
  ServiceState: 'service_state', // Event triggered to report the service state
  CustomZoneAdded: 'custom_zone_added', // Event triggered when a custom zone is added
  CustomZoneRemoved: 'custom_zone_removed', // Event triggered when a custom zone is removed

  //discord
  AutoModerationRuleCreate: 'autoModerationRuleCreate', // Triggered when an auto moderation rule is created
  AutoModerationRuleDelete: 'autoModerationRuleDelete', // Triggered when an auto moderation rule is deleted
  AutoModerationRuleUpdate: 'autoModerationRuleUpdate', // Triggered when an auto moderation rule is updated
  ChannelCreate: 'channelCreate', // Triggered when a channel is created
  ChannelDelete: 'channelDelete', // Triggered when a channel is deleted
  ChannelUpdate: 'channelUpdate', // Triggered when a channel is updated
  GuildBanAdd: 'guildBanAdd', // Triggered when a user is banned from a guild
  GuildBanRemove: 'guildBanRemove', // Triggered when a user is unbanned from a guild
  GuildCreate: 'guildCreate', // Triggered when the bot joins a new guild
  GuildDelete: 'guildDelete', // Triggered when the bot is removed from a guild
  GuildIntegrationsUpdate: 'guildIntegrationsUpdate', // Triggered when a guild's integrations are updated
  GuildMemberAdd: 'guildMemberAdd', // Triggered when a member joins a guild
  GuildMemberRemove: 'guildMemberRemove', // Triggered when a member leaves a guild
  GuildMemberUpdate: 'guildMemberUpdate', // Triggered when a member's information is updated
  GuildUpdate: 'guildUpdate', // Triggered when a guild's information is updated
  InteractionCreate: 'interactionCreate', // Triggered when an interaction occurs (e.g., slash commands)
  InviteCreate: 'inviteCreate', // Triggered when an invite is created
  InviteDelete: 'inviteDelete', // Triggered when an invite is deleted
  MessageCreate: 'messageCreate', // Triggered when a message is created
  MessageDelete: 'messageDelete', // Triggered when a message is deleted
  MessageDeleteBulk: 'messageDeleteBulk', // Triggered when multiple messages are deleted at once
  MessageReactionAdd: 'messageReactionAdd', // Triggered when a reaction is added to a message
  MessageReactionRemove: 'messageReactionRemove', // Triggered when a reaction is removed from a message
  MessageReactionRemoveAll: 'messageReactionRemoveAll', // Triggered when all reactions are removed from a message
  MessageUpdate: 'messageUpdate', // Triggered when a message is updated
  PresenceUpdate: 'presenceUpdate', // Triggered when a user's presence (status) is updated
  Ready: 'ready', // Triggered when the bot is ready
  RoleCreate: 'roleCreate', // Triggered when a role is created
  RoleDelete: 'roleDelete', // Triggered when a role is deleted
  RoleUpdate: 'roleUpdate', // Triggered when a role is updated
  ShardDisconnect: 'shardDisconnect', // Triggered when a shard disconnects from Discord
  ShardReconnect: 'shardReconnect', // Triggered when a shard reconnects to Discord
  ShardReady: 'shardReady', // Triggered when a shard is ready and connected to Discord
  ShardResume: 'shardResume', // Triggered when a shard resumes its connection to Discord after being disconnected
  StageInstanceCreate: 'stageInstanceCreate', // Triggered when a Stage instance is created
  StageInstanceDelete: 'stageInstanceDelete', // Triggered when a Stage instance is deleted
  StageInstanceUpdate: 'stageInstanceUpdate', // Triggered when a Stage instance is updated
  TypingStart: 'typingStart', // Triggered when someone starts typing in a channel
  UserUpdate: 'userUpdate', // Triggered when a user's information is updated
  VoiceStateUpdate: 'voiceStateUpdate', // Triggered when a user's voice state changes
  WebhookUpdate: 'webhookUpdate', // Triggered when a webhook is updated
});

function get_event_name(event) {
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
    throw new Error('The items array is empty or not loaded');
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
  try {
    // Exit early if RANDOM_ITEMS is disabled
    if (server.random_items === 'false') return;

    // Retrieve the multiplier from the environment variable, defaulting to 1
    const multiplier = parseInt(server.loot_scale) || 1;

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
    await Promise.all(
      players.map(async (player) => {
        const item = await get_random_item(client);
        const quantity = get_item_quantity(item);

        // Send command to give item to user
        await client.rce.servers.command(
          server.identifier,
          `giveto "${player}" "${item.shortName}" "${quantity}"`
        );
        await client.functions.log(
          'info',
          `\x1b[38;5;208m[${server.identifier}]\x1b[0m \x1b[32;1m[RANDOM ITEMS]\x1b[0m Giving ${player.ign} ${quantity}x ${item.displayName}`
        );
      })
    );
  } catch (err) {
    await client.functions.log(
      'error',
      `\x1b[38;5;208m[${server.identifier}]\x1b[0m \x1b[32;1m[RANDOM ITEMS]\x1b[0m ${err.message}`
    );
  }
}
async function delete_server(client, guild_id, region, server_id, identifier) {
  try {
    // Check if the server exists with the given parameters
    const [rows] = await client.database_connection.query(
      'SELECT * FROM servers WHERE guild_id = ? AND region = ? AND server_id = ? AND identifier = ?',
      [guild_id, region, server_id, identifier]
    );

    // If no matching server is found, log a not found message
    if (rows.length === 0) {
      console.log(
        `No Server Found With The Specified Parameters: Identifier: \`${identifier}\`, Server ID: \`${server_id}\`, Region: \`${region}\`.`
      );
      return false;
    }

    // Delete the server from the database
    await client.database_connection.query(
      'DELETE FROM servers WHERE guild_id = ? AND region = ? AND server_id = ? AND identifier = ?',
      [guild_id, region, server_id, identifier]
    );
    return true;
  } catch (err) {
    console.error('Error deleting server record:', err);
    return false;
  }
}

async function get_server(client, identifier) {
  try {
    const [rows] = await client.database_connection.query(
      'SELECT * FROM servers WHERE identifier = ?',
      [identifier]
    );

    // Return the first row or a not found message
    if (rows.length === 0) {
      return `Server With Identifier \`${identifier}\` Not Found!`;
    }
    return rows[0];
  } catch (err) {
    console.error('Error fetching record:', err);
    throw err; // Rethrow the error for further handling
  }
}
async function get_guild_servers(client, identifier, guild) {
  try {
    const [rows] = await client.database_connection.query(
      'SELECT * FROM servers WHERE identifier = ? AND guild_id = ?',
      [identifier, guild]
    );

    // Return the first row or a not found message
    if (rows.length === 0) {
      return `Server With Identifier \`${identifier}\` Not Found!`;
    }
    return rows[0];
  } catch (err) {
    console.error('Error fetching record:', err);
    throw err; // Rethrow the error for further handling
  }
}

async function get_server_discord(client, guild_id) {
  try {
    const [rows] = await client.database_connection.query(
      'SELECT * FROM servers WHERE guild_id = ?',
      [guild_id]
    );

    // Return the first row or a not found message
    if (rows.length === 0) {
      return `Server With guild_id "${guild_id}" Not Found!`;
    }
    return rows[0];
  } catch (err) {
    console.error('Error fetching record:', err);
    throw err; // Rethrow the error for further handling
  }
}
async function get_servers_by_guild(client, guild_id) {
  try {
    const [rows] = await client.database_connection.query(
      'SELECT * FROM servers WHERE guild_id = ?',
      [guild_id]
    );

    return rows; // Return the list of servers
  } catch (err) {
    console.error('Error fetching servers:', err);
    return []; // Return an empty array on error
  }
}

async function get_server_discord_identifier(client, guild_id, identifier) {
  try {
    const [rows] = await client.database_connection.query(
      'SELECT * FROM servers WHERE guild_id = ? AND identifier = ?',
      [guild_id, identifier]
    );

    // Return the first row or a not found message
    if (rows.length === 0) {
      return `Server Not Found!`;
    }
    return rows[0];
  } catch (err) {
    console.error('Error fetching record:', err);
    throw err; // Rethrow the error for further handling
  }
}

const handle_teleport = async (
  client,
  player_name,
  coords,
  location,
  server
) => {
  await client.functions.log(
    'info',
    `\x1b[32;1m[TELEPORT]\x1b[0m \x1b[38;5;208m${player_name}\x1b[0m Teleporting To \x1b[38;5;208m${location}\x1b[0m`
  );
  await client.rce.servers.command(
    server.identifier,
    await client.functions.format_teleport_pos(player_name, coords)
  );

  await send_embed(
    client,
    server.teleport_logs_channel_id,
    `${server.identifier} - New Teleport`,
    '',
    [
      { name: 'Player', value: `👤 ${player_name}`, inline: true },
      { name: 'Teleported To', value: `\`${location}\``, inline: true },
      { name: 'Coords', value: ` \`\`\`${coords}\`\`\` `, inline: true },
      {
        name: 'Time',
        value: `🕜 <t:${Math.floor(new Date().getTime() / 1000)}:R>`,
        inline: true,
      },
    ],
    'https://cdn.void-dev.co/rust_map.png'
  );
};

const format_teleport_pos = (player_name, coordinates) => {
  return `teleportpos "${coordinates}" "${player_name}"`;
};

const get_player_info = async (client, player_name, server) => {
  try {
    // Fetch player info
    const [rows] = await client.database_connection.query(
      'SELECT * FROM players WHERE server = ? AND region = ? AND display_name = ?',
      [server.serverId[0], server.region, player_name]
    );

    if (rows.length === 0) return; // Exit if no player found

    const playerInfo = rows[0];
    const { display_name: name, currency } = playerInfo;

    // Helper function to get the last record
    const get_last_record = async (query, params) => {
      const [rows] = await client.database_connection.query(query, params);
      return rows.length > 0 ? rows[0] : null;
    };

    // Get kills and deaths count
    const kills_count = await get_count(
      client,
      'SELECT COUNT(*) as count FROM kills WHERE display_name = ? AND victim != "A Scientist"',
      [name]
    );
    const deaths_count = await get_count(
      client,
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
    const kd_ratio =
      deaths_count === 0
        ? kills_count
        : (kills_count / deaths_count).toFixed(2);

    // Handle default values
    const last_killer_name = last_kill ? last_kill.victim : 'Not Killed Anyone';
    const last_death_name = last_death
      ? last_death.display_name
      : 'Not Been Killed';
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
    await client.rce.servers.command(
      server.identifier,
      `global.say ${message}`
    );
  } catch (err) {
    client.functions.log('error', 'Error Fetching Player Info:', err);
    throw err;
  }
};

// Function to get a kit record from the MySQL database
async function get_record(client, player_name, type, server) {
  try {
    const [rows] = await client.database_connection.query(
      'SELECT last_redeemed FROM kit_redemptions WHERE display_name = ? AND type = ? AND server = ? AND region = ?',
      [player_name, type, server.serverId[0], server.region]
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
      [player_name, type, server.serverId[0], server.region]
    );

    if (existingRows.length > 0) {
      // Update existing record
      await client.database_connection.query(
        'UPDATE kit_redemptions SET last_redeemed = ? WHERE display_name = ? AND type = ? AND server = ? AND region = ?',
        [last_redeemed, player_name, type, server.serverId[0], server.region]
      );
    } else {
      // Insert new record
      await client.database_connection.query(
        'INSERT INTO kit_redemptions (display_name, type, server, region, last_redeemed) VALUES (?, ?, ?, ?, ?)',
        [player_name, type, server.serverId[0], server.region, last_redeemed]
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

const handle_kit = async (client, player_name, current_server, server) => {
  try {
    const last_redeemed = await get_record(
      client,
      player_name,
      'hourly',
      server
    );
    const current_timestamp = Math.floor(Date.now() / 1000);
    const timeDiff = current_timestamp - (last_redeemed || 0);

    // Function to log and send messages for cooldown or successful claim
    const notify = async (
      log_message,
      embed_title,
      embed_fields,
      chat_message,
      server
    ) => {
      await client.functions.log('info', log_message);
      await client.functions.send_embed(
        client,
        current_server.kits_logs_channel_id,
        `${server.identifier} - ${embed_title}`,
        '',
        embed_fields,
        'https://cdn.void-dev.co/ak.png'
      );
      await client.rce.servers.command(server.identifier, chat_message);
    };

    if (timeDiff < AN_HOUR) {
      const remaining_time = get_kit_time(AN_HOUR - timeDiff);
      const log_message = `[KITS] ${player_name} On Cooldown For ${remaining_time.hours} Hours And ${remaining_time.minutes} Minutes!`;
      const member_name =
        client.guilds.cache
          .get(current_server.guild_id)
          ?.members.cache.find(
            (member) =>
              member.nickname === player_name ||
              member.user.username === player_name
          )
          ?.toString() || player_name;
      const embed_fields = [
        { name: 'Player', value: `👤 ${member_name}`, inline: true },
        { name: 'Time', value: `🕜 <t:${current_timestamp}:R>`, inline: true },
        { name: 'Kit Type', value: `Hourly Kit`, inline: true },
        {
          name: 'Reason',
          value: `Kit Can Be Claimed In ${remaining_time.hours} Hours And ${remaining_time.minutes} Minutes!`,
          inline: true,
        },
      ];

      const chat_message = `global.say <color=green>[KITS]</color> <color=#3498eb><b>${player_name}</b></color>: <color=orange><b>You Can Claim The Hourly Kit In ${remaining_time.hours} Hours And ${remaining_time.minutes} Minutes!</b></color>`;

      notify(
        log_message,
        'Kit Not Redeemed',
        embed_fields,
        chat_message,
        server
      );
    } else {
      await set_record(
        client,
        player_name,
        'hourly',
        server,
        current_timestamp
      );
      const log_message = `[KITS] ${player_name} Claimed Hourly Kit!`;

      const member_name =
        client.guilds.cache
          .get(current_server.guild_id)
          ?.members.cache.find(
            (member) =>
              member.nickname === player_name ||
              member.user.username === player_name
          )
          ?.toString() || player_name;
      const embed_fields = [
        { name: 'Player', value: `👤 ${member_name}`, inline: true },
        { name: 'Time', value: `🕜 <t:${current_timestamp}:R>`, inline: true },
        { name: 'Kit Type', value: `Hourly Kit`, inline: true },
      ];

      const chat_message = `global.say <color=green>[KITS]</color> <color=#3498eb><b>${player_name}</b></color>: <color=green><b>Claimed Their Hourly Kit!</b></color>`;

      // Give the player the kit
      await client.rce.servers.command(
        server.identifier,
        `kit givetoplayer "${current_server.hourly_kit_name}" "${player_name}"`
      );

      notify(log_message, 'Kit Redeemed', embed_fields, chat_message, server);
    }
  } catch (error) {
    console.error('Error handling hourly kit:', error);
  }
};
async function send_auto_messages(client, server) {
  let last_auto_message_index = -1;
  async function send_message() {
    let message_index;
    do {
      message_index = Math.floor(
        Math.random() * client.auto_messages.messages.length
      ); // Corrected variable name
    } while (
      message_index === last_auto_message_index &&
      client.auto_messages.messages.length > 1
    ); // Ensure there's more than one message to avoid an infinite loop

    // Fetch the message using the correct index
    const message = client.auto_messages.messages[message_index];

    // Check if message is defined
    if (message) {
      await client.functions.log(
        'info',
        `\x1b[38;5;208m[${server.identifier}]\x1b[0m \x1b[32;1m[AUTO MESSAGE]\x1b[0m :`,
        client.functions.format_hostname(message)
      );
      await client.rce.servers.command(
        server.identifier,
        `global.say <color=green><b>[AUTO MESSAGE]</b></color> <b>${message}</b>`
      );
      last_auto_message_index = message_index; // Update the last message index
    } else {
      await client.functions.log(
        'info',
        `\x1b[38;5;208m[${server.identifier}]\x1b[0m \x1b[32;1m[AUTO MESSAGE]\x1b[0m : No message found at index ${message_index}`
      );
    }
  }

  send_message(); // Send the initial message
  setInterval(send_message, 2 * 60 * 1000); // Check every 2 minutes
}

async function check_link(client, discord_id) {
  try {
    const [row] = await client.database_connection.execute(
      'SELECT * FROM players WHERE discord_id = ?',
      [discord_id]
    );
    return row.length > 0;
  } catch (error) {
    await client.functions.log(
      'error',
      `\x1b[34;1m[DATABASE]\x1b[0m Error In Checking Link: ${error.message}`
    );
    return false;
  }
}
async function check_server_link(client, identifier, region, server_id) {
  try {
    const [row] = await client.database_connection.execute(
      'SELECT * FROM servers WHERE identifier = ? AND region = ? AND server_id = ?',
      [identifier, region, server_id]
    );
    return row.length > 0;
  } catch (error) {
    await client.functions.log(
      'error',
      `\x1b[34;1m[DATABASE]\x1b[0m Error In Checking Server Link: ${error.message}`
    );
    return false;
  }
}

const handle_vip_kit = async (client, player_name, current_server, server) => {
  const member = client.guilds.cache
    .get(current_server.guild_id)
    .members.cache.find(
      (member) =>
        member.nickname === player_name || member.user.username === player_name
    );

  if (!member) {
    await client.functions.log(
      'info',
      `[KITS] Member ${player_name} Not Found In The Discord Server!`
    );
    await client.rce.servers.command(
      server.identifier,
      `global.say <color=green>[KITS]</color> <color=#3498eb><b>${player_name}</b></color> : <color=red><b>Could Not Find Your Discord Account, Are You Linked?</b></color>`
    );
    return;
  }
  if (!member.roles.cache.has(server.vip_role_id)) {
    await client.functions.log(
      'info',
      `[KITS] Member ${player_name} Does Not Have The VIP Role!`
    );
    await client.rce.servers.command(
      server.identifier,
      `global.say <color=green>[KITS]</color> <color=#3498eb><b>${player_name}</b></color> : <color=red><b>You Do Not Have The VIP Role To Claim This Kit!</b></color>`
    );
    return;
  }
  try {
    const last_redeemed = await get_record(client, player_name, 'vip', server);
    const current_timestamp = Math.floor(Date.now() / 1000);
    const timeDiff = current_timestamp - (last_redeemed || 0);

    // Function to log and send messages for cooldown or successful claim
    const notify = async (
      log_message,
      embed_title,
      embed_fields,
      chat_message,
      server
    ) => {
      await client.functions.log('info', log_message);
      await client.functions.send_embed(
        client,
        current_server.kits_logs_channel_id,
        `${server.identifier} - ${embed_title}`,
        '',
        embed_fields,
        'https://cdn.void-dev.co/ak.png'
      );
      await client.rce.servers.command(server.identifier, chat_message);
    };

    if (timeDiff < TWO_HOURS) {
      const remaining_time = get_kit_time(TWO_HOURS - timeDiff);
      const log_message = `[KITS] ${player_name} On Cooldown For ${remaining_time.hours} Hours And ${remaining_time.minutes} Minutes!`;

      const member_name =
        client.guilds.cache
          .get(current_server.guild_id)
          ?.members.cache.find(
            (member) =>
              member.nickname === player_name ||
              member.user.username === player_name
          )
          ?.toString() || player_name;
      const embed_fields = [
        { name: 'Player', value: `👤 ${member_name}`, inline: true },
        { name: 'Time', value: `🕜 <t:${current_timestamp}:R>`, inline: true },
        { name: 'Kit Type', value: `VIP Kit`, inline: true },
        {
          name: 'Reason',
          value: `VIP Kit Can Be Claimed In ${remaining_time.hours} Hours And ${remaining_time.minutes} Minutes!`,
          inline: true,
        },
      ];

      const chat_message = `global.say <color=green>[KITS]</color> <color=#3498eb><b>${player_name}</b></color>: <color=orange><b>You Can Claim The Hourly Kit In ${remaining_time.hours} Hours And ${remaining_time.minutes} Minutes!</b></color>`;

      notify(
        log_message,
        'Kit Not Redeemed',
        embed_fields,
        chat_message,
        server
      );
    } else {
      await set_record(client, player_name, 'vip', server, current_timestamp);
      const log_message = `[KITS] ${player_name} Claimed Hourly Kit!`;

      const member_name =
        client.guilds.cache
          .get(current_server.guild_id)
          ?.members.cache.find(
            (member) =>
              member.nickname === player_name ||
              member.user.username === player_name
          )
          ?.toString() || player_name;
      const embed_fields = [
        { name: 'Player', value: `👤 ${member_name}`, inline: true },
        { name: 'Time', value: `🕜 <t:${current_timestamp}:R>`, inline: true },
        { name: 'Kit Type', value: `VIP Kit`, inline: true },
      ];

      const chat_message = `global.say <color=green>[KITS]</color> <color=#3498eb><b>${player_name}</b></color>: <color=green><b>Claimed Their VIP Kit!</b></color>`;

      // Give the player the kit
      await client.rce.servers.command(
        server.identifier,
        `kit givetoplayer "${current_server.vip_kit_name}" "${player_name}"`
      );

      notify(log_message, 'Kit Redeemed', embed_fields, chat_message, server);
    }
  } catch (error) {
    console.error('Error handling hourly kit:', error);
  }
};

const server_status_messages = {
  STOPPING: 'The Server Is Stopping!',
  MAINTENANCE: 'The Server Is Under Maintenance!',
  UPDATING: 'The Server Is Updating!',
  STOPPED: 'The Server Has Stopped!',
  STARTING: 'The Server Is Starting!',
  RUNNING: 'The Server Is Running!',
  SUSPENDED: 'The Server Has Been Suspended!',
};
async function create_settings_embed(client, identifier) {
  const server = await client.functions.get_server(client, identifier);

  // Fetch the guild using the guild_id from the server object
  const guild = await client.guilds.cache.get(server.guild_id);

  // Check if guild is found
  if (!guild) {
    throw new Error(`Guild with ID ${server.guild_id} not found`);
  }

  // Fetch linked and VIP roles from the guild
  const linked_role = guild.roles.cache.find(
    (role) => role.id === server.linked_role_id
  );
  const vip_role = guild.roles.cache.find((role) => role.name === 'VIP');
  return new EmbedBuilder()
    .setColor(process.env.EMBED_COLOR)
    .setTitle(`${server.identifier} Settings`)
    .setAuthor({
      name: 'RCE Admin',
      iconURL: process.env.EMBED_LOGO,
      url: 'https://github.com/KyleFardy/RCE-Discord-Bot-V2',
    })

    .setDescription(
      `Here Are The Settings For **[${server.region}] ${server.identifier} - ${server.server_id}**`
    )
    .setThumbnail('https://cdn.void-dev.co/settings_logo.png')
    .addFields(
      {
        name: 'NPC Kill Points',
        value: `**${server.npc_kill_points?.toString() ?? 'Not Set'}**`,
        inline: true,
      },
      {
        name: 'NPC Death Points',
        value: `**${server.npc_death_points?.toString() ?? 'Not Set'}**`,
        inline: true,
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true,
      }, // Blank field
      {
        name: 'Player Kill Points',
        value: `**${server.player_kill_points?.toString() ?? 'Not Set'}**`,
        inline: true,
      },
      {
        name: 'Player Death Points',
        value: `**${server.player_death_points?.toString() ?? 'Not Set'}**`,
        inline: true,
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true,
      }, // Blank field
      {
        name: 'Suicide Points',
        value: `**${server.suicide_points?.toString() ?? 'Not Set'}**`,
        inline: true,
      },
      {
        name: 'Extended Feeds',
        value: `${
          server.bradley_feeds == 1 || server.heli_feeds == 1
            ? '**Enabled**'
            : '**Disabled**'
        }`,
        inline: true,
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true,
      },
      {
        name: 'Loot Scale\n> `Only Needed If Random Items Is Enabled`',
        value:
          server.loot_scale != null
            ? `**${server.loot_scale.toString()}X**`
            : '**Not Set**',
        inline: false,
      },
      {
        name: 'Outpost\n> Example: `x,y,z`',
        value:
          server.outpost &&
          server.outpost.trim() !== '' &&
          server.outpost.includes(',')
            ? (() => {
                const [x, y, z] = server.outpost.split(',');
                return `**X:** \`${x}\`\n**Y:** \`${y}\`\n**Z:** \`${z}\``;
              })()
            : '**Not Set**',
        inline: true,
      },
      {
        name: 'Bandit Camp\n> Example: `x,y,z`',
        value:
          server.bandit &&
          server.bandit.trim() !== '' &&
          server.bandit.includes(',')
            ? (() => {
                const [x, y, z] = server.bandit.split(',');
                return `**X:** \`${x}\`\n**Y:** \`${y}\`\n**Z:** \`${z}\``;
              })()
            : '**Not Set**',
        inline: true,
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true,
      }, // Blank field
      {
        name: 'Hourly Kit Name',
        value:
          server.hourly_kit_name != null
            ? `\`${server.hourly_kit_name.toString()}\``
            : '**Not Set**',
        inline: true,
      },
      {
        name: 'VIP Kit Name',
        value:
          server.vip_kit_name != null
            ? `\`${server.vip_kit_name.toString()}\``
            : '**Not Set**',
        inline: true,
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true,
      }, // Blank field
      {
        name: 'Random Items',
        value: server.random_items != 1 ? '**Enabled**' : '**Disabled**',
        inline: true,
      },
      {
        name: 'Raid Alerts',
        value: `${
          server.rf_broadcasting == 1 ? '**Enabled**' : '**Disabled**'
        }`,
        inline: true,
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true,
      }, // Blank field
      {
        name: 'Linked Role',
        value: linked_role ? `<@&${linked_role.id}>` : '**Not Set**',
        inline: true,
      },
      {
        name: 'VIP Role',
        value: vip_role ? `<@&${vip_role.id}>` : '**Disabled**',
        inline: true,
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true,
      } // Blank field
    )
    .setTimestamp()
    .setFooter({
      text: process.env.EMBED_FOOTER_TEXT,
      iconURL: process.env.EMBED_LOGO,
    });
}
const valid_server_id = (serverId) =>
  typeof serverId === 'string' &&
  serverId.length === 7 &&
  [...serverId].every((char) => char >= '0' && char <= '9');
module.exports = {
  log,
  format_date,
  discord_log,
  send_embed,
  is_empty,
  format_hostname,
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
  get_server_discord,
  get_server_discord_identifier,
  handle_teleport,
  format_teleport_pos,
  get_player_info,
  get_record,
  set_record,
  handle_kit,
  handle_vip_kit,
  check_link,
  check_server_link,
  send_auto_messages,
  event_messages,
  server_status_messages,
  valid_server_id,
  get_servers_by_guild,
  delete_server,
  get_guild_servers,
  create_settings_embed,
};
