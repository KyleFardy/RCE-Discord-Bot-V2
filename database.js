
class STATS {
    constructor(client) {
        this.client = client;
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
                    )`,
            },
            {
                name: 'kills',
                query: `
                    CREATE TABLE IF NOT EXISTS kills (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        display_name TEXT DEFAULT NULL,
                        victim TEXT DEFAULT NULL,
                        type TEXT DEFAULT NULL,
                        server VARCHAR(255) NULL,
                        region VARCHAR(255) NULL,
                        time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,
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
                    )`,
            },
            {
                name: 'chat_blacklist',
                query: `
                    CREATE TABLE IF NOT EXISTS chat_blacklist (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        display_name VARCHAR(255),
                        reason VARCHAR(255) NULL
                    )`,
            },
            {
                name: 'kit_redemptions',
                query: `
                    CREATE TABLE kit_redemptions (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        display_name VARCHAR(255) NOT NULL,
                        type VARCHAR(255) NOT NULL,
                        server VARCHAR(255) NOT NULL,
                        region VARCHAR(255) NOT NULL,
                        last_redeemed INT NOT NULL
                    );`,
            },
            {
                name: 'servers',
                query: `
                    CREATE TABLE IF NOT EXISTS servers (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    identifier VARCHAR(255) NOT NULL,
                    region VARCHAR(50) NOT NULL,
                    server_id BIGINT NOT NULL,
                    refresh_players INT DEFAULT 2,
                    rf_broadcasting FLOAT DEFAULT 0.5,
                    bradley_feeds FLOAT DEFAULT 0.5,
                    heli_feeds FLOAT DEFAULT 0.5,
                    random_items BOOLEAN DEFAULT FALSE,
                    guild_owner VARCHAR(255) NOT NULL,
                    guild_id VARCHAR(255) NOT NULL
                );`,
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
                    await this.client.functions.log("debug", `\x1b[34;1m[DATABASE]\x1b[0m ${name.charAt(0) + name.slice(1)} Table Already Exists!`);
                } else {
                    await this.client.database_connection.execute(query);
                    await this.client.functions.log("debug", `\x1b[34;1m[DATABASE]\x1b[0m ${name.charAt(0) + name.slice(1)} Table Created!`);
                }
            } catch (err) {
                await this.client.functions.log("error", `\x1b[34;1m[DATABASE]\x1b[0m MySQL Create ${name.charAt(0) + name.slice(1)} Table Error: ${err.message}`);
                throw err;
            }
        });

        return Promise.all(tablePromises)
            .then(async () => {
                await this.client.functions.log("info", "\x1b[34;1m[DATABASE]\x1b[0m All Tables Checked/Created Successfully!");
            })
            .catch(async (err) => {
                await this.client.functions.log("error", "\x1b[34;1m[DATABASE]\x1b[0m Error Creating One Or More Tables: " + err.message);
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
                await this.client.functions.log("error", "\x1b[34;1m[DATABASE]\x1b[0m Error During Ban Insert:", error);
            }
        } catch (error) {
            await this.client.functions.log("error", `\x1b[34;1m[DATABASE]\x1b[0m Error In Insert Ban: ${error.message}`);
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
                    await this.client.functions.log("error", "\x1b[34;1m[DATABASE]\x1b[0m Error During Player Insert:", error);
                }
            }
        } catch (error) {
            this.client.functions.log("error", `\x1b[34;1m[DATABASE]\x1b[0m Error In Insert Player: ${error.message}`);
        }

    }
    async chat_ban(display_name, reason, server_identifier) {
        try {
            const [existingPlayer] = await this.client.database_connection.execute("SELECT * FROM players WHERE display_name = ? AND server = ? AND region = ?", [display_name, server_identifier.serverId, server_identifier.region]);
            if (!existingPlayer.length) {
                try {
                    const [result, fields] = await this.client.database_connection.execute(`INSERT INTO chat_blacklist (id, display_name, reason, server, region) VALUES (DEFAULT, '${display_name}', '${reason}', '${server_identifier.serverId}', '${server_identifier.region}')`);
                } catch (error) {
                    await this.client.functions.log("error", "\x1b[34;1m[DATABASE]\x1b[0m Error During Chat Ban Insert:", error);
                }
            }
        } catch (error) {
            this.client.functions.log("error", `\x1b[34;1m[DATABASE]\x1b[0m Error In Chat Ban: ${error.message}`);
        }
    }
    async insert_kill(server_identifier, display_name, victim, killType) {
        try {
            const [results] = await this.client.database_connection.execute(
                "INSERT INTO kills (display_name, victim, type, server, region) VALUES (?, ?, ?, ?, ?)",
                [display_name, victim, killType, server_identifier.serverId, server_identifier.region]
            );
        } catch (err) {
            await this.client.functions.log("error", `\x1b[34;1m[DATABASE]\x1b[0m Error In Inserting Kill: ${err.message}`);
            throw err; // Rethrow to let the caller handle it
        }
    }
    async update_player(server_identifier, player_name, statColumn) {
        return new Promise(async (resolve, reject) => {
            await this.client.database_connection.execute(`UPDATE players SET ${statColumn} = ${statColumn} + 1 WHERE display_name = ? AND server = ? AND region = ?`, [player_name, server_identifier.serverId, server_identifier.region], async (err) => {
                if (err) {
                    await this.client.functions.log("error", `\x1b[34;1m[DATABASE]\x1b[0m Error In Update Player: ${err.message}`);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
    async add_points(server_identifier, player_name, amount) {
        try {
            const [result] = await this.client.database_connection.execute(
                `UPDATE players SET currency = currency + ? WHERE display_name = ? AND server = ? AND region = ?`,
                [amount, player_name, server_identifier.serverId, server_identifier.region]
            );
        } catch (err) {
            await this.client.functions.log("error", `\x1b[34;1m[DATABASE]\x1b[0m Error In Add Points: ${err.message}`);
            throw err; // Rethrow to let the caller handle it
        }
    }
    async remove_points(server_identifier, player_name, amount) {
        try {
            const [result] = await this.client.database_connection.execute(
                `UPDATE players SET currency = currency - ? WHERE display_name = ? AND server = ? AND region = ?`,
                [amount, player_name, server_identifier.serverId, server_identifier.region]
            );
        } catch (err) {
            await this.client.functions.log("error", `\x1b[34;1m[DATABASE]\x1b[0m Error In Remove Points: ${err.message}`);
            throw err; // Rethrow to let the caller handle it
        }
    }
    async get_points(server_identifier, player_name) {
        return new Promise(async (resolve, reject) => {
            await this.client.database_connection.execute(`SELECT currency FROM players WHERE display_name = ? AND server = ? AND region = ?`, [player_name, server_identifier.serverId, server_identifier.region], async (err, results) => {
                if (err) {
                    await this.client.functions.log("error", `\x1b[34;1m[DATABASE]\x1b[0m Error In Get Points: ${err.message}`);
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
                    reject(`Player ${player_name} Was Not Found!`);
                    return;
                }
                if (player[0].discord_id === null) {
                    await this.client.database_connection.execute('UPDATE players SET discord_id = ? WHERE display_name = ? AND server = ? AND region = ?', [discord_id, player_name, server_identifier.serverId, server_identifier.region], (updateErr) => {
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
    async add_server(identifier, region, server_id, refresh_players, rf_broadcasting, random_items, guild_owner, guild_id) {
        try {
            const [existingServer] = await this.client.database_connection.execute(
                `SELECT * FROM servers WHERE identifier = ? AND region = ?`,
                [identifier, region]
            );

            if (!existingServer.length) {
                // Insert new server if it does not exist
                await this.client.database_connection.execute(
                    `INSERT INTO servers (identifier, region, server_id, refresh_players, rf_broadcasting, random_items, guild_owner, guild_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [identifier, region, server_id, refresh_players, rf_broadcasting, random_items, guild_owner, guild_id]
                );
                const success_message = `Server ${identifier} Added Successfully!`;
                await this.client.functions.log("info", `\x1b[34;1m[DATABASE]\x1b[0m ${success_message}`);
                return { success: true, message: success_message }; // Return success message
            } else {
                const not_found_message = `Server ${identifier} Already Exists!`;
                await this.client.functions.log("info", `\x1b[34;1m[DATABASE]\x1b[0m ${not_found_message}`);
                return { success: false, message: not_found_message }; // Return already exists message
            }
        } catch (err) {
            const error_message = `Error Adding Server: ${err.message}`;
            await this.client.functions.log("error", `\x1b[34;1m[DATABASE]\x1b[0m ${error_message}`);
            throw new Error(error_message); // Rethrow the error for further handling if necessary
        }
    }

    async remove_server(identifier, region, discord_id, guild_id) {
        try {
            const [result] = await this.client.database_connection.execute(
                `DELETE FROM servers WHERE identifier = ? AND region = ? AND guild_owner = ? AND guild_id = ?`,
                [identifier, region, discord_id, guild_id]
            );

            if (result.affectedRows > 0) {
                const success_message = `Server ${identifier} Removed Successfully!`;
                await this.client.functions.log("info", `\x1b[34;1m[DATABASE]\x1b[0m ${success_message}`);
                return { success: true, message: success_message };
            } else {
                const not_found_message = `Server ${identifier} Not Found In Region ${region}!`;
                await this.client.functions.log("info", `\x1b[34;1m[DATABASE]\x1b[0m ${not_found_message}`);
                return { success: false, message: not_found_message };
            }
        } catch (err) {
            const error_message = `Error Removing Server: ${err.message}`;
            await this.client.functions.log("error", `\x1b[34;1m[DATABASE]\x1b[0m ${error_message}`);
            throw new Error(error_message);
        }
    }



}
module.exports = STATS;