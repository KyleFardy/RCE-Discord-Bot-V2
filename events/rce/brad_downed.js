// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

require('dotenv').config();

module.exports = {
    name: RCEEvent.BradDowned,

    // Asynchronous function to execute when frequency data is received
    async execute(data, rce, client) {
        await log_brad_downed(client, data.server);
    },
};

// Helper function to log the frequency received
async function log_brad_downed(client, server) {
    await client.rce.sendCommand(server.identifier, "global.say <color=green>[EVENT]</color> Somebody Has Just Destroyed <b><color=orange>Bradley APC</color></b>!");
    await client.functions.log("info", `\x1b[38;5;208m[${server.identifier}]\x1b[0m \x1b[32;1m[BRADLEY DOWNED]\x1b[0m Brad Has Just Been Downed!`);
    await client.functions.send_embed(client, process.env.EVENTS_LOG_CHANNEL, `${server.identifier} - Bradley APC`, `Somebody Has Just Destroyed The **Bradley APC**!`, [], "https://cdn.void-dev.co/bradleyapc.png");
}
