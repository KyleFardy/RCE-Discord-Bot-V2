// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent } = require("rce.js");
require('dotenv').config(); // Load environment variables from .env file

// Export the event handler module
module.exports = {
    // Event handler for player kill events
    name: RCEEvent.PlayerKill,

    // Asynchronous function to execute when a player is killed
    async execute(data, rce, client) {
        try {
            const { server, killer, victim } = data; // Destructure data for clarity

            await client.functions.log("info", `[${server.identifier}] [KILL] ${killer.name} Killed ${(victim.type === "npc" ? "A Scientist" : victim.name)}!`);

            // If the victim is an NPC, update points and optionally log the kill
            if (victim.type === "npc") {
                await client.player_stats.add_points(server, killer.name, process.env.NPC_KILL_POINTS);

                if (process.env.LOG_NPC_KILLS === 'true') {
                    try {
                        await rce.sendCommand(server.identifier, `say <color=green><b>[NPC KILL]</b></color> <color=green><b>${killer.name}</b></color> Killed A <color=red><b>Scientist</b></color>!`);
                    } catch (sendCommandError) {
                        await client.functions.log("error", `Failed To Send Command\nServer : ${server.identifier}, Reason : ${sendCommandError}`);
                    }
                }
                return; // No further processing for NPC kill
            }

            if (killer.type === "npc") {
                await client.player_stats.remove_points(server, victim.name, process.env.NPC_DEATH_POINTS);
                if (process.env.LOG_NPC_KILLS === 'true') {
                    try {
                        await rce.sendCommand(server.identifier, `say <color=green><b>[NPC DEATH]</b></color> <color=green><b>${victim.name}</b></color> Was Killed By A <color=red><b>Scientist</b></color>!`);
                    } catch (sendCommandError) {
                        await client.functions.log("error", `Failed To Send Command\nServer : ${server.identifier}, Reason : ${sendCommandError}`);
                    }
                }
                return; // No further processing for NPC death
            }
            // Fetch kill and death counts for the killer
            const [killer_kill_count, killer_death_count] = await Promise.all([
                client.functions.get_count('SELECT COUNT(*) as count FROM kills WHERE display_name = ? AND victim != "Scientist"', [killer.name]),
                client.functions.get_count('SELECT COUNT(*) as count FROM kills WHERE victim = ? AND display_name != "Scientist"', [killer.name])
            ]);

            // Calculate Kill/Death ratio, handling divide by zero case
            const kd_ratio = killer_death_count === 0
                ? killer_kill_count
                : Math.round((killer_kill_count / killer_death_count) * 100) / 100;


            // List of kill feed messages
            const kill_feeds = [
                `<color=green><b>${killer.name}</b></color> Smoked <color=red><b>${victim.name}</b></color>`,
                `<color=red><b>${victim.name}</b></color> Was Doubled By <color=green><b>${killer.name}</b></color>`,
                `<color=green><b>${killer.name}</b></color> Tripled <color=red><b>${victim.name}</b></color>`,
                `<color=red><b>${victim.name}</b></color> Was Sat Down By <color=green><b>${killer.name}</b></color>`,
                `<color=green><b>${killer.name}</b></color> Shat On <color=red><b>${victim.name}</b></color>`,
                `<color=red><b>${victim.name}</b></color> Was Bummed By <color=green><b>${killer.name}</b></color>`
            ];


            // Update player statistics in parallel for better performance
            await Promise.all([
                client.player_stats.insert_player(killer.name, server),
                client.player_stats.insert_player(victim.name, server),
                client.player_stats.add_points(server, killer.name, process.env.PLAYER_KILL_POINTS),
                client.player_stats.remove_points(server, victim.name, process.env.PLAYER_DEATH_POINTS),
                client.player_stats.insert_kill(server, killer.name, victim.name, "Kill")
            ]);


            // Send a kill feed message if logging is enabled
            if (process.env.LOG_PLAYER_KILLS === 'true') {
                const kill_message = kill_feeds[Math.floor(Math.random() * kill_feeds.length)];
                await rce.sendCommand(server.identifier, `say <color=green><b>[KILL]</b></color> ${kill_message}<br><color=green><color=white>(</color>Kills: <color=white>${killer_kill_count}</color> <color=red>|</color> Deaths: <color=white>${killer_death_count}</color> <color=red>|</color> K/D Ratio: <color=white>${kd_ratio.toFixed(1)}</color><color=white>)</color></color>`);
            }
        } catch (err) {
            // Log any errors during the execution of the event
            await client.functions.log("error", `Error Handling Player Kill Event: ${err.message}`);
        }
    }
};
