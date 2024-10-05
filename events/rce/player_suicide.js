// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.PlayerSuicide,

    // Asynchronous function to execute when a player kills themself
    async execute(data, rce, client) {
        // Log an informational message indicating that a player has killed themself
        await client.functions.log("info", `\x1b[38;5;208m[${data.server.identifier}]\x1b[0m \x1b[32;1m[PLAYER SUICIDE]\x1b[0m \x1b[32;1m${data.ign}\x1b[0m Killed Themself!`);

        //remove the points
        await client.player_stats.remove_points(data.server, data.ign, process.env.SUICIDE_POINTS);
    }
};
