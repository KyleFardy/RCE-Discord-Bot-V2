// Define a constant object to hold various RCE (Rust Command Events) event types
const RCEEvent = Object.freeze({
    Message: "message",                        // Event triggered when a message is sent
    PlayerKill: "player_kill",                // Event triggered when a player is killed
    PlayerJoined: "player_joined",            // Event triggered when a player joins the server
    PlayerLeft: "player_left",                 // Event triggered when a player leaves the server
    PlayerRespawned: "player_respawned",      // Event triggered when a player respawns
    PlayerSuicide: "player_suicide",          // Event triggered when a player commits suicide
    PlayerRoleAdd: "player_role_add",         // Event triggered when a role is added to a player
    QuickChat: "quick_chat",                  // Event triggered for quick chat messages
    NoteEdit: "note_edit",                    // Event triggered when a note is edited
    EventStart: "event_start",                // Event triggered when a general event starts
    PlayerListUpdate: "playerlist_update",    // Event triggered when the player list is updated
    ItemSpawn: "item_spawn",                  // Event triggered when an item spawns
    VendingMachineName: "vending_machine_name", // Event triggered when a vending machine is renamed
    KitSpawn: "kit_spawn",                    // Event triggered when a kit spawns
    KitGive: "kit_give",                      // Event triggered when a kit is given to a player
    TeamCreate: "team_create",                // Event triggered when a team is created
    TeamJoin: "team_join",                    // Event triggered when a player joins a team
    TeamLeave: "team_leave",                  // Event triggered when a player leaves a team
    SpecialEventStart: "special_event_start", // Event triggered when a special event starts
    SpecialEventEnd: "special_event_end",     // Event triggered when a special event ends
    ExecutingCommand: "executing_command",    // Event triggered when a command is being executed
    Error: "error",                           // Event triggered when an error occurs
    Log: "log",                               // Event triggered for logging purposes
    ServiceState: "service_state",            // Event triggered to report the service state
    CustomZoneAdded: "custom_zone_added",     // Event triggered when a custom zone is added
    CustomZoneRemoved: "custom_zone_removed", // Event triggered when a custom zone is removed
});

// Export the RCEEvent object for use in other modules
module.exports = RCEEvent;
