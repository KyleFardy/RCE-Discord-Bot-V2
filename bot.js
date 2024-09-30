// Import necessary modules from discord.js and other libraries
const { Client, GatewayIntentBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config(); // Load environment variables from .env file
const fs = require('fs'); // File system module for reading files
const path = require('path'); // Module for handling file paths
const { RCEManager, LogLevel, RCEEvent } = require("rce.js"); // RCE Manager for game server management

// Load server configuration from servers.json
const serverConfigPath = path.join(__dirname, 'servers.json'); // Define the path to servers.json
let servers; // Variable to store server configurations

// Attempt to read and parse the servers.json file
try {
    const data = fs.readFileSync(serverConfigPath); // Read the file synchronously
    servers = JSON.parse(data); // Parse JSON data into a JavaScript object
} catch (error) {
    console.error("Error reading servers.json:", error); // Log error if file reading fails
    process.exit(1); // Exit the application if server configuration cannot be loaded
}

// Create a new Discord client instance with specified intents
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Map(); // Map to store command functions
client.server_information = new Map(); // Map to store server information
client.RCEEvent = RCEEvent; // Reference to RCE events

// Initialize RCE Manager with provided email, password, and servers
client.rce = new RCEManager({
    email: process.env.GPORTAL_EMAIL,
    password: process.env.GPORTAL_PASSWORD,
    servers: servers, // Load servers from the JSON file
}, {
    logLevel: LogLevel.None, // Set log level for RCE actions (adjust as needed)
    logFile: "rce.log" // Specify the log file for RCE actions
});

// Load utility functions from functions.js
client.functions = require("./functions.js");

// Load command files from the 'commands' directory
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`); // Require each command file
    client.commands.set(command.name, command); // Store command in the map
}

// Load event files from the 'events' directory
const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`); // Require each event file
    client.on(event.name, (...args) => event.execute(...args, client)); // Register event listener
}

// Load RCE event files from the 'rce_events' directory
const rceEventFiles = fs.readdirSync(path.join(__dirname, 'rce_events')).filter(file => file.endsWith('.js'));
for (const file of rceEventFiles) {
    const event = require(`./rce_events/${file}`); // Require each RCE event file
    client.rce.on(event.name, (...args) => event.execute(...args, client.rce, client)); // Register RCE event listener
}

// Prepare the commands for registration with Discord API
const commands = Array.from(client.commands.values()).map(cmd => ({
    name: cmd.name, // Command name
    description: cmd.description, // Command description
}));

// Initialize REST client for Discord API interaction
const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

// Async IIFE to refresh application commands in the specified guild
(async () => {
    try {
        client.functions.log("info", 'Started Refreshing Application Commands!'); // Log the start of command refreshing

        // Register application commands with Discord API
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
            body: commands,
        });

        client.functions.log("info", 'Successfully Reloaded Application Commands!'); // Log success message
    } catch (error) {
        client.functions.log("error", error); // Log any errors encountered during command refreshing
    }
})();

// Log in to Discord with the bot token
client.login(process.env.TOKEN);
