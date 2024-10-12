// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

module.exports = {
    name: RCEEvent.FrequencyGained,

    // Asynchronous function to execute when frequency data is received
    async execute(data, rce, client) {
        const { server, frequency, coordinates, range } = data; // Destructure data for clarity
        if (frequency === 4765 || frequency === 4768) return;
        await log_frequency_received(client, server.identifier, frequency, coordinates, range);
    },
};

// Helper function to log the frequency received
async function log_frequency_received(client, server_id, frequency, coordinates, range) {
    await client.functions.log("info", `\x1b[38;5;208m[${server_id}]\x1b[0m \x1b[32;1m[FREQUENCY RECEIVED]\x1b[0m Frequency ${frequency}, Coordinates: ${coordinates}, Range: ${range}\x1b[0m`);
}
