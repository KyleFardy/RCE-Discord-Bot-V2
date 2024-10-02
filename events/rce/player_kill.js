// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");

// Export the event handler module
module.exports = {
    // Set the name of the event this handler listens for
    name: RCEEvent.PlayerKill,

    // Asynchronous function to execute when a player is killed
    async execute(data, rce, client) {
        const { server, killer, victim } = data; // Destructure data for better readability

        // Log an informational message indicating that a player has been killed
        const playerKilledMessage = `[${server.identifier}] [KILL] ${killer.name} killed ${victim.name}!`;
        await client.functions.log("info", playerKilledMessage);

        // Skip further processing if the victim is an NPC
        if (victim.type === "npc") return;

        // Get kill and death counts for the killer
        const killerKillsCount = await client.functions.get_count(
            'SELECT COUNT(*) as count FROM kills WHERE display_name = ? AND victim != "A Scientist"',
            [killer.name]
        );

        const killerDeathsCount = await client.functions.get_count(
            'SELECT COUNT(*) as count FROM kills WHERE victim = ? AND display_name != "A Scientist"',
            [killer.name]
        );

        // Calculate the kill/death ratio
        const kdRatio = killerDeathsCount === 0
            ? killerKillsCount
            : Math.round((killerKillsCount / killerDeathsCount) * 100) / 100;

        // Prepare kill feed messages
        const killFeeds = [
            `<color=green><b>${data.killer.name}</b></color> Smoked <color=red><b>${data.victim.name}</b></color>`,
            `<color=red><b>${data.victim.name}</b></color> Was Doubled By <color=green><b>${data.killer.name}</b></color>`,
            `<color=green><b>${data.killer.name}</b></color> Trippled <color=red><b>${data.victim.name}</b></color>`,
            `<color=red><b>${data.victim.name}</b></color> Was Sat Down By <color=green><b>${data.killer.name}</b></color>`,
            `<color=green><b>${data.killer.name}</b></color> Shat On <color=red><b>${data.victim.name}</b></color>`,
            `<color=red><b>${data.victim.name}</b></color> Was Bummed By <color=green><b>${data.killer.name}</b></color>`
        ];

        // Update player statistics for both killer and victim
        await Promise.all([
            client.player_stats.insert_player(killer.name, server),
            client.player_stats.insert_player(victim.name, server),
            client.player_stats.add_points(server, killer.name, client.config.kill_points),
            client.player_stats.remove_points(server, victim.name, client.config.death_points),
            client.player_stats.insert_kill(server, killer.name, victim.name, "Kill")
        ]);

        // Send kill message to the server
        await rce.sendCommand(`say <color=green><b>[KILL]</b></color> ${killFeeds[Math.floor(Math.random() * killFeeds.length)]}<br><color=green><color=white>(</color>Kills: <color=white>${killerKillsCount}</color> <color=red>|</color> Deaths: <color=white>${killerDeathsCount}</color> <color=red>|</color> K/D Ratio: <color=white>${kdRatio.toFixed(1)}</color><color=white>)</color></color>`);
    }
};
