const { Events } = require('discord.js');
const shown_message = {};

module.exports = {
    name: Events.ClientReady,
    async execute(client) {
        try {
            // Initialize RCE
            await client.rce.init();

            // Log a message indicating successful login
            await client.functions.log("info", `Logged In As ${client.user.tag}!`);

            await new Promise(resolve => setTimeout(resolve, 2000));

            const servers = await client.rce.getServers();
            for (const [identifier, server] of servers) {
                try {
                    const serverResponse = await client.rce.sendCommand(identifier, "serverinfo", true);
                    if (!shown_message[identifier]) {
                        let serverData;

                        try {
                            // Attempt to parse the server response as JSON
                            serverData = JSON.parse(serverResponse.trim());
                        } catch (error) {
                            // If parsing fails, clean the response and try again
                            serverData = JSON.parse(serverResponse.trim().replace(/\\n/g, "").replace(/\\/g, ""));
                        }

                        // Store the parsed server information in the client's server information object
                        client.server_information[identifier] = {
                            Hostname: await client.functions.format_hostname(serverData.Hostname),
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
                        await client.functions.log("success", `Successfully Connected To ${client.server_information[identifier].Hostname}`);

                        // Mark that a message has been shown for this server
                        shown_message[identifier] = true; // No need to await here, it's a simple assignment
                    }

                } catch (error) {
                    // Log an error message if there is an issue with parsing the server data
                    await client.functions.log("error", `Failed To Parse Server Data for ${servidentifierer}: ${error.message}`);
                }
            }
        } catch (error) {
            // Log an error message if initialization fails
            await client.functions.log("error", `Failed To Initialize: ${error.message}`);

            // Exit the process with a non-zero status to indicate failure
            process.exit(1);
        }
    },
};
