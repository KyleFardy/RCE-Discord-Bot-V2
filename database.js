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
                    guild_id VARCHAR(255) NOT NULL,
                    category_id VARCHAR(255) NOT NULL,
                    linked_role_id VARCHAR(255) NOT NULL,
                    link_channel_id VARCHAR(255) NOT NULL,
                    kill_feeds_channel_id VARCHAR(255) NOT NULL,
                    events_channel_id VARCHAR(255) NOT NULL,
                    stats_channel_id VARCHAR(255) NOT NULL,
                    chat_logs_channel_id VARCHAR(255) NOT NULL,
                    item_spawning_channel_id VARCHAR(255) NOT NULL,
                    kits_logs_channel_id VARCHAR(255) NOT NULL,
                    team_logs_channel_id VARCHAR(255) NOT NULL,
                    teleport_logs_channel_id VARCHAR(255) NOT NULL,
                    shop_channel_id VARCHAR(255) NOT NULL,
                    settings_channel_id VARCHAR(255) NOT NULL,
                    npc_kill_points int NOT NULL,
                    npc_death_points int NOT NULL,
                    player_kill_points int NOT NULL,
                    player_death_points int NOT NULL,
                    suicide_points int NOT NULL,
                    outpost VARCHAR(255) NOT NULL,
                    bandit VARCHAR(255) NOT NULL,
                    loot_scale INT DEFAULT 1,
                    hourly_kit_name VARCHAR(255) NULL,
                    vip_kit_name VARCHAR(255) NULL,
                    vip_role_id VARCHAR(255) NULL,
                    enabled int(11) NOT NULL DEFAULT 1
                );`,
      },
    ];

    const checkTableExists = async (tableName) => {
      try {
        // Try to run a simple query on the table
        await this.client.database_connection.execute(
          `SELECT 1 FROM \`${tableName}\` LIMIT 1`
        );
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
          await this.client.functions.log(
            'debug',
            `\x1b[34;1m[DATABASE]\x1b[0m ${
              name.charAt(0) + name.slice(1)
            } Table Already Exists!`
          );
        } else {
          await this.client.database_connection.execute(query);
          await this.client.functions.log(
            'debug',
            `\x1b[34;1m[DATABASE]\x1b[0m ${
              name.charAt(0) + name.slice(1)
            } Table Created!`
          );
        }
      } catch (err) {
        await this.client.functions.log(
          'error',
          `\x1b[34;1m[DATABASE]\x1b[0m MySQL Create ${
            name.charAt(0) + name.slice(1)
          } Table Error: ${err.message}`
        );
        throw err;
      }
    });

    return Promise.all(tablePromises)
      .then(async () => {
        await this.client.functions.log(
          'info',
          '\x1b[34;1m[DATABASE]\x1b[0m All Tables Checked/Created Successfully!'
        );
      })
      .catch(async (err) => {
        await this.client.functions.log(
          'error',
          '\x1b[34;1m[DATABASE]\x1b[0m Error Creating One Or More Tables: ' +
            err.message
        );
        throw err;
      });
  }
  async wipe_stats(server_identifier) {
    try {
      const [result, fields] = await this.client.database_connection.execute(
        `DELETE FROM kills WHERE server = '${server_identifier}'`
      );
      return `Successfully Deleted ${result.affectedRows} Kills!`;
    } catch (error) {
      return `Error Occurred While Wiping Player Stats: ${error.message}`;
    }
  }
  async wipe_homes(server_identifier) {
    try {
      const [result, fields] = await this.client.database_connection.execute(
        `Update players SET home = '' WHERE server = '${server_identifier}'`
      );
      return `Successfully Removed ${result.affectedRows} Homes!`;
    } catch (error) {
      return `Error Occurred While Wiping Player Homes: ${error.message}`;
    }
  }
  async wipe_players(server_identifier) {
    try {
      const [result, fields] = await this.client.database_connection.execute(
        `DELETE FROM players WHERE server = '${server_identifier}'`
      );
      return `Successfully Deleted ${result.affectedRows} Players!`;
    } catch (error) {
      return `Error Occurred While Wiping Players: ${error.message}`;
    }
  }
  async wipe_chat_bans(server_identifier) {
    try {
      const [result, fields] = await this.client.database_connection.execute(
        `DELETE FROM chat_blacklist WHERE server = '${server_identifier.serverId[0]}' AND region = '${server_identifier.region}'`
      );
      return `Successfully Deleted ${result.affectedRows} Banned Chatters!`;
    } catch (error) {
      return `Error Occurred While Wiping Banned Chatters: ${error.message}`;
    }
  }
  // Insert a ban record for the player if they exist
  async insert_ban(display_name, server_identifier) {
    try {
      // Check if the player exists
      const exists = await this.player_exists(server_identifier, display_name);

      if (exists) {
        // Player exists, proceed to insert the ban
        await this.client.database_connection.execute(
          `INSERT INTO bans (id, display_name, reason, server, region) VALUES (DEFAULT, ?, DEFAULT, ?, ?)`,
          [
            display_name,
            server_identifier.serverId[0],
            server_identifier.region,
          ]
        );
      } else {
        await this.client.functions.log(
          'info',
          `\x1b[33;1m[DATABASE]\x1b[0m Player '${display_name}' does not exist, ban not inserted.`
        );
      }
    } catch (error) {
      await this.client.functions.log(
        'error',
        `\x1b[34;1m[DATABASE]\x1b[0m Error In Insert Ban: ${error.message}`
      );
    }
  }

  // Insert a player if they don't exist
  async insert_player(display_name, server_identifier) {
    try {
      const exists = await this.player_exists(server_identifier, display_name);
      if (!exists) {
        // Player does not exist, so insert them into the database
        await this.client.database_connection.execute(
          `INSERT INTO players (id, display_name, discord_id, home, currency, server, region) VALUES (DEFAULT, ?, DEFAULT, DEFAULT, DEFAULT, ?, ?)`,
          [
            display_name,
            server_identifier.serverId[0],
            server_identifier.region,
          ]
        );
      }
    } catch (error) {
      await this.client.functions.log(
        'error',
        `\x1b[34;1m[DATABASE]\x1b[0m Error In Insert Player: ${error.message}`
      );
      throw error; // Rethrow to let the caller handle the error
    }
  }
  // Ban a player in chat, insert into blacklist if they don't exist
  async chat_ban(display_name, reason, server_identifier) {
    try {
      const exists = await this.player_exists(server_identifier, display_name);

      if (!exists) {
        // Player does not exist, create them before banning
        await this.insert_player(display_name, server_identifier);
      }

      const [existingBan] = await this.client.database_connection.execute(
        'SELECT * FROM chat_blacklist WHERE display_name = ? AND server = ? AND region = ?',
        [display_name, server_identifier.serverId[0], server_identifier.region]
      );

      if (!existingBan.length) {
        // Player is not banned, insert into chat_blacklist
        await this.client.database_connection.execute(
          'INSERT INTO chat_blacklist (id, display_name, reason, server, region) VALUES (DEFAULT, ?, ?, ?, ?)',
          [
            display_name,
            reason,
            server_identifier.serverId[0],
            server_identifier.region,
          ]
        );
      }
    } catch (error) {
      await this.client.functions.log(
        'error',
        `\x1b[34;1m[DATABASE]\x1b[0m Error In Chat Ban: ${error.message}`
      );
      throw error; // Rethrow to let the caller handle the error
    }
  }

  // Insert a kill record for the player
  async insert_kill(server_identifier, display_name, victim, killType) {
    try {
      const exists = await this.player_exists(server_identifier, display_name);

      if (!exists) {
        // Player does not exist, create them
        await this.insert_player(display_name, server_identifier);
      }

      // Insert the kill record
      await this.client.database_connection.execute(
        'INSERT INTO kills (display_name, victim, type, server, region) VALUES (?, ?, ?, ?, ?)',
        [
          display_name,
          victim,
          killType,
          server_identifier.serverId[0],
          server_identifier.region,
        ]
      );
    } catch (err) {
      await this.client.functions.log(
        'error',
        `\x1b[34;1m[DATABASE]\x1b[0m Error In Inserting Kill: ${err.message}`
      );
      throw err; // Rethrow to let the caller handle it
    }
  }

  // Function to update a player's stat column, creating the player if they don't exist
  async update_player(server_identifier, player_name, statColumn) {
    try {
      // Ensure the player exists or create them if they don't
      const exists = await this.player_exists(
        server_identifier,
        player_name,
        0
      );
      if (exists) {
        // Update the player's stat column
        await this.client.database_connection.execute(
          `UPDATE players SET ${statColumn} = ${statColumn} + 1 WHERE display_name = ? AND server = ? AND region = ?`,
          [player_name, server_identifier.serverId[0], server_identifier.region]
        );
      }
    } catch (err) {
      await this.client.functions.log(
        'error',
        `\x1b[34;1m[DATABASE]\x1b[0m Error In Update Player: ${err.message}`
      );
      throw err; // Rethrow the error for the caller to handle
    }
  }

  async player_exists(server, player_name) {
    // Check if the player exists
    const [result] = await this.client.database_connection.execute(
      `SELECT COUNT(*) as count FROM players WHERE display_name = ? AND server = ? AND region = ?`,
      [player_name, server.serverId[0], server.region]
    );

    if (result[0].count > 0) {
      return true; // Player exists
    } else {
      // Player does not exist, insert a new record
      await this.client.database_connection.execute(
        `INSERT INTO players (display_name, server, region, currency) VALUES (?, ?, ?, ?)`,
        [player_name, server.serverId[0], server.region, 0]
      );
      await this.client.functions.log(
        'info',
        `\x1b[33;1m[DATABASE]\x1b[0m Created A New Player ${player_name} In Server ${server.serverId[0]}, Region ${server.region}`
      );
      return false; // Player was just created
    }
  }
  async add_points(server_identifier, player_name, amount) {
    try {
      // Call player_exists to check or create the player
      const exists = await this.player_exists(
        server_identifier,
        player_name,
        amount
      );

      if (exists) {
        // If the player already existed, update the points
        await this.client.database_connection.execute(
          `UPDATE players SET currency = currency + ? WHERE display_name = ? AND server = ? AND region = ?`,
          [
            amount,
            player_name,
            server_identifier.serverId[0],
            server_identifier.region,
          ]
        );
      }
    } catch (err) {
      await this.client.functions.log(
        'error',
        `\x1b[34;1m[DATABASE]\x1b[0m Error In Add Points: ${err.message}`
      );
      throw err; // Rethrow to let the caller handle it
    }
  }
  async remove_points(server, player_name, amount) {
    try {
      // Call player_exists to check or create the player
      const exists = await this.player_exists(server, player_name, amount);
      if (exists) {
        // If the player already existed, update the points
        const [result] = await this.client.database_connection.execute(
          `UPDATE players SET currency = currency - ? WHERE display_name = ? AND server = ? AND region = ?`,
          [amount, player_name, server.serverId[0], server.region]
        );
      }
    } catch (err) {
      await this.client.functions.log(
        'error',
        `\x1b[34;1m[DATABASE]\x1b[0m Error In Remove Points: ${err.message}`
      );
      throw err; // Rethrow to let the caller handle it
    }
  }
  async get_points(server, player_name) {
    try {
      // Check if the player exists, and create them with 0 points if they don't
      const exists = await this.player_exists(server, player_name, 0);

      // Retrieve the player's points (whether they existed or were just created)
      const [results] = await this.client.database_connection.execute(
        `SELECT currency FROM players WHERE display_name = ? AND server = ? AND region = ?`,
        [player_name, server.serverId[0], server.region]
      );

      return results.length > 0 ? results[0].currency : 0;
    } catch (err) {
      await this.client.functions.log(
        'error',
        `\x1b[34;1m[DATABASE]\x1b[0m Error In Get Points: ${err.message}`
      );
      throw err; // Rethrow the error so it can be handled by the caller
    }
  }
  async link_discord(server_identifier, player_name, discord_id) {
    return new Promise(async (resolve, reject) => {
      await this.client.database_connection.execute(
        'SELECT * FROM players WHERE display_name = ? AND server = ? AND region = ?',
        [player_name, server_identifier.serverId[0], server_identifier.region],
        async (err, player) => {
          if (err) {
            reject(err);
            return;
          }
          if (!player.length) {
            reject(`Player ${player_name} Was Not Found!`);
            return;
          }
          if (player[0].discord_id === null) {
            await this.client.database_connection.execute(
              'UPDATE players SET discord_id = ? WHERE display_name = ? AND server = ? AND region = ?',
              [
                discord_id,
                player_name,
                server_identifier.serverId[0],
                server_identifier.region,
              ],
              (updateErr) => {
                if (updateErr) {
                  reject(updateErr);
                } else {
                  resolve(true);
                }
              }
            );
          } else {
            reject(`A Discord Account Is Already Linked To ${player_name}`);
          }
        }
      );
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
    return await this.update_player(
      server_identifier,
      player_name,
      'NPCDeaths'
    );
  }
  async add_server(
    identifier,
    region,
    server_id,
    refresh_players,
    rf_broadcasting,
    random_items,
    guild_owner,
    guild_id
  ) {
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
          [
            identifier,
            region,
            server_id,
            refresh_players,
            rf_broadcasting,
            random_items,
            guild_owner,
            guild_id,
          ]
        );
        const success_message = `Server ${identifier} Added Successfully!`;
        await this.client.functions.log(
          'info',
          `\x1b[34;1m[DATABASE]\x1b[0m ${success_message}`
        );
        return { success: true, message: success_message }; // Return success message
      } else {
        const not_found_message = `Server ${identifier} Already Exists!`;
        await this.client.functions.log(
          'info',
          `\x1b[34;1m[DATABASE]\x1b[0m ${not_found_message}`
        );
        return { success: false, message: not_found_message }; // Return already exists message
      }
    } catch (err) {
      const error_message = `Error Adding Server: ${err.message}`;
      await this.client.functions.log(
        'error',
        `\x1b[34;1m[DATABASE]\x1b[0m ${error_message}`
      );
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
        await this.client.functions.log(
          'info',
          `\x1b[34;1m[DATABASE]\x1b[0m ${success_message}`
        );
        return { success: true, message: success_message };
      } else {
        const not_found_message = `Server ${identifier} Not Found In Region ${region}!`;
        await this.client.functions.log(
          'info',
          `\x1b[34;1m[DATABASE]\x1b[0m ${not_found_message}`
        );
        return { success: false, message: not_found_message };
      }
    } catch (err) {
      const error_message = `Error Removing Server: ${err.message}`;
      await this.client.functions.log(
        'error',
        `\x1b[34;1m[DATABASE]\x1b[0m ${error_message}`
      );
      throw new Error(error_message);
    }
  }
}
module.exports = STATS;
