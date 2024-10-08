const { Events } = require('discord.js');
const { RCEManager, LogLevel } = require("rce.js");

const shown_message = {};

module.exports = {
    name: Events.ClientReady,
    async execute(client) {
        try {
            await log_successful_login(client);
            await new Promise(resolve => setTimeout(resolve, 2000));
            await initialize_servers(client);
            await update_auto_messages(client);
            setInterval(() => {
                update_presence(client).catch(console.error); // Log any errors
            }, 60000);

            // Initial call to set the presence immediately
            update_presence(client).catch(console.error);
        } catch (error) {
            await log_initialization_error(client, error);
        }
    },
};

async function log_successful_login(client) {
    await client.functions.log("info", `\x1b[34;1m[BOT]\x1b[0m Logged In As ${client.user.tag}!`);
}

async function initialize_servers(client) {
    const servers = await client.rce.getServers();

    for (const [identifier, server] of servers) {
        if (!server.ready) continue; // Skip if server is not ready and continue to the next one

        try {
            const server_response = await client.rce.sendCommand(identifier, "serverinfo", true);
            let server_data;

            // Try parsing the server response with basic and fallback methods
            try {
                server_data = JSON.parse(server_response.trim());
            } catch (error) {
                // Handle escaped newlines and backslashes in the server response
                server_data = JSON.parse(server_response.trim().replace(/\\n/g, "").replace(/\\/g, ""));
            }

            if (!shown_message[identifier]) {
                await client.functions.log("success", `\x1b[32;1m[${identifier}]\x1b[0m Successfully Connected To ${await client.functions.format_hostname(server_data.Hostname) }`);
                shown_message[identifier] = true;
            }
        } catch (error) {
            // Log an error message if parsing or command execution fails
            await client.functions.log("error", `\x1b[32;1m[${identifier}]\x1b[0m Failed To Parse Server Data: ${error.message}`);
        }
    }
}


async function update_auto_messages(client) {
    if (client.auto_messages.enabled) {
        const servers = await client.rce.getServers();
        servers.forEach(async server => {
            if (!server.ready) return;

            await client.functions.send_auto_messages(client, server);
        });
    }
}

async function update_presence(client) {
    const players = await client.functions.get_count(client, 'SELECT COUNT(*) as count FROM players');
    const servers = await client.rce.getServers();

    await client.user.setPresence({
        activities: [
            {
                name: 'Rust: Console Edition',
                type: 0, // ActivityType
                state: `Watching ${servers.size} Servers With ${players} Players`,
                largeImage: 'rce',
                smallImage: 'rce',
                buttons: [
                    { label: 'Github', url: 'https://github.com/KyleFardy/RCE-Discord-Bot-V2' },
                    { label: 'Discord', url: 'https://discord.void-dev.co/' },
                ],
            },
        ],
        status: 'online',
    });
}

async function log_initialization_error(client, error) {
    await client.functions.log("error", `\x1b[34;1m[BOT]\x1b[0m Failed To Initialize: ${error.message}`, error);
}
