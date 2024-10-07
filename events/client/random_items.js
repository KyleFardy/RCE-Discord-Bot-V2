const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    async execute(client) {
        try {
            if (process.env.RANDOM_ITEMS === "true") {
                start_random_items_interval(client);
            }
        } catch (error) {
            await log_initialization_error(client, error);
        }
    },
};

function start_random_items_interval(client) {
    setInterval(async () => {
        const servers = await client.rce.getServers();
        servers.forEach(async server => {
            if (!server.ready) return;

            const is_enabled = await client.functions.get_server(server.identifier);

            if (!is_enabled.random_items) return;

            await client.functions.trigger_random_item(client, server.identifier, server.players);
        });
    }, 1 * (process.env.RANDOM_ITEM_COOLDOWN || "30") * 1000);
}

async function log_initialization_error(client, error) {
    await client.functions.log("error", `\x1b[34;1m[BOT]\x1b[0m Failed To Initialize Random Items: ${error.message}`, error);
}
