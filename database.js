const client = require("./bot");

class STATS {
    constructor(client) {
        this.client = client; // Assign the client to this instance
        this.init();
    }
    async init() {
        const tableDefinitions = [
            {
                name: 'players',
                query: `
            CREATE TABLE IF NOT EXISTS players (
                id INT AUTO_INCREMENT PRIMARY KEY,
                display_name VARCHAR(255),
                discord_id VARCHAR(255) NULL,
                home VARCHAR(255) NULL,
                server VARCHAR(255) NULL,
                region VARCHAR(255) NULL,
                currency INT DEFAULT 0
            )
        `,
            },
            {
                name: 'kills',
                query: `
            CREATE TABLE IF NOT EXISTS kills (
                id INT(11) NOT NULL,
                display_name TEXT DEFAULT NULL,
                victim TEXT DEFAULT NULL,
                type TEXT DEFAULT NULL,
                server VARCHAR(255) NULL,
                region VARCHAR(255) NULL,
                time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `,
            },
            {
                name: 'bans',
                query: `
            CREATE TABLE IF NOT EXISTS bans (
                id INT AUTO_INCREMENT PRIMARY KEY,
                display_name VARCHAR(255),
                server VARCHAR(255) NULL,
                region VARCHAR(255) NULL,
                reason VARCHAR(255) NULL
            )
        `,
            },
            {
                name: 'chat_blacklist',
                query: `
            CREATE TABLE IF NOT EXISTS chat_blacklist (
                id INT AUTO_INCREMENT PRIMARY KEY,
                display_name VARCHAR(255),
                reason VARCHAR(255) NULL
            )
        `,
            },
        ];

        const checkTableExists = async (tableName) => {
            try {
                // Try to run a simple query on the table
                await this.client.database_connection.execute(`SELECT 1 FROM \`${tableName}\` LIMIT 1`);
                // If no error, the table exists
                return true;
            } catch (err) {
                // If error indicates the table doesn't exist, return false
                if (err.code === 'ER_NO_SUCH_TABLE') {
                    return false;
                }
                // Propagate any other errors
                throw err;
            }
        };


        const tablePromises = tableDefinitions.map(async ({ name, query }) => {
            try {
                const exists = await checkTableExists(name);
                if (exists) {
                    await this.client.functions.log("debug", `${name.charAt(0) + name.slice(1)} Table Already Exists!`);
                } else {
                    await this.client.database_connection.execute(query);
                    await this.client.functions.log("debug", `${name.charAt(0) + name.slice(1)} Table Created!`);
                }
            } catch (err) {
                await this.client.functions.log("error", `MySQL Create ${name.charAt(0) + name.slice(1)} Table Error: ${err.message}`);
                throw err;
            }
        });

        return Promise.all(tablePromises)
            .then(async () => {
                await this.client.functions.log("debug", "All Tables Checked/Created Successfully!");
            })
            .catch(async (err) => {
                await this.client.functions.log("error", "Error Creating One Or More Tables: " + err.message);
                throw err;
            });
    }

    async wipe_stats(server_identifier) {
        try {
            const [result, fields] = await this.client.database_connection.execute(`DELETE FROM kills WHERE server = '${server_identifier}'`);
            return `Successfully Deleted ${result.affectedRows} Kills!`;
        } catch (error) {
            return `Error Occurred While Wiping Player Stats: ${error.message}`;
        }
    }
    async wipe_homes(server_identifier) {
        try {
            const [result, fields] = await this.client.database_connection.execute(`Update players SET home = '' WHERE server = '${server_identifier}'`);
            return `Successfully Removed ${result.affectedRows} Homes!`;
        } catch (error) {
            return `Error Occurred While Wiping Player Homes: ${error.message}`;
        }
    }
    async wipe_players(server_identifier) {
        try {
            const [result, fields] = await this.client.database_connection.execute(`DELETE FROM players WHERE server = '${server_identifier}'`);
            return `Successfully Deleted ${result.affectedRows} Players!`;
        } catch (error) {
            return `Error Occurred While Wiping Players: ${error.message}`;
        }
    }
    async wipe_chat_bans(server_identifier) {
        try {
            const [result, fields] = await this.client.database_connection.execute(`DELETE FROM chat_blacklist WHERE server = '${server_identifier.serverId}' AND region = '${server_identifier.region}'`);
            return `Successfully Deleted ${result.affectedRows} Banned Chatters!`;
        } catch (error) {
            return `Error Occurred While Wiping Banned Chatters: ${error.message}`;
        }
    }
    async insert_ban(display_name, server_identifier) {
        try {
            try {
                const [result, fields] = await this.client.database_connection.execute(`INSERT INTO bans (id, display_name, reason, server, region) VALUES (DEFAULT, '${display_name}', DEFAULT, '${server_identifier.serverId}', '${server_identifier.region}')`);
            } catch (error) {
                await this.client.functions.log("error", "Error During Insert:", error);
            }
        } catch (error) {
            await this.client.functions.log("error", `Error In insert_ban: ${error.message}`);
        }
    }
    async safe_stringify(obj) {
        return JSON.stringify(obj, null, 2)
    }
    async insert_player(display_name, server_identifier) {
        try {
            const [existingPlayer] = await this.client.database_connection.execute(`SELECT * FROM players WHERE server = ? AND region = ? AND display_name = ?`, [server_identifier.serverId, server_identifier.region, display_name]);
            if (!existingPlayer.length) {
                // Player does not exist, so insert them into the database
                try {
                    const [result, fields] = await this.client.database_connection.execute(`INSERT INTO players (id, display_name, discord_id, home, currency, server, region) VALUES (DEFAULT, '${display_name}', DEFAULT, DEFAULT, DEFAULT, '${server_identifier.serverId}', '${server_identifier.region}')`);
                } catch (error) {
                    await this.client.functions.log("error", "Error During Insert:", error);
                }
            }
        } catch (error) {
            this.client.functions.log("error", `Error In insert_player: ${error.message}`);
        }

    }
    async chat_ban(display_name, reason, server_identifier) {
        try {
            const [existingPlayer] = await this.client.database_connection.execute("SELECT * FROM players WHERE display_name = ? AND server = ? AND region = ?", [display_name, server_identifier.serverId, server_identifier.region]);
            if (!existingPlayer.length) {
                try {
                    const [result, fields] = await this.client.database_connection.execute(`INSERT INTO chat_blacklist (id, display_name, reason, server, region) VALUES (DEFAULT, '${display_name}', '${reason}', '${server_identifier.serverId}', '${server_identifier.region}')`);
                } catch (error) {
                    await this.client.functions.log("error", "Error during insert:", error);
                }
            }
        } catch (error) {
            this.client.functions.log("error", `Error In chat_ban: ${error.message}`);
        }
    }
    async check_link(discord_id, server_identifier) {
        try {
            const [row] = await this.client.database_connection.execute("SELECT * FROM players WHERE discord_id = ? AND server = ? AND region = ?", [discord_id, server_identifier.serverId, server_identifier.region]);
            return row.length > 0;
        } catch (error) {
            await this.client.functions.log("error", `Error In check_link: ${error.message}`);
            return false;
        }
    }
    async insert_kill(server_identifier, display_name, victim, killType) {
        await this.client.database_connection.execute("INSERT INTO kills (display_name, victim, type, server, region) VALUES (?, ?, ?, ?, ?)", [display_name, victim, killType, server_identifier.serverId, server_identifier.region],
            async (err, results) => {
                if (err) {
                    await this.client.functions.log("error", `Error In insert_kill: ${err.message}`);
                }
            }
        );
    }
    async update_player(server_identifier, player_name, statColumn) {
        return new Promise(async (resolve, reject) => {
            await this.client.database_connection.execute(`UPDATE players SET ${statColumn} = ${statColumn} + 1 WHERE display_name = ? AND server = ? AND region = ?`, [player_name, server_identifier.serverId, server_identifier.region], async (err) => {
                if (err) {
                    await this.client.functions.log("error", `update_player ERROR: ${err.message}`);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
    async add_points(server_identifier, player_name, amount) {
        return new Promise(async (resolve, reject) => {
            await this.client.database_connection.execute(`UPDATE players SET currency = currency + ${amount} WHERE display_name = ? AND server = ? AND region = ?`, [player_name, server_identifier.serverId, server_identifier.region], async (err) => {
                if (err) {
                    await this.client.functions.log("error", `add_points ERROR: ${err.message}`);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
    async remove_points(server_identifier, player_name, amount) {
        return new Promise(async (resolve, reject) => {
            await this.client.database_connection.execute(`UPDATE players SET currency = currency - ${amount} WHERE display_name = ? AND server = ? AND region = ?`, [player_name, server_identifier.serverId, server_identifier.region], async (err) => {
                if (err) {
                    await this.client.functions.log("error", `remove_points ERROR: ${err.message}`);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
    async get_points(server_identifier, player_name) {
        return new Promise(async (resolve, reject) => {
            await this.client.database_connection.execute(`SELECT currency FROM players WHERE display_name = ? AND server = ? AND region = ?`, [player_name, server_identifier.serverId, server_identifier.region], async (err, results) => {
                if (err) {
                    await this.client.functions.log("error", `remove_points ERROR: ${err.message}`);
                    reject(err);
                } else {
                    resolve(results.length > 0 ? results[0].currency : 0);
                }
            });
        });
    }
    async link_discord(server_identifier, player_name, discord_id) {
        return new Promise(async (resolve, reject) => {
            await this.client.database_connection.execute('SELECT * FROM players WHERE display_name = ? AND server = ? AND region = ?', [player_name, server_identifier.serverId, server_identifier.region], async (err, player) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (!player.length) {
                    reject(`player ${player_name} Was Not Found!`);
                    return;
                }
                if (player[0].discord_id === null) {
                    const query = 'UPDATE players SET discord_id = ? WHERE display_name = ? AND server = ? AND region = ?';
                    await this.client.database_connection.execute(query, [discord_id, player_name, server_identifier.serverId, server_identifier.region], (updateErr) => {
                        if (updateErr) {
                            reject(updateErr);
                        } else {
                            resolve(true);
                        }
                    });
                } else {
                    reject(`A Discord Account Is Already Linked To ${player_name}`);
                }
            });
        });
    }
    async add_kill(player_name, server_identifier) {
        return await this.update_player(server_identifier, player_name, 'Kills');
    }
    async add_death(player_name, server_identifier) {
        return await this.update_player(server_identifier, player_name, 'Deaths');
    }
    async add_npc_kill(player_name, server_identifier) {
        return await this.update_player(server_identifier, player_name, 'NPCKills');
    }
    async add_npc_death(player_name, server_identifier) {
        return await this.update_player(server_identifier, player_name, 'NPCDeaths');
    }
}

module.exports = STATS;