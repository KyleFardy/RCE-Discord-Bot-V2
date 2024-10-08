// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

module.exports = {
    name: RCEEvent.FrequencyReceived,

    // Asynchronous function to execute when frequency data is received
    async execute(data, rce, client) {
        const { server, frequency, coordinates, range } = data; // Destructure data for clarity

        await log_frequency_received(client, server.identifier, frequency, coordinates, range);
    },
};

// Helper function to log the frequency received
async function log_frequency_received(client, server_id, frequency, coordinates, range) {
    await client.functions.log("info", `[${server_id}] Raid Alarm: Frequency ${frequency}, Coordinates: ${coordinates}, Range: ${range}`);
}
