const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();
const fs = require('fs');
const { RCEManager, LogLevel } = require('rce.js');
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
            this.client.functions.log("success", "\x1b[32;1m[DATABASE]\x1b[0m Connection Established!");
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
                    this.client.functions.log('error', `[COMMANDS] Error Loading ${file}: ${error.message}`);
                }
            }
        }
    }

    // Load Discord events (e.g., message, guild join) from the filesystem
    async load_events() {
        this.load_event_folder("client", this.client);  // Load client (Discord) events
    }

    // Load RCE-related events from the filesystem
    async load_rce_events() {
        this.load_event_folder("rce", this.client.rce);  // Load RCE-specific events
    }

    // Helper method to load events from a specified folder
    load_event_folder(folderName, emitter) {
        const logType = folderName === 'rce' ? 'RCE EVENT' : 'DISCORD EVENT';  // Determine log type
        const eventFiles = fs.readdirSync(`./events/${folderName}`).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            try {
                const event = require(`./events/${folderName}/${file}`);
                this.client.functions.log("debug", `\x1b[32;1m[${logType}]\x1b[0m ${this.client.functions.get_event_name(event.name)} Event Loaded!`);

                // Register event with either 'once' or 'on' based on event type
                if (event.once) {
                    emitter.once(event.name, (...args) => event.execute(...args, emitter, this.client));
                } else {
                    emitter.on(event.name, (...args) => event.execute(...args, emitter, this.client));
                }
            } catch (error) {
                this.client.functions.log("error", `\x1b[32;1m[${logType}]\x1b[0m Failed To Load Event ${file}: ${error.message}`);
            }
        }
    }

    // Fetch server information from the database
    async fetch_servers() {
        try {
            const [rows] = await this.client.database_connection.execute("SELECT * FROM servers");  // Get all servers

            // Map the database rows to server properties
            this.client.servers = await Promise.all(rows.map(async row => ({
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
            })));

            this.client.functions.log("info", `\x1b[34;1m[BOT]\x1b[0m ${this.client.servers.length} Servers Successfully Fetched From The Database!`);
        } catch (error) {
            this.client.functions.log("error", "\x1b[34;1m[DATABASE]\x1b[0m Failed To Fetch Servers: " + error.message);
        }
    }

    // Register commands with Discord's API
    async register_commands() {
        const rest = new REST().setToken(process.env.TOKEN);  // Set up REST client
        this.client.functions.log("info", "\x1b[34;1m[BOT]\x1b[0m Registering Commands...");
        try {
            // Register commands for the specific guild
            await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
                body: Array.from(this.client.commands.values()).map(cmd => cmd.data.toJSON())
            });
            this.client.functions.log("debug", "\x1b[32;1m[COMMANDS]\x1b[0m Successfully Registered!");
        } catch (error) {
            this.client.functions.log("error", "\x1b[34;1m[BOT]\x1b[0m Error Registering Commands: " + error);
        }
    }

    // Main entry point to start the bot
    async start() {
        this.client.functions.log("info", "\x1b[34;1m[BOT]\x1b[0m Starting The Bot...");

        // Load commands and events
        this.load_commands();
        try {
            await this.fetch_servers();  // Fetch server information from database

            // Initialize RCE manager with server details
            this.client.rce = new RCEManager({
                email: process.env.GPORTAL_EMAIL,
                password: process.env.GPORTAL_PASSWORD,
                servers: this.client.servers,
            }, {
                logLevel: LogLevel.Info
            });
            await this.client.rce.init();  // Initialize RCE connection

            // Load Discord and RCE events
            await this.load_events();
            await this.load_rce_events();

            await this.client.login(process.env.TOKEN);  // Log in to Discord
            await this.register_commands();  // Register commands
        } catch (error) {
            this.client.functions.log("error", "\x1b[34;1m[BOT]\x1b[0m Error During Start: " + error.message);
        }
    }
}

module.exports = rce_bot;
