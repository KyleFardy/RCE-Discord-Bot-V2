// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.ServiceState,

    // Asynchronous function to execute when the server status has changed
    async execute(data, rce, client) {
        const state_message = get_server_state_message(client, data.state);

        await log_server_state(client, data.server.identifier, state_message);
    }
};

// Helper function to get user-friendly message for the server state
function get_server_state_message(client, state) {
    return client.functions.server_state_messages[state] || "Unknown Server State";
}

// Helper function to log the server state message
async function log_server_state(client, server_id, state_message) {
    await client.functions.log("info", `\x1b[38;5;208m[${server_id}]\x1b[0m \x1b[32;1m[SERVER STATUS]\x1b[0m ${state_message}\x1b[0m`);
}
