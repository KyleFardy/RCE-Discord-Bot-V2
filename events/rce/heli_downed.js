// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

require('dotenv').config();

module.exports = {
    name: RCEEvent.HeliDowned,

    // Asynchronous function to execute when frequency data is received
    async execute(data, rce, client) {
        await log_heli_downed(client, data.server);
    },
};

// Helper function to log the frequency received
async function log_heli_downed(client, server) {
    await client.rce.sendCommand(server.identifier, "global.say <color=green>[EVENT]</color> Somebody Has Just Dropped The <b><color=orange>Patrol Helicopter</color></b>!");
    await client.functions.log("info", `\x1b[38;5;208m[${server.identifier}]\x1b[0m \x1b[32;1m[HELI DOWNED]\x1b[0m The Patrol Helicopter Has Just Been Downed!`);
    await client.functions.send_embed(client, process.env.EVENTS_LOG_CHANNEL, `${server.identifier} - Patrol Helicopter`, `Somebody Has Just Dropped The **Patrol Helicopter**!`, [], "https://i.ibb.co/z84qH5G/helicopter.png");
}
