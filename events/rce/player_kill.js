// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.PlayerKill,

    // Asynchronous function to execute when a player is killed
    async execute(data, rce, client) {
        // Log an informational message indicating that a player has been killed
        const playerKilledMessage = `[${data.server.identifier}] [KILL] ${data.killer.name} Killed ${data.victim.name}!`;

        // Utilize the logging function from the client to log the join event
        await client.functions.log("info", playerKilledMessage);

        if(data.victim.type === "npc"){
            return;
        }
        
        const killer_killsCount = await client.functions.get_count('SELECT COUNT(*) as count FROM kills WHERE display_name = ? AND victim != "A Scientist"', [data.killer.name]);
        const killer_deathsCount = await client.functions.get_count('SELECT COUNT(*) as count FROM kills WHERE victim = ? AND display_name != "A Scientist"', [data.killer.name]);
        const kd_ratio = killer_deathsCount === 0 ? killer_killsCount : Math.round((killer_killsCount / killer_deathsCount) * 100) / 100;
        const killFeeds = [
            `<color=green><b>${data.killer.name}</b></color> Smoked <color=red><b>${data.victim.name}</b></color>`,
            `<color=red><b>${data.victim.name}</b></color> Was Doubled By <color=green><b>${data.killer.name}</b></color>`,
            `<color=green><b>${data.killer.name}</b></color> Trippled <color=red><b>${data.victim.name}</b></color>`,
            `<color=red><b>${data.victim.name}</b></color> Was Sat Down By <color=green><b>${data.killer.name}</b></color>`,
            `<color=green><b>${data.killer.name}</b></color> Shat On <color=red><b>${data.victim.name}</b></color>`,
            `<color=red><b>${data.victim.name}</b></color> Was Bummed By <color=green><b>${data.killer.name}</b></color>`
        ];
        await client.player_stats.insert_player(data.killer.name, data.server);
        await client.player_stats.insert_player(data.victim.name, data.server);

        await client.player_stats.add_points(data.server, data.killer.name, client.config.kill_points);
        await client.player_stats.remove_points(data.server, data.victim.name, client.config.death_points);
        await client.player_stats.insert_kill(data.server, data.killer.name, data.victim.name, "Kill");

        await rce.sendCommand(`say <color=green><b>[KILL]</b></color> ${killFeeds[Math.floor(Math.random() * killFeeds.length)]}<br><color=green><color=white>(</color>Kills: <color=white>${killer_killsCount}</color> <color=red>|</color> Deaths: <color=white>${killer_deathsCount}</color> <color=red>|</color> K/D Ratio: <color=white>${kd_ratio.toFixed(1)}</color><color=white>)</color></color>`);

    }
};
