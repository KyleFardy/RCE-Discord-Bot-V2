// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Define structured messages for various events
const eventMessages = {
    "Airdrop": {
        formatted: "<color=green>[EVENT]</color> An <b>Air Drop</b> Is Falling From The Sky, Can You Find It?",
        discord: {
            title: "An Airdrop Is Inbound",
            message: "An **Air Drop** Is Falling From The Sky, Can You Find It?",
            image: "https://i.ibb.co/dKVrgmj/supply-drop.png"
        },
        console: "An Air Drop Is Falling From The Sky, Can You Find It?"
    },
    "Cargo Ship": {
        formatted: "<color=green>[EVENT]</color> <b>Cargo Ship</b> Is Sailing The Seas Around The Island, Ready To Board?",
        discord: {
            title: "Cargo Ship Is Sailing",
            message: "The **Cargo Ship** Is Sailing The Seas Around The Island!",
            image: "https://i.ibb.co/zFjhDd7/cargo-ship-scientist.png"
        },
        console: "Cargo Ship Is Sailing The Seas Around The Island, Ready To Board?"
    },
    "Chinook": {
        formatted: "<color=green>[EVENT]</color> Chinook Is Looking For A Monument To Drop A Crate!",
        discord: {
            title: "Locked Crate Incoming",
            message: "**Chinook** Is Looking For A Monument To Drop A Crate!",
            image: "https://i.ibb.co/jyN7nht/codelockedhackablecrate.png"
        },
        console: "Chinook Is Looking For A Monument To Drop A Crate!"
    },
    "Patrol Helicopter": {
        formatted: "<color=green>[EVENT]</color> A <b>Patrol Helicopter</b> Is Circling The Map, Ready To Take It Down?",
        discord: {
            title: "Get That L9",
            message: "A **Patrol Helicopter** Is Circling The Map, Ready To Take It Down?",
            image: "https://i.ibb.co/z84qH5G/helicopter.png"
        },
        console: "A Patrol Helicopter Is Circling The Map, Ready To Take It Down?"
    },
    "Halloween": {
        formatted: "<color=green>[SPECIAL EVENT]</color> A Halloween Event Has Started!",
        discord: {
            title: "Spooky Spooky",
            message: "A **Halloween** Event Has Started!",
            image: "https://i.ibb.co/pr609gm/halloween.png"
        },
        console: "A Halloween Event Has Started!"
    },
    "Christmas": {
        formatted: "<color=green>[SPECIAL EVENT]</color> A Christmas Event Has Started!",
        discord: {
            title: "Merry Christmas",
            message: "A **Christmas** Event Has Started!",
            image: "https://i.ibb.co/xLDqqst/christmas.png"
        },
        console: "A Christmas Event Has Started!"
    },
    "Easter": {
        formatted: "<color=green>[SPECIAL EVENT]</color> An Easter Event Has Started!",
        discord: {
            title: "Eggs Incoming",
            message: "An **Easter** Event Has Started!",
            image: "https://i.ibb.co/zf27jLd/easter.png"
        },
        console: "An Easter Event Has Started!"
    },
};

// Export the event start handler module
module.exports = {
    name: RCEEvent.EventStart,

    async execute(data, rce, client) {
        // Retrieve event details from the structured messages
        const eventDetails = eventMessages[data.event];

        // Check if a message exists for the event
        if (eventDetails) {
            const { formatted, discord, console: consoleMessage } = eventDetails;

            // Construct the log message
            const eventStartedMessage = `\x1b[38;5;208m[${data.server.identifier}]\x1b[0m \x1b[32m\x1b[1m[EVENT]\x1b[0m ${consoleMessage}`;

            // Log the event start message
            await client.functions.log("info", eventStartedMessage);

            // Send the event message to the specified server
            await rce.sendCommand(data.server.identifier, `global.say ${formatted}`);

            // Check if logging to Discord is enabled
            if (process.env.EVENTS_LOG === 'true' && !client.functions.is_empty(process.env.EVENTS_CHANNEL)) {
                try {
                    await client.functions.send_embed(client, process.env.EVENTS_CHANNEL, discord.title, discord.message, [], discord.image);
                } catch (error) {
                    await client.functions.log("error", 'Failed To Send Event Embed:', error);
                }
            }
        } else {
            // Log an error if the event type is unrecognized
            await client.functions.log("error", `Unrecognized Event: ${data.event}`);
        }
    }
};
