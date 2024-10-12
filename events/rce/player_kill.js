// Import necessary components from the rce.js library
const { RCEManager, LogLevel, RCEEvent, PlayerKillType} = require("rce.js");
require('dotenv').config(); // Load environment variables from .env file

// Export the event handler module
module.exports = {
    // Event handler for player kill events
    name: RCEEvent.PlayerKill,

    // Asynchronous function to execute when a player is killed
    async execute(data, rce, client) {
        try {
            const { server, killer, victim } = data; // Destructure data for clarity
            // Log kill event
            await client.functions.log("info", `\x1b[38;5;208m[${server.identifier}]\x1b[0m \x1b[32;1m[KILL]\x1b[0m \x1b[32;1m${(killer.type === "npc" ? "A Scientist" : killer.name)}\x1b[0m Killed \x1b[38;5;214m${(victim.type === "npc" ? "A Scientist" : victim.name)}\x1b[0m!`);

            const current_server = await client.functions.get_server(client, data.server.identifier);

            if (!current_server){
                await client.functions.log("error", "Failed To Fetch Server", current_server);
            }
            // Handle NPC kills
            if (victim.type === PlayerKillType.Npc) {
                await handle_npc_kill(client, server, killer, current_server);
                return; // No further processing for NPC kill
            }

            // Handle NPC deaths
            if (killer.type === PlayerKillType.Npc) {
                await handle_npc_death(client, server, victim, current_server);
                return; // No further processing for NPC death
            }

            // Handle NPC deaths
            if (killer.type === PlayerKillType.Entity) {
                await handle_entity_death(client, server, victim, current_server);
                return; // No further processing for NPC death
            }

            // Check if either the killer or victim is ignored
            if (killer.type != PlayerKillType.Player) {
                return;
            }
            // Fetch kill and death counts for the killer
            const [killer_kill_count, killer_death_count] = await Promise.all([
                get_death_count(client, killer.name, "victim != 'Scientist'"),
                get_death_count(client, victim.name, "display_name != 'Scientist'")
            ]);

            // Calculate Kill/Death ratio, handling divide by zero case
            const kd_ratio = calculate_kd_ratio(killer_kill_count, killer_death_count);

            // List of kill feed messages
            const kill_feeds = generate_kill_feeds(killer.name, victim.name);

            // Update player statistics in parallel for better performance
            await update_player_stats(client, server, killer, victim, current_server);

            await send_kill_feed(client, rce, server, killer, victim, kill_feeds, killer_kill_count, killer_death_count, kd_ratio, current_server);
        } catch (err) {
            // Log any errors during the execution of the event
            console.log(JSON.stringify(err.message));
            await client.functions.log("error", `Error Handling Player Kill Event: ${err.message}`);
        }
    }
};

// Handle NPC kill logic
async function handle_npc_kill(client, server, killer, current_server) {
    await client.player_stats.add_points(server, killer.name, current_server.npc_kill_points);
    try {
        const killer_name = await get_member_name(client, killer.name, current_server);
        await client.functions.send_embed(client, current_server.kill_feeds_channel_id, `${server.identifier} - New NPC Kill`, "", [
            { name: 'Killer', value: `👤 ${killer_name}`, inline: true },
            { name: 'Victim', value: `👤 A Scientist`, inline: true },
            { name: 'Time', value: `🕜 <t:${Math.floor(new Date().getTime() / 1000)}:R>`, inline: true },
        ], "https://cdn.void-dev.co/death.png");
        
        await client.rce.servers.command(server.identifier, `say <color=green><b>[NPC KILL]</b></color> <color=green><b>${killer.name}</b></color> Killed A <color=red><b>Scientist</b></color>!`);
    } catch (err) {
        await client.functions.log("error", `Failed to send command\nServer: ${server.identifier}, Reason: ${err.message}`);
    }
}

// Handle Entity death logic
async function handle_entity_death(client, server, victim, current_server) {
    await client.player_stats.remove_points(server, victim.name, current_server.npc_death_points);
    try {
        const victim_name = await get_member_name(client, victim.name, current_server);
        await client.functions.send_embed(client, current_server.kill_feeds_channel_id, `${server.identifier} - New NPC Death`, "", [
            { name: 'Killer', value: `👤 A Scientist`, inline: true },
            { name: 'Victim', value: `👤 ${victim_name}`, inline: true },
            { name: 'Time', value: `🕜 <t:${Math.floor(new Date().getTime() / 1000)}:R>`, inline: true },
        ], "https://cdn.void-dev.co/death.png");
        await client.rce.servers.command(server.identifier, `say <color=green><b>[NPC DEATH]</b></color> <color=green><b>${victim.name}</b></color> was killed by a <color=red><b>Scientist</b></color>!`);
    } catch (err) {
        await client.functions.log("error", `Failed to send command\nServer: ${server.identifier}, Reason: ${err.message}`);
    }
}

// Handle NPC death logic
async function handle_npc_death(client, server, victim, current_server) {
    await client.player_stats.remove_points(server, victim.name, current_server.npc_death_points);
    try {
        const victim_name = await get_member_name(client, victim.name, current_server);
        await client.functions.send_embed(client, current_server.kill_feeds_channel_id, `${server.identifier} - New NPC Death`, "", [
            { name: 'Killer', value: `👤 A Scientist`, inline: true },
            { name: 'Victim', value: `👤 ${victim_name}`, inline: true },
            { name: 'Time', value: `🕜 <t:${Math.floor(new Date().getTime() / 1000)}:R>`, inline: true },
        ], "https://cdn.void-dev.co/death.png");
        await client.rce.servers.command(server.identifier, `say <color=green><b>[NPC DEATH]</b></color> <color=green><b>${victim.name}</b></color> was killed by a <color=red><b>Scientist</b></color>!`);
    } catch (err) {
        await client.functions.log("error", `Failed to send command\nServer: ${server.identifier}, Reason: ${err.message}`);
    }
}

// Get the death count for a player
async function get_death_count(client, player_name, condition) {
    return await client.functions.get_count(client, `SELECT COUNT(*) as count FROM kills WHERE display_name = ? AND ${condition}`, [player_name]);
}

// Calculate the Kill/Death ratio
function calculate_kd_ratio(kills, deaths) {
    return deaths === 0 ? kills : Math.round((kills / deaths) * 100) / 100;
}

// Generate random kill feed messages
function generate_kill_feeds(killer_name, victim_name) {
    return [
        `<color=green><b>${killer_name}</b></color> Smoked <color=red><b>${victim_name}</b></color>`,
        `<color=red><b>${victim_name}</b></color> Was Doubled By <color=green><b>${killer_name}</b></color>`,
        `<color=green><b>${killer_name}</b></color> Tripled <color=red><b>${victim_name}</b></color>`,
        `<color=red><b>${victim_name}</b></color> Was Sat Down By <color=green><b>${killer_name}</b></color>`,
        `<color=green><b>${killer_name}</b></color> Shat On <color=red><b>${victim_name}</b></color>`,
        `<color=red><b>${victim_name}</b></color> Was Bummed By <color=green><b>${killer_name}</b></color>`
    ];
}

// Update player statistics
async function update_player_stats(client, server, killer, victim, current_server) {
    await Promise.all([
        client.player_stats.insert_player(killer.name, server),
        client.player_stats.insert_player(victim.name, server),
        client.player_stats.add_points(server, killer.name, current_server.player_kill_points),
        client.player_stats.remove_points(server, victim.name, current_server.player_death_points),
        client.player_stats.insert_kill(server, killer.name, victim.name, "Kill")
    ]);
}

// Send kill feed message
async function send_kill_feed(client, rce, server, killer, victim, kill_feeds, killer_kill_count, killer_death_count, kd_ratio, current_server) {
    try {
        const killer_name = await get_member_name(client, killer.name, current_server);
        const victim_name = await get_member_name(client, victim.name, current_server);
        await client.functions.send_embed(client, current_server.kill_feeds_channel_id, `${server.identifier} - New Kill`, "", [
            { name: 'Killer', value: `👤 ${killer_name}`, inline: true },
            { name: 'Victim', value: `👤 ${victim_name}`, inline: true },
            { name: 'Time', value: `🕜 <t:${Math.floor(new Date().getTime() / 1000)}:R>`, inline: true },
        ], "https://cdn.void-dev.co/death.png");
        const kill_message = kill_feeds[Math.floor(Math.random() * kill_feeds.length)];
        await client.rce.servers.command(server.identifier, `say <color=green><b>[KILL]</b></color> ${kill_message}<br><color=green><color=white>(</color>Kills: <color=white>${killer_kill_count}</color> <color=red>|</color> Deaths: <color=white>${killer_death_count}</color> <color=red>|</color> K/D: <color=white>${kd_ratio}</color>)</color>`);
    } catch (err) {
        await client.functions.log("error", `Failed to send kill feed\nServer: ${server.identifier}, Reason: ${err.message}`);
    }
}

// Helper function to get member name
function get_member_name(client, ign, server) {
    return client.guilds.cache.get(server.guild_id)?.members.cache.find(member => member.nickname === ign || member.user.username === ign)?.toString() || ign;
}