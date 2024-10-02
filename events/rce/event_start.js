// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Define messages for various events with appropriate formatting
const eventMessages = {
    "Airdrop": "<color=green>[EVENT]</color> An <b>Air Drop</b> Is Falling From The Sky, Can You Find It?",
    "Cargo Ship": "<color=green>[EVENT]</color> <b>Cargo Ship</b> Is Sailing The Seas Around The Island, Ready To Board?",
    "Chinook": "<color=green>[EVENT]</color> Chinook Is Looking For A Monument To Drop A Crate!",
    "Patrol Helicopter": "<color=green>[EVENT]</color> A <b>Patrol Helicopter</b> Is Circling The Map, Ready To Take It Down?",
    "Halloween": "<color=green>[SPECIAL EVENT]</color> A Halloween Event Has Started!",
    "Christmas": "<color=green>[SPECIAL EVENT]</color> A Christmas Event Has Started!",
    "Easter": "<color=green>[SPECIAL EVENT]</color> An Easter Event Has Started!",
};
const eventMessagesConsole = {
    "Airdrop": "An Air Drop Is Falling From The Sky, Can You Find It?",
    "Cargo Ship": "Cargo Ship Is Sailing The Seas Around The Island, Ready To Board?",
    "Chinook": "Chinook Is Looking For A Monument To Drop A Crate!",
    "Patrol Helicopter": "A Patrol Helicopter Is Circling The Map, Ready To Take It Down?",
    "Halloween": "A Halloween Event Has Started!",
    "Christmas": "A Christmas Event Has Started!",
    "Easter": "An Easter Event Has Started!",
};

// Export the event start handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.EventStart,

    // Asynchronous function to execute when an event starts
    async execute(data, rce, client) {
        // Retrieve the message associated with the event type
        const message = eventMessages[data.event];
        const consoleMessage = eventMessagesConsole[data.event];

        // Check if a message exists for the event
        if (message) {
            // Construct the log message using the level and content from the data
            const eventStartedMessage = `[${data.server.identifier}] [EVENT] ${consoleMessage}`;

            // Log the message with the specified level (info, warning, error, etc.)
            await client.functions.log("info", eventStartedMessage);

            // Send the event message to the specified server
            await rce.sendCommand(data.server.identifier, `global.say ${message}`);
        } else {
            // Log an error if the event type is unrecognized
            await client.functions.logger("error", `Unrecognized Event: ${data.event}`);
        }
    }
};
