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

// Export the event start handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.EventStart,

    // Asynchronous function to execute when an event starts
    async execute(data, rce, client) {
        // Retrieve the message associated with the event type
        const message = eventMessages[data.event];

        // Check if a message exists for the event
        if (message) {
            // Send the event message to the specified server
            await rce.sendCommand(data.server.identifier, `global.say ${message}`);
        } else {
            // Log an error if the event type is unrecognized
            await client.functions.logger("error", `Unrecognized Event: ${data.event}`);
        }
    }
};
