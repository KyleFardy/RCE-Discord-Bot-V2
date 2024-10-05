const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();
const fs = require('fs');
const { RCEManager, LogLevel } = require("rce.js");
const STATS = require("./database.js");
const { createPool } = require('mysql2/promise');

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
            servers: this.client.servers,
        }, {
            logLevel: LogLevel.None,
            logFile: "rce.log"
        });
        this.client.auto_messages = require("./auto_messages.json");
        this.client.commands = new Collection();
        this.client.server_information = new Map();
        this.client.events = new Collection();
        this.init_database();
        this.client.player_stats = new STATS(this.client);
    }

    async init_database() {
        try {
            this.client.database_connection = createPool({
                host: process.env.DATABASE_HOST,
                user: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
            });
            this.client.functions.log("info", "\x1b[32;1m[DATABASE]\x1b[0m Connection Established!");
        } catch (err) {
            this.client.functions.log("error", "\x1b[32;1m[DATABASE]\x1b[0m Connection Failed!", err);
        }
    }

    load_commands() {
        for (const folder of fs.readdirSync("./commands")) {
            for (const file of fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'))) {
                const command = require(`./commands/${folder}/${file}`);
                if (command.data.name) {
                    this.client.commands.set(command.data.name, command);
                    this.client.functions.log("info", `\x1b[32;1m[COMMANDS]\x1b[0m ${command.data.name} Command Loaded!`);
                } else {
                    this.client.functions.log("error", `\x1b[32;1m[COMMANDS]\x1b[0m ${file} Command Failed To Load!`);
                    continue;
                }
            }
        }
    }

    async load_events() {
        const event_types = {
            client: this.client,
            rce: this.client.rce,
        };
        for (const folder of fs.readdirSync("./events")) {
            if (!event_types[folder]) continue;
            const emitter = event_types[folder];
            const logType = folder === 'rce' ? 'RCE EVENT' : 'DISCORD EVENT';
            for (const file of fs.readdirSync(`./events/${folder}`).filter(file => file.endsWith('.js'))) {
                try {
                    const event = require(`./events/${folder}/${file}`);
                    this.client.functions.log("info", `\x1b[32;1m[${logType}]\x1b[0m ${this.client.functions.get_event_name(event.name)} Event Loaded!`);

                    if (event.once) {
                        emitter.once(event.name, (...args) => event.execute(...args, emitter, this.client));
                    } else {
                        emitter.on(event.name, (...args) => event.execute(...args, emitter, this.client));
                    }
                } catch (error) {
                    this.client.functions.log("error", `\x1b[32;1m[${logType}]\x1b[0m Failed To Load Event ${file} From Folder ${folder}: ${error.message}`);
                }
            }
        }
    }

    async register_commands() {
        const rest = new REST().setToken(process.env.TOKEN);
        this.client.functions.log("info", "\x1b[34;1m[BOT]\x1b[0m Registering Commands...");
        try {
            await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
                body: Array.from(this.client.commands.values()).map(cmd => cmd.data.toJSON())
            });
            this.client.functions.log("info", "\x1b[32;1m[COMMANDS]\x1b[0m Successfully Registered!");
        } catch (error) {
            this.client.functions.log("error", "\x1b[34;1m[BOT]\x1b[0m Error Registering Commands: " + error);
        }
    }

    async start() {
        this.client.functions.log("info", "\x1b[34;1m[BOT]\x1b[0m Starting The Bot...");
        this.load_commands();
        await this.load_events(); // Ensure events are loaded before registration

        try {
            await this.register_commands();
            await this.client.login(process.env.TOKEN);
        } catch (error) {
            this.client.functions.log("error", "\x1b[34;1m[BOT]\x1b[0m Error During Start: " + error);
        }
    }
}

module.exports = RCE_BOT;
