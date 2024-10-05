const { Events } = require('discord.js');
const shown_message = {};

module.exports = {
    name: Events.ClientReady,
    async execute(client) {
        try {
            // Initialize RCE
            await client.rce.init();

            // Log a message indicating successful login
            await client.functions.log("info", `\x1b[34;1m[BOT]\x1b[0m Logged In As ${client.user.tag}!`);

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
                        await client.functions.log("success", `\x1b[32;1m[${identifier}]\x1b[0m Successfully Connected To ${client.server_information[identifier].Hostname}`);

                        // Mark that a message has been shown for this server
                        shown_message[identifier] = true; // No need to await here, it's a simple assignment
                    }

                } catch (error) {
                    // Log an error message if there is an issue with parsing the server data
                    await client.functions.log("error", `\x1b[32;1m[${identifier}]\x1b[0m Failed To Parse Server Data: ${error.message}`);
                }
            }
            const players = await client.functions.get_count(client, 'SELECT COUNT(*) as count FROM players');
            await client.user.setPresence({
                activities: [
                    {
                        name: 'Rust: Console Edition', // Game name
                        type: 0, // ActivityType (0 - Playing, 1 - Streaming, 2 - Listening, 3 - Watching)
                        state: `Watching Over ${servers.size} Servers With ${players} Players`, // The current state of the game
                        largeImage: 'rce', // Key for the large image (must be uploaded on Discord Developer Portal)
                        smallImage: 'rce', // Key for the small image (must be uploaded on Discord Developer Portal)
                        buttons: [
                            { label: 'Github', url: 'https://github.com/KyleFardy/RCE-Discord-Bot-V2' },
                            { label: 'Discord', url: 'https://discord.void-dev.co/' },
                        ],
                    },
                ],
                status: 'online', // Status of the user
            });
            
        } catch (error) {
            // Log an error message if initialization fails
            await client.functions.log("error", `\x1b[34;1m[BOT]\x1b[0m Failed To Initialize: ${error.message}`, error);

            // Exit the process with a non-zero status to indicate failure
            process.exit(1);
        }
    },
};
