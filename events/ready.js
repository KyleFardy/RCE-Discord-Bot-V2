module.exports = {
    name: 'ready', // Event name for when the client is ready
    async execute(client) {
        try {
            // Initialize the RCE (Rust Command Events) system
            await client.rce.init();

            // Log a message indicating successful login
            await client.functions.log("info", `Logged In As ${client.user.tag}!`);
        } catch (error) {
            // Log an error message if initialization fails
            await client.functions.log("error", `Failed To Initialize: ${error.message}`);

            // Exit the process with a non-zero status to indicate failure
            process.exit(1);
        }
    },
};
