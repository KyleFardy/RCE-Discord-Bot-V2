const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    async execute(client) {
        try {
            start_random_items_interval(client);
        } catch (error) {
            await log_initialization_error(client, error);
        }
    },
};

async function start_random_items_interval(client) {
    setInterval(async () => {
        const servers = await client.rce.servers.getAll();
        servers.forEach(async server => {
            const current_server = await client.functions.get_server(client, server.identifier);
            if (current_server.random_items === 0) return;
            await client.functions.trigger_random_item(client, current_server, server.players);
        });
    }, 1 * 30 * 1000);
}

async function log_initialization_error(client, error) {
    await client.functions.log("error", `\x1b[34;1m[BOT]\x1b[0m Failed To Initialize Random Items: ${error.message}`, error);
}
