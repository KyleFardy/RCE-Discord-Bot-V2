// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Object to track if the message has been shown for each server
const shown_message = {};

// Export the player list update event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.PlayerListUpdate,

    // Asynchronous function to execute when the player list is updated
    async execute(data, rce, client) {
        // Send a command to retrieve server information
        const serverResponse = await rce.sendCommand(data.server.identifier, "serverinfo", true);

        try {
            // Check if a message has already been shown for this server
            if (!shown_message[data.server.identifier]) {
                let serverData;

                try {
                    // Attempt to parse the server response as JSON
                    serverData = JSON.parse(serverResponse.trim());
                } catch (error) {
                    // If parsing fails, clean the response and try again
                    const cleanedResponse = serverResponse.replace(/\\n/g, "").replace(/\\/g, "");
                    serverData = JSON.parse(cleanedResponse.trim());
                }

                // Store the parsed server information in the client's server information object
                client.server_information[data.server.identifier] = {
                    Hostname: client.functions.format_hostname(serverData.Hostname),
                    MaxPlayers: serverData.MaxPlayers,
                    Players: serverData.Players,
                    Queued: serverData.Queued,
                    Joining: serverData.Joining,
                    EntityCount: serverData.EntityCount,
                    GameTime: serverData.GameTime,
                    Uptime: serverData.Uptime,
                    Map: serverData.Map,
                    Framerate: serverData.Framerate,
                    Memory: serverData.Memory,
                    Collections: serverData.Collections,
                    NetworkIn: serverData.NetworkIn,
                    NetworkOut: serverData.NetworkOut,
                    Restarting: serverData.Restarting,
                    SaveCreatedTime: serverData.SaveCreatedTime,
                };

                // Log a message indicating successful connection to the server
                await client.functions.log("SERVER INFO", `Connected To ${client.server_information[data.server.identifier].Hostname}!`);

                // Mark that a message has been shown for this server
                shown_message[data.server.identifier] = true;
            }

        } catch (error) {
            // Log an error message if there is an issue with parsing the server data
            await client.functions.log("error", "Failed To Parse Server Data:", error);
        }
    }
};
