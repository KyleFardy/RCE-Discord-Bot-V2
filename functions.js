// Import the required modules and components
const client = require("./bot"); // Import the bot instance
const { MessageEmbed } = require("discord.js");

// Function to log messages with various types and formatting
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
        "custom": { prefix: "[CUSTOM]", emoji: "🔧", color: "\x1b[35m" }     // Purple color for custom logs
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

    // Calculate padding based on the length of the prefix
    const padding = ' '.repeat(Math.max(0, 15 - prefix.length)); // Adjust 15 as needed for your layout

    // Create the formatted log message with the timestamp, prefix, emoji, and color
    const formattedMessage = `\x1b[90m[${timestamp}]\x1b[0m ${color}${prefix}${padding}${emoji}\x1b[0m`;

    // Output the formatted log message followed by the additional arguments
    console.log(formattedMessage, ...args);
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
        console.error('Error sending embed:', error); // Log error if sending fails
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


    // Return the formatted hostname with the appropriate color code
    return colorCodes[hostname] || hostname; // If color code not found, return the hostname unchanged
}

module.exports = {
    log,
    format_date,
    discord_log,
    send_embed,
    is_empty,
    format_hostname
};