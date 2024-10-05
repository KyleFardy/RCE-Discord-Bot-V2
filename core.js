// Import necessary modules from discord.js and other libraries
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config(); // Load environment variables from .env file
const fs = require('fs'); // File system module for reading files
const path = require('path'); // Module for handling file paths
const { RCEManager, LogLevel, RCEEvent } = require("rce.js"); // RCE Manager for game server management
const STATS = require("./database.js");
const { createPool } = require('mysql2/promise');
const commands = [];
class RCE_BOT {
    constructor() {
        this.client = new Client({ 
            messageCacheLifetime: 60000,
            fetchAllMembers: true,
            messageCacheMaxSize: 10000,
            restTimeOffset: 0,
            restWsBridgetimeout: 100,
            shards: "auto",
            allowedMentions: {
                parse: ["roles", "users", "everyone"],
                repliedUser: true,
            },
            partials: ["MESSAGE", "CHANNEL", "REACTION"],
            intents: 32767,
        });
        this.client.functions = require("./functions.js");
        this.client.servers = require("./servers.json");
        this.client.rce = new RCEManager({
            email: process.env.GPORTAL_EMAIL,
            password: process.env.GPORTAL_PASSWORD,
            servers: this.client.servers, // Load servers from the JSON file
        }, {
            logLevel: LogLevel.None, // Set log level for RCE actions (adjust as needed)
            logFile: "rce.log" // Specify the log file for RCE actions
        });
        this.client.auto_messages = require("./auto_messages.json");
        this.client.commands = new Collection(); // Map to store command functions
        this.client.server_information = new Map(); // Map to store server information
        this.client.events = new Collection();
        this.init_database();
        this.client.player_stats = new STATS(this.client);
    }

    async init_database() {
        try {
            const dbPool = createPool({
                host: process.env.DATABASE_HOST,
                user: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
            });
            this.client.database_connection = dbPool;

            // Log success
            this.client.functions.log("debug", "Database Connection Established!");
        } catch (err) {
            this.client.functions.log("error", "Database Connection Failed!", err);
        }
    }
    // Load commands dynamically from the 'commands' folder
    load_commands() {
        for (const folder of fs.readdirSync("./commands")) {
            for (const file of fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'))) {
                const command = require(`./commands/${folder}/${file}`);

                if (command.data.name) {
                    this.client.commands.set(command.data.name, command);
                    commands.push(command.data.toJSON());
                    this.client.functions.log("debug", `[COMMANDS] ${command.data.name} Command Loaded!`);
                } else {
                    this.client.functions.log("error", `[COMMANDS] ${file} Command Failed To Load!`);
                    continue;
                }

            }
        }
    }

    // Load events dynamically from the 'events' folder
    async load_events() {
        const event_types = {
            client: this.client,
            rce: this.client.rce,
        };
        for (const folder of fs.readdirSync("./events")) {
            if (!event_types[folder]) continue; // Skip folders not defined in event_types
            const emitter = event_types[folder]; // Dynamically get the correct event emitter
            const logType = folder === 'rce' ? 'RCE EVENT' : 'DISCORD EVENT'; // Determine log type
            for (const file of fs.readdirSync(`./events/${folder}`).filter(file => file.endsWith('.js'))) {
                try {
                    const event = require(`./events/${folder}/${file}`);
                    this.client.functions.log("debug", `[${logType}] ${this.client.functions.get_event_name(event.name)} Event Loaded!`);

                    // Register the event (either 'once' or 'on')
                    if (event.once) {
                        emitter.once(event.name, (...args) => event.execute(...args, emitter, this.client));
                    } else {
                        emitter.on(event.name, (...args) => event.execute(...args, emitter, this.client));
                    }
                } catch (error) {
                    this.client.functions.log("error", `[${logType}] Failed To Load Event ${file} From Folder ${folder}: ${error.message}`);
                }
            }
        }
    }
    // Register commands with Discord API
    async register_commands() {
        const rest = new REST().setToken(process.env.TOKEN);
        this.client.functions.log("info", "Registering Commands...");
        try {
            await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
                body: Array.from(this.client.commands.values()).map(cmd => cmd.data.toJSON()) // Use this.client.commands directly
            });
        } catch (error) {
            this.client.functions.log("error", "Error Registering Commands: " + error);
        }
    }


    // Start the bot by loading events, commands, and logging in
    async start() {
        this.client.functions.log("info", "Starting The Bot...");
        this.load_commands();
        this.load_events();
        try {
            await this.register_commands();
            this.client.functions.log("info", "Successfully Registered Application Commands!");
            await this.client.login(process.env.TOKEN);
        } catch (error) {
            this.client.functions.log("error", "Error During Start: " + error);
        }

        this.client.login(process.env.TOKEN);
    }
}
module.exports = RCE_BOT;