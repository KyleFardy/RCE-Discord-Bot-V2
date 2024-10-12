const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const { RCEManager, LogLevel, RCEIntent } = require("rce.js");
const stats = require('./database.js');
const { createPool } = require('mysql2/promise');

class rce_bot {
    constructor() {
        // Initialize Discord client with various settings and intents
        this.client = new Client({
            messageCacheLifetime: 60000,  // Set message cache duration
            fetchAllMembers: true,  // Fetch all members on startup
            messageCacheMaxSize: 10000,  // Limit message cache size
            restTimeOffset: 0,  // Time offset for API requests
            restWsBridgetimeout: 100,  // Timeout for websocket connection
            shards: "auto",  // Auto-detect number of shards
            allowedMentions: {  // Control who gets mentioned in responses
                parse: ["roles", "users", "everyone"],
                repliedUser: true,
            },
            partials: ["MESSAGE", "CHANNEL", "REACTION"],  // Enable partial data caching
            intents: 32767,  // Enable all intents
        });

        // Set up custom properties for the bot
        this.client.functions = require("./functions.js");  // Load utility functions
        this.load_items();  // Load in-game items
        this.client.auto_messages = require("./auto_messages.json");  // Load auto-messages
        this.client.commands = new Collection();  // Initialize command collection
        this.client.server_information = new Map();  // Server info storage
        this.client.events = new Collection();  // Event handlers collection
        this.init_database();  // Initialize database connection
        this.client.player_stats = new stats(this.client);  // Load player stats logic
    }

    // Load items using a helper function
    async load_items() {
        try {
            this.client.items = await this.client.functions.load_items(this.client);
        } catch (err) {
            this.client.functions.log('error', `[ITEMS] Failed To Load Items: ${err.message}`);
        }
    }

    // Set up the database connection
    async init_database() {
        try {
            // Create MySQL connection pool using environment variables
            this.client.database_connection = createPool({
                host: process.env.DATABASE_HOST,
                user: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
            });
            this.client.functions.log("debug", "\x1b[32;1m[DATABASE]\x1b[0m Connection Established!");
        } catch (err) {
            this.client.functions.log("error", "\x1b[32;1m[DATABASE]\x1b[0m Connection Failed!", err);
        }
    }

    // Load and register commands dynamically from the file system
    load_commands() {
        const command_folders = fs.readdirSync("./commands");  // Get command folders
        for (const folder of command_folders) {
            const command_files = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
            for (const file of command_files) {
                try {
                    const command = require(`./commands/${folder}/${file}`);
                    if (command.data && command.data.name) {
                        this.client.commands.set(command.data.name, command);  // Add command to collection
                        this.client.functions.log("debug", `\x1b[32;1m[COMMANDS]\x1b[0m ${command.data.name} Command Loaded!`);
                    } else {
                        this.client.functions.log("error", `\x1b[32;1m[COMMANDS]\x1b[0m ${file} Command Failed To Load!`);
                    }
                } catch (error) {
                    this.client.functions.log('error', `[COMMANDS] Error Loading ${file}: ${error}`);
                }
            }
        }
    }

    // Load RCE-related events from the filesystem
    async load_rce_events() {
        const eventFiles = fs.readdirSync(`./events/rce`).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            try {
                const event = require(`./events/rce/${file}`);
                this.client.functions.log("debug", `\x1b[32;1m[RCE EVENT]\x1b[0m ${this.client.functions.get_event_name(event.name)} Event Loaded!`);

                // Register event with either 'once' or 'on' based on event type
                if (event.once) {
                    this.client.rce.events.once(event.name, (...args) => event.execute(...args, this.client.rce.events, this.client));
                } else {
                    this.client.rce.events.on(event.name, (...args) => event.execute(...args, this.client.rce.events, this.client));
                }
            } catch (error) {
                this.client.functions.log("error", `\x1b[32;1m[RCE EVENT]\x1b[0m Failed To Load Event ${file}: ${error.message}`);
            }
        }
    }

    // Load Discord events (e.g., message, guild join) from the filesystem
    async load_events() {
        this.client.functions.log("debug", "\x1b[34;1m[BOT]\x1b[0m Loading Events...");
        const eventFiles = fs.readdirSync(`./events/client`).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            try {
                const event = require(`./events/client/${file}`);
                this.client.functions.log("debug", `\x1b[32;1m[DISCORD EVENT]\x1b[0m ${this.client.functions.get_event_name(event.name)} Event Loaded!`);

                // Register event with either 'once' or 'on' based on event type
                if (event.once) {
                    this.client.once(event.name, (...args) => event.execute(...args, this.client, this.client));
                } else {
                    this.client.on(event.name, (...args) => event.execute(...args, this.client, this.client));
                }
            } catch (error) {
                this.client.functions.log("error", `\x1b[32;1m[DISCORD EVENT]\x1b[0m Failed To Load Event ${file}: ${error.message}`);
            }
        }
    }

    // Fetch server information from the database
    async fetch_servers() {
        try {
            const [rows] = await this.client.database_connection.execute("SELECT * FROM servers");  // Get all servers

            this.client.servers = (await Promise.all(rows.map(async row => {
                if (!row.enabled) return null;  // Return null for disabled servers
                await this.client.rce.servers.add({
                    identifier: row.identifier, // A Unique Name For your Server To Be Recognised By
                    region: row.region, // It's Either EU or US
                    serverId: row.server_id, // Find This In The URL On Your Server Page
                    intents: [RCEIntent.All], // Specify Which WebSocket Subscriptions To Use
                    playerRefreshing: true, // Enable Playerlist Caching
                    radioRefreshing: true, // Enable RF Events
                    extendedEventRefreshing: true, // Enable Bradley / Heli Events
                });
                return {
                    identifier: row.identifier,
                    serverId: row.server_id,
                    region: row.region,
                    refreshPlayers: row.refresh_players,
                    rfBroadcasting: row.rf_broadcasting,
                    bradFeeds: row.bradley_feeds,
                    heliFeeds: row.heli_feeds,
                    random_items: row.random_items,
                    owner: row.guild_owner,
                    guild: row.guild_id,
                    category_id: row.category_id,
                    linked_role_id: row.linked_role_id,
                    link_channel_id: row.link_channel_id,
                    kill_feeds_channel_id: row.kill_feeds_channel_id,
                    events_channel_id: row.events_channel_id,
                    stats_channel_id: row.stats_channel_id,
                    chat_logs_channel_id: row.chat_logs_channel_id,
                    item_spawning_channel_id: row.item_spawning_channel_id,
                    kits_logs_channel_id: row.kits_logs_channel_id,
                    team_logs_channel_id: row.team_logs_channel_id,
                    teleport_logs_channel_id: row.teleport_logs_channel_id,
                    shop_channel_id: row.shop_channel_id,
                    settings_channel_id: row.settings_channel_id,
                    npc_kill_points: row.npc_kill_points,
                    npc_death_points: row.npc_death_points,
                    player_kill_points: row.player_kill_points,
                    player_death_points: row.player_death_points,
                    suicide_points: row.suicide_points,
                    outpost: row.outpost,
                    bandit: row.bandit,
                    loot_scale: row.loot_scale,
                    hourly_kit_name: row.hourly_kit_name,
                    vip_kit_name: row.vip_kit_name,
                    vip_role_id: row.vip_role_id,
                    enabled: row.enabled,
                };
            }))).filter(server => server !== null);  // Filter out null results
            this.client.functions.log("debug", `\x1b[34;1m[BOT]\x1b[0m ${this.client.servers.length} Servers Successfully Fetched From The Database!`);
        } catch (error) {
            this.client.functions.log("error", "\x1b[34;1m[BOT]\x1b[0m Error Fetching Servers: " + error.message);
        }
    }

    // Start the bot, initializing necessary components and logging in
    async start() {
        this.client.functions.log("info", "\x1b[34;1m[BOT]\x1b[0m Starting The Bot...");

        // Load commands first
        this.load_commands();

        try {
            // Initialize RCE manager with server details
            this.client.rce = new RCEManager();
            await this.client.rce.init({ username: process.env.GPORTAL_EMAIL, password: process.env.GPORTAL_PASSWORD }, { level: LogLevel.Info });

            // Fetch server information from the database
            await this.fetch_servers();

            // Load Discord and RCE events
            await this.load_events();
            await this.load_rce_events();

            await this.client.login(process.env.TOKEN);  // Log in to Discord
            await this.register_commands();  // Register commands
        } catch (error) {
            this.client.functions.log("error", "\x1b[34;1m[BOT]\x1b[0m Error During Start: " + error.message);
        }
    }

    // Register commands with Discord's REST API
    async register_commands() {
        const commands = Array.from(this.client.commands.values()).map(command => command.data.toJSON());
        const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
        try {
            await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
            this.client.functions.log("debug", "\x1b[32;1m[COMMANDS]\x1b[0m Registered Commands With Discord API!");
        } catch (error) {
            this.client.functions.log("error", "\x1b[32;1m[COMMANDS]\x1b[0m Failed To Register Commands: " + error.message);
        }
    }
}
module.exports = rce_bot;